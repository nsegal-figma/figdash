import type { SurveyData } from '../../types/survey';

export interface CrossTabSuggestion {
  rowColumn: string;
  segmentColumn: string;
  score: number;
  cramersV: number;
  insight: string;
}

/**
 * Calculate Cramér's V - measure of association between two categorical variables
 * Range: 0 (no association) to 1 (perfect association)
 */
function calculateCramersV(
  contingencyTable: number[][],
  totalN: number
): number {
  // Calculate chi-square
  const rowTotals = contingencyTable.map(row => row.reduce((sum, val) => sum + val, 0));
  const colTotals = contingencyTable[0].map((_, colIdx) =>
    contingencyTable.reduce((sum, row) => sum + row[colIdx], 0)
  );

  let chiSquare = 0;
  for (let i = 0; i < contingencyTable.length; i++) {
    for (let j = 0; j < contingencyTable[i].length; j++) {
      const observed = contingencyTable[i][j];
      const expected = (rowTotals[i] * colTotals[j]) / totalN;
      if (expected > 0) {
        chiSquare += Math.pow(observed - expected, 2) / expected;
      }
    }
  }

  // Calculate Cramér's V
  const minDim = Math.min(contingencyTable.length - 1, contingencyTable[0].length - 1);
  if (minDim === 0) return 0;

  const cramersV = Math.sqrt(chiSquare / (totalN * minDim));
  return cramersV;
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
 * Analyze all possible cross-tab combinations and suggest the most interesting ones
 */
export function suggestCrossTabs(surveyData: SurveyData): CrossTabSuggestion[] {
  // Get categorical columns (skip IDs and text)
  const skipColumns = ['ResponseID', 'response_id', 'id', 'timestamp', 'Timestamp'];
  const categoricalColumns = surveyData.columns.filter(
    c => c.type === 'categorical' &&
    !skipColumns.some(skip => c.name.toLowerCase().includes(skip.toLowerCase()))
  );

  if (categoricalColumns.length < 2) return [];

  const suggestions: CrossTabSuggestion[] = [];

  // Test all pairs of categorical variables
  for (let i = 0; i < categoricalColumns.length; i++) {
    for (let j = i + 1; j < categoricalColumns.length; j++) {
      const col1 = categoricalColumns[i];
      const col2 = categoricalColumns[j];

      // Get paired observations (only rows where both values exist)
      const pairedValues: { val1: string | number; val2: string | number }[] = [];
      surveyData.rows.forEach(r => {
        const v1 = r[col1.name];
        const v2 = r[col2.name];
        if (v1 && v2) {
          pairedValues.push({ val1: v1, val2: v2 });
        }
      });

      if (pairedValues.length < 10) continue; // Need minimum sample size

      const values1 = pairedValues.map(p => p.val1);
      const values2 = pairedValues.map(p => p.val2);

      // Create contingency table
      const { table } = createContingencyTable(values1, values2);

      // Skip if table is too small or has no variance
      if (table.length < 2 || table[0].length < 2) continue;

      // Calculate Cramér's V using actual paired observation count
      const cramersV = Math.min(calculateCramersV(table, pairedValues.length), 1.0);

      // Generate insight
      let insight = '';
      if (cramersV > 0.3) {
        insight = 'Strong association detected';
      } else if (cramersV > 0.2) {
        insight = 'Moderate association';
      } else if (cramersV > 0.1) {
        insight = 'Weak but notable pattern';
      } else {
        insight = 'Minimal association';
      }

      // Calculate score (combination of association strength and variance)
      const score = cramersV;

      suggestions.push({
        rowColumn: col1.name,
        segmentColumn: col2.name,
        score,
        cramersV,
        insight,
      });
    }
  }

  // Sort by score (descending) and return top 5
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
