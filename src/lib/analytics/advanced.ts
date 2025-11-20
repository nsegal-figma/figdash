export interface CorrelationResult {
  coefficient: number;
  type: 'pearson' | 'spearman';
  strength: 'very weak' | 'weak' | 'moderate' | 'strong' | 'very strong';
  direction: 'positive' | 'negative' | 'none';
}

export interface ChiSquareResult {
  chiSquare: number;
  degreesOfFreedom: number;
  pValue: number;
  isSignificant: boolean;
}

export interface TTestResult {
  tStatistic: number;
  degreesOfFreedom: number;
  pValue: number;
  isSignificant: boolean;
  meanDifference: number;
}

export function calculatePearsonCorrelation(x: number[], y: number[]): CorrelationResult {
  if (x.length !== y.length || x.length === 0) {
    return {
      coefficient: 0,
      type: 'pearson',
      strength: 'very weak',
      direction: 'none',
    };
  }

  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  const coefficient = denominator === 0 ? 0 : numerator / denominator;

  return {
    coefficient,
    type: 'pearson',
    ...interpretCorrelation(coefficient),
  };
}

export function calculateSpearmanCorrelation(x: number[], y: number[]): CorrelationResult {
  if (x.length !== y.length || x.length === 0) {
    return {
      coefficient: 0,
      type: 'spearman',
      strength: 'very weak',
      direction: 'none',
    };
  }

  // Rank the data
  const rankX = getRanks(x);
  const rankY = getRanks(y);

  // Calculate Pearson correlation on ranks
  const result = calculatePearsonCorrelation(rankX, rankY);

  return {
    ...result,
    type: 'spearman',
  };
}

function getRanks(values: number[]): number[] {
  const indexed = values.map((value, index) => ({ value, index }));
  indexed.sort((a, b) => a.value - b.value);

  const ranks = new Array(values.length);
  let currentRank = 1;

  for (let i = 0; i < indexed.length; i++) {
    let j = i;
    const currentValue = indexed[i].value;
    
    // Find all ties
    while (j < indexed.length && indexed[j].value === currentValue) {
      j++;
    }

    // Calculate average rank for ties
    const avgRank = (currentRank + (currentRank + j - i - 1)) / 2;

    // Assign average rank to all ties
    for (let k = i; k < j; k++) {
      ranks[indexed[k].index] = avgRank;
    }

    currentRank += (j - i);
    i = j - 1;
  }

  return ranks;
}

function interpretCorrelation(coefficient: number): {
  strength: 'very weak' | 'weak' | 'moderate' | 'strong' | 'very strong';
  direction: 'positive' | 'negative' | 'none';
} {
  const abs = Math.abs(coefficient);
  
  let strength: 'very weak' | 'weak' | 'moderate' | 'strong' | 'very strong';
  if (abs < 0.2) strength = 'very weak';
  else if (abs < 0.4) strength = 'weak';
  else if (abs < 0.6) strength = 'moderate';
  else if (abs < 0.8) strength = 'strong';
  else strength = 'very strong';

  const direction = coefficient > 0.1 ? 'positive' : coefficient < -0.1 ? 'negative' : 'none';

  return { strength, direction };
}

export function calculateTTest(group1: number[], group2: number[]): TTestResult {
  if (group1.length === 0 || group2.length === 0) {
    return {
      tStatistic: 0,
      degreesOfFreedom: 0,
      pValue: 1,
      isSignificant: false,
      meanDifference: 0,
    };
  }

  const mean1 = group1.reduce((sum, val) => sum + val, 0) / group1.length;
  const mean2 = group2.reduce((sum, val) => sum + val, 0) / group2.length;
  const meanDifference = mean1 - mean2;

  const variance1 = group1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (group1.length - 1);
  const variance2 = group2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (group2.length - 1);

  const pooledVariance = ((group1.length - 1) * variance1 + (group2.length - 1) * variance2) / 
                         (group1.length + group2.length - 2);

  const standardError = Math.sqrt(pooledVariance * (1 / group1.length + 1 / group2.length));
  const tStatistic = standardError === 0 ? 0 : meanDifference / standardError;
  const degreesOfFreedom = group1.length + group2.length - 2;

  // Simplified p-value approximation (for demonstration)
  const pValue = calculatePValue(Math.abs(tStatistic), degreesOfFreedom);

  return {
    tStatistic,
    degreesOfFreedom,
    pValue,
    isSignificant: pValue < 0.05,
    meanDifference,
  };
}

function calculatePValue(t: number, df: number): number {
  // Simplified approximation using normal distribution for large df
  if (df > 30) {
    // Use normal approximation
    return 2 * (1 - normalCDF(t));
  }
  
  // For smaller df, use a rough approximation
  const x = df / (df + t * t);
  return Math.max(0, Math.min(1, x));
}

