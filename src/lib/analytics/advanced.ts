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




