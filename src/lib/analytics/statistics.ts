export interface FrequencyDistribution {
  value: string | number;
  count: number;
  percentage: number;
}

export interface DescriptiveStats {
  count: number;
  mean: number;
  median: number;
  mode: number | number[];
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
}

export function calculateFrequencyDistribution(
  values: (string | number)[]
): FrequencyDistribution[] {
  const counts = new Map<string | number, number>();
  
  values.forEach(value => {
    if (value !== '' && value != null) {
      counts.set(value, (counts.get(value) || 0) + 1);
    }
  });

  const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);

  return Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  return sorted[mid];
}

export function calculateMode(values: number[]): number | number[] {
  if (values.length === 0) return 0;

  const counts = new Map<number, number>();
  values.forEach(value => {
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  const maxCount = Math.max(...counts.values());
  const modes = Array.from(counts.entries())
    .filter(([, count]) => count === maxCount)
    .map(([value]) => value);

  return modes.length === 1 ? modes[0] : modes;
}

export function calculateStdDev(values: number[], mean?: number): number {
  if (values.length === 0) return 0;
  
  const avg = mean !== undefined ? mean : calculateMean(values);
  const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  
  return Math.sqrt(variance);
}

export function calculateVariance(values: number[], mean?: number): number {
  if (values.length === 0) return 0;
  
  const avg = mean !== undefined ? mean : calculateMean(values);
  const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
  
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}

export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  
  if (Number.isInteger(index)) {
    return sorted[index];
  }
  
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function calculateDescriptiveStats(values: number[]): DescriptiveStats {
  const validValues = values.filter(v => !isNaN(v) && v !== null);
  
  if (validValues.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      mode: 0,
      stdDev: 0,
      variance: 0,
      min: 0,
      max: 0,
      range: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
    };
  }

  const mean = calculateMean(validValues);
  const median = calculateMedian(validValues);
  const mode = calculateMode(validValues);
  const stdDev = calculateStdDev(validValues, mean);
  const variance = calculateVariance(validValues, mean);
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  const q1 = calculatePercentile(validValues, 25);
  const q3 = calculatePercentile(validValues, 75);

  return {
    count: validValues.length,
    mean,
    median,
    mode,
    stdDev,
    variance,
    min,
    max,
    range: max - min,
    q1,
    q3,
    iqr: q3 - q1,
  };
}

export interface CrossTabulation {
  row: string;
  column: string;
  count: number;
  percentage: number;
}

export function calculateCrossTabulation(
  rowValues: (string | number)[],
  columnValues: (string | number)[]
): CrossTabulation[] {
  if (rowValues.length !== columnValues.length) {
    throw new Error('Row and column arrays must have the same length');
  }

  const counts = new Map<string, number>();
  const total = rowValues.length;

  for (let i = 0; i < rowValues.length; i++) {
    const key = `${rowValues[i]}|${columnValues[i]}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries()).map(([key, count]) => {
    const [row, column] = key.split('|');
    return {
      row,
      column,
      count,
      percentage: (count / total) * 100,
    };
  });
}





