import type { SurveyData } from '../../types/survey';

export interface CrossTabSuggestion {
  rowColumn: string;
  segmentColumn: string;
  score: number;
  cramersV: number;
  insight: string;
}

/**
 * Approximate chi-square survival function P(χ² > x) using Wilson-Hilferty.
 * Returns a p-value estimate — good enough for suggestion filtering.
 */
function chiSquarePValue(chiSquare: number, df: number): number {
  if (df <= 0 || chiSquare <= 0) return 1;

  // Wilson-Hilferty normal approximation
  const k = df;
  const z = Math.pow(chiSquare / k, 1 / 3) - (1 - 2 / (9 * k));
  const se = Math.sqrt(2 / (9 * k));
  const zScore = z / se;

  // Standard normal CDF approximation (Abramowitz & Stegun)
  const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
  const d = 0.3989422804014327; // 1/sqrt(2π)
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const cdf = zScore >= 0
    ? 1 - d * Math.exp(-0.5 * zScore * zScore) * poly
    : d * Math.exp(-0.5 * zScore * zScore) * poly;

  // P(χ² > x) = 1 - CDF
  return 1 - cdf;
}

/**
 * Calculate Cramér's V - measure of association between two categorical variables
 * Range: 0 (no association) to 1 (perfect association)
 */
function calculateCramersV(
  contingencyTable: number[][],
  totalN: number
): { cramersV: number; chiSquare: number; df: number } {
  const rows = contingencyTable.length;
  const cols = contingencyTable[0].length;

  // Calculate chi-square
  const rowTotals = contingencyTable.map(row => row.reduce((sum, val) => sum + val, 0));
  const colTotals = contingencyTable[0].map((_, colIdx) =>
    contingencyTable.reduce((sum, row) => sum + row[colIdx], 0)
  );

  let chiSquare = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const observed = contingencyTable[i][j];
      const expected = (rowTotals[i] * colTotals[j]) / totalN;
      if (expected > 0) {
        chiSquare += Math.pow(observed - expected, 2) / expected;
      }
    }
  }

  const minDim = Math.min(rows - 1, cols - 1);
  const df = (rows - 1) * (cols - 1);
  if (minDim === 0) return { cramersV: 0, chiSquare: 0, df: 0 };

  const cramersV = Math.sqrt(chiSquare / (totalN * minDim));
  return { cramersV, chiSquare, df };
}

/**
 * Create contingency table for two categorical variables
 */
function createContingencyTable(
  rowValues: (string | number)[],
  colValues: (string | number)[]
): { table: number[][]; rowLabels: string[]; colLabels: string[] } {
  const uniqueRows = [...new Set(rowValues.filter(v => v))].map(String);
  const uniqueCols = [...new Set(colValues.filter(v => v))].map(String);

  const table: number[][] = [];

  for (const rowLabel of uniqueRows) {
    const row: number[] = [];
    for (const colLabel of uniqueCols) {
      let count = 0;
      for (let i = 0; i < rowValues.length; i++) {
        if (String(rowValues[i]) === rowLabel && String(colValues[i]) === colLabel) {
          count++;
        }
      }
      row.push(count);
    }
    table.push(row);
  }

  return {
    table,
    rowLabels: uniqueRows,
    colLabels: uniqueCols,
  };
}

/**
 * Check if two columns are near-duplicates (e.g. same question asked differently).
 * Columns with V > 0.95 or very similar names are likely redundant.
 */
function columnsAreSimilar(name1: string, name2: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const n1 = normalize(name1);
  const n2 = normalize(name2);

  // One name contains the other
  if (n1.includes(n2) || n2.includes(n1)) return true;

  return false;
}

/**
 * Check that a column has meaningful variation — at least 2 categories
 * each with ≥ 5% of responses. Single-dominant columns aren't interesting.
 */
function hasMeaningfulVariation(values: (string | number)[], minSharePct = 5): boolean {
  const counts = new Map<string, number>();
  for (const v of values) {
    const key = String(v);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const total = values.length;
  const threshold = total * (minSharePct / 100);
  let categoriesAboveThreshold = 0;
  for (const count of counts.values()) {
    if (count >= threshold) categoriesAboveThreshold++;
  }

  return categoriesAboveThreshold >= 2;
}

/**
 * Analyze all possible cross-tab combinations and suggest the most interesting ones.
 *
 * Filters for meaningful associations:
 * - Chi-square test significance (p < 0.05)
 * - Minimum effect size (Cramér's V ≥ 0.15)
 * - Not near-duplicate columns (V < 0.95, dissimilar names)
 * - Both columns have meaningful variation
 * - Minimum sample size (n ≥ 20)
 */
export function suggestCrossTabs(surveyData: SurveyData): CrossTabSuggestion[] {
  const skipColumns = ['ResponseID', 'response_id', 'id', 'timestamp', 'Timestamp'];
  const categoricalColumns = surveyData.columns.filter(
    c => c.type === 'categorical' &&
    !skipColumns.some(skip => c.name.toLowerCase().includes(skip.toLowerCase()))
  );

  if (categoricalColumns.length < 2) return [];

  const suggestions: CrossTabSuggestion[] = [];

  for (let i = 0; i < categoricalColumns.length; i++) {
    for (let j = i + 1; j < categoricalColumns.length; j++) {
      const col1 = categoricalColumns[i];
      const col2 = categoricalColumns[j];

      // Skip columns with very similar names (likely measuring the same thing)
      if (columnsAreSimilar(col1.name, col2.name)) continue;

      // Get paired observations (only rows where both values exist)
      const pairedValues: { val1: string | number; val2: string | number }[] = [];
      surveyData.rows.forEach(r => {
        const v1 = r[col1.name];
        const v2 = r[col2.name];
        if (v1 && v2) {
          pairedValues.push({ val1: v1, val2: v2 });
        }
      });

      // Require minimum sample size of 20 for reliable chi-square
      if (pairedValues.length < 20) continue;

      const values1 = pairedValues.map(p => p.val1);
      const values2 = pairedValues.map(p => p.val2);

      // Both columns must have meaningful variation
      if (!hasMeaningfulVariation(values1) || !hasMeaningfulVariation(values2)) continue;

      // Create contingency table
      const { table } = createContingencyTable(values1, values2);
      if (table.length < 2 || table[0].length < 2) continue;

      // Calculate Cramér's V and chi-square
      const { cramersV, chiSquare, df } = calculateCramersV(table, pairedValues.length);
      const v = Math.min(cramersV, 1.0);

      // Filter: minimum effect size — weak associations aren't worth suggesting
      if (v < 0.15) continue;

      // Filter: near-deterministic — likely duplicate/derived columns
      if (v > 0.95) continue;

      // Filter: statistical significance — chi-square p-value must be < 0.05
      const pValue = chiSquarePValue(chiSquare, df);
      if (pValue >= 0.05) continue;

      // Generate descriptive insight
      let insight = '';
      if (v > 0.3) {
        insight = 'Strong association — responses differ substantially across groups';
      } else if (v > 0.2) {
        insight = 'Moderate association — notable response pattern differences';
      } else {
        insight = 'Mild but statistically significant association';
      }

      suggestions.push({
        rowColumn: col1.name,
        segmentColumn: col2.name,
        score: v,
        cramersV: v,
        insight,
      });
    }
  }

  // Sort by score (descending) and return top 5
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