function normalCDF(x: number): number {
  // Approximation of cumulative distribution function for standard normal
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  return x > 0 ? 1 - prob : prob;
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  confidence: number;
}

export function calculateConfidenceInterval(
  values: number[],
  confidence: number = 0.95
): ConfidenceInterval {
  if (values.length === 0) {
    return { lower: 0, upper: 0, confidence };
  }

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  );

  // Z-score for confidence level (approximate)
  const zScore = confidence === 0.95 ? 1.96 : confidence === 0.99 ? 2.576 : 1.645;
  const margin = zScore * (stdDev / Math.sqrt(values.length));

  return {
    lower: mean - margin,
    upper: mean + margin,
    confidence,
  };
}

// Dynamic visualization generator for ALL columns
export interface ColumnVisualization {
  columnName: string;
  title: string;
  type: 'categorical' | 'numeric' | 'text';
  visualization: 'bar' | 'average' | 'text_analysis';
  data: Array<{ name: string; value: number; count?: number }>;
  n: number;
}

export function generateAllVisualizations(
  columns: any[],
  rows: Record<string, any>[]
): ColumnVisualization[] {
  const visualizations: ColumnVisualization[] = [];
  const skipColumns = ['ResponseID', 'response_id', 'id', 'timestamp', 'Timestamp'];

  columns.forEach(column => {
    // Skip ID/timestamp columns
    if (skipColumns.some(skip => column.name.toLowerCase().includes(skip.toLowerCase()))) {
      return;
    }

    const values = rows.map(r => r[column.name]).filter(v => v !== '' && v != null);

    if (values.length === 0) return;

    // CATEGORICAL: Show frequency distribution
    if (column.type === 'categorical') {
      const counts = new Map<string, number>();
      values.forEach(v => {
        const key = String(v);
        counts.set(key, (counts.get(key) || 0) + 1);
      });

      const data = Array.from(counts.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      visualizations.push({
        columnName: column.name,
        title: formatColumnTitle(column.name),
        type: 'categorical',
        visualization: 'bar',
        data,
        n: values.length,
      });
    }

    // NUMERIC: Show average/distribution
    else if (column.type === 'number') {
      // Filter out 0s if this looks like a satisfaction/rating scale (0 = N/A)
      const numValues = values.map(v => Number(v)).filter(v => !isNaN(v));
      const isSatisfactionScale = column.name.toLowerCase().includes('satisfaction') ||
                                   column.name.toLowerCase().includes('rating');

      // For satisfaction scales, exclude 0 (N/A)
      const validValues = isSatisfactionScale
        ? numValues.filter(v => v > 0)
        : numValues;

      if (validValues.length === 0) return;

      const uniqueValues = new Set(validValues);
      const maxVal = Math.max(...validValues);
      const isScale = uniqueValues.size <= 10 && maxVal <= 10;

      if (isScale) {
        // Show frequency distribution for scales
        const counts = new Map<number, number>();
        validValues.forEach(v => {
          counts.set(v, (counts.get(v) || 0) + 1);
        });

        const data = Array.from(counts.entries())
          .map(([name, value]) => ({ name: String(name), value }))
          .sort((a, b) => Number(a.name) - Number(b.name));

        visualizations.push({
          columnName: column.name,
          title: formatColumnTitle(column.name) + (isSatisfactionScale ? ' (1-5 scale, excluding N/A)' : ''),
          type: 'numeric',
          visualization: 'bar',
          data,
          n: validValues.length,
        });
      } else {
        // Show average for continuous numbers
        const avg = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
        visualizations.push({
          columnName: column.name,
          title: formatColumnTitle(column.name),
          type: 'numeric',
          visualization: 'average',
          data: [{ name: 'Average', value: Math.round(avg * 10) / 10, count: validValues.length }],
          n: validValues.length,
        });
      }
    }

    // TEXT: Flag for text analysis
    else if (column.type === 'text') {
      visualizations.push({
        columnName: column.name,
        title: formatColumnTitle(column.name),
        type: 'text',
        visualization: 'text_analysis',
        data: [],
        n: values.length,
      });
    }
  });

  return visualizations;
}

function formatColumnTitle(columnName: string): string {
  // Convert "Q1_Discover" to "Q1: Discover"
  // Convert "Q4_Satisfaction_PrimaryResearch" to "Q4: Satisfaction - Primary Research"

  let title = columnName;

  // Handle Q# patterns
  const qMatch = columnName.match(/^(Q\d+)_(.+)$/);
  if (qMatch) {
    const qNum = qMatch[1];
    const rest = qMatch[2]
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim();
    title = `${qNum}: ${rest}`;
  } else {
    // Just clean up underscores and camelCase
    title = columnName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim();
  }

  return title;
}





