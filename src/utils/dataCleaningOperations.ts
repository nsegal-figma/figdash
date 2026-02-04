/**
 * Data Cleaning Operations
 * Detection algorithms for survey data quality issues
 */

import type { SurveyData, Column } from '../types/survey';
import type {
  DuplicateIssue,
  SpeederIssue,
  StraightLinerIssue,
  OutlierIssue,
  MissingDataIssue,
  TextIssue,
  CleaningSettings,
} from '../types/cleaning';

/**
 * Calculate similarity between two response rows
 * Returns 0-1 where 1 is identical
 */
function calculateRowSimilarity(
  row1: Record<string, string | number>,
  row2: Record<string, string | number>,
  columns: string[]
): number {
  let matches = 0;
  let total = 0;

  columns.forEach((col) => {
    const val1 = row1[col];
    const val2 = row2[col];

    // Skip empty values
    if (val1 === '' || val1 == null || val2 === '' || val2 == null) {
      return;
    }

    total++;
    if (val1 === val2) {
      matches++;
    }
  });

  return total > 0 ? matches / total : 0;
}

/**
 * Detect duplicate responses
 */
export function detectDuplicates(
  surveyData: SurveyData,
  settings: CleaningSettings['duplicates']
): DuplicateIssue[] {
  if (!settings.enabled) return [];

  const issues: DuplicateIssue[] = [];
  const rows = surveyData.rows;

  // Try respondent ID comparison first
  if (settings.compareByRespondentId) {
    const idColumns = surveyData.columns.filter(
      (c) =>
        c.name.toLowerCase().includes('respondent') ||
        c.name.toLowerCase().includes('response') && c.name.toLowerCase().includes('id')
    );

    if (idColumns.length > 0) {
      const idCol = idColumns[0].name;
      const seen = new Map<string, number>();

      rows.forEach((row, index) => {
        const id = String(row[idCol]);
        if (id && id !== '') {
          const firstIndex = seen.get(id);
          if (firstIndex !== undefined) {
            issues.push({
              type: 'duplicate',
              rowIndices: [firstIndex, index],
              groupId: id,
              similarity: 1.0,
            });
          } else {
            seen.set(id, index);
          }
        }
      });

      if (issues.length > 0) return issues;
    }
  }

  // Fallback: similarity-based detection
  const comparisonColumns = surveyData.columns
    .filter((c) => c.type !== 'date' && !c.name.toLowerCase().includes('timestamp'))
    .map((c) => c.name);

  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const similarity = calculateRowSimilarity(rows[i], rows[j], comparisonColumns);

      if (similarity >= settings.similarityThreshold) {
        issues.push({
          type: 'duplicate',
          rowIndices: [i, j],
          groupId: `sim-${i}-${j}`,
          similarity,
        });
      }
    }
  }

  return issues;
}

/**
 * Detect speeders (too-fast responses)
 */
export function detectSpeeders(
  surveyData: SurveyData,
  settings: CleaningSettings['speeders']
): SpeederIssue[] {
  if (!settings.enabled) return [];

  const issues: SpeederIssue[] = [];

  // Find duration/time column
  const durationCol = surveyData.columns.find(
    (c) =>
      c.name.toLowerCase().includes('duration') ||
      c.name.toLowerCase().includes('time') && !c.name.toLowerCase().includes('start')
  );

  if (!durationCol) return issues;

  const durations = surveyData.rows
    .map((row, index) => ({
      index,
      duration: Number(row[durationCol.name]),
    }))
    .filter((d) => !isNaN(d.duration) && d.duration > 0);

  if (durations.length === 0) return issues;

  let threshold: number;

  if (settings.method === 'absolute' && settings.absoluteThreshold) {
    threshold = settings.absoluteThreshold;
  } else if (settings.method === 'percentile' && settings.percentileThreshold) {
    const sorted = [...durations].sort((a, b) => a.duration - b.duration);
    const percentileIndex = Math.floor((settings.percentileThreshold / 100) * sorted.length);
    threshold = sorted[percentileIndex].duration;
  } else if (settings.method === 'median-multiple' && settings.medianMultiple) {
    const sorted = [...durations].sort((a, b) => a.duration - b.duration);
    const median = sorted[Math.floor(sorted.length / 2)].duration;
    threshold = median * settings.medianMultiple;
  } else {
    return issues;
  }

  durations.forEach(({ index, duration }) => {
    if (duration < threshold) {
      // Calculate percentile
      const fasterCount = durations.filter((d) => d.duration < duration).length;
      const percentile = (fasterCount / durations.length) * 100;

      issues.push({
        type: 'speeder',
        rowIndex: index,
        completionTime: duration,
        threshold,
        percentile,
      });
    }
  });

  return issues;
}

/**
 * Detect straight-liners (low variance across Likert scales)
 */
export function detectStraightLiners(
  surveyData: SurveyData,
  settings: CleaningSettings['straightLiners']
): StraightLinerIssue[] {
  if (!settings.enabled) return [];

  const issues: StraightLinerIssue[] = [];

  // Identify Likert/satisfaction columns
  let likertColumns: string[];

  if (settings.likertColumns && settings.likertColumns.length > 0) {
    likertColumns = settings.likertColumns;
  } else {
    // Auto-detect: look for satisfaction, rating, agreement columns
    likertColumns = surveyData.columns
      .filter(
        (c) =>
          c.type === 'categorical' &&
          (c.name.toLowerCase().includes('satisfaction') ||
            c.name.toLowerCase().includes('satisfied') ||
            c.name.toLowerCase().includes('rating') ||
            c.name.toLowerCase().includes('agree') ||
            c.name.toLowerCase().includes('likely') ||
            c.name.toLowerCase().includes('quality'))
      )
      .map((c) => c.name);
  }

  if (likertColumns.length < settings.minimumQuestions) return issues;

  surveyData.rows.forEach((row, rowIndex) => {
    const values: number[] = [];

    likertColumns.forEach((col) => {
      const value = row[col];
      if (value !== '' && value != null) {
        // Try to convert to number (works for numeric Likert scales)
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          values.push(numValue);
        }
      }
    });

    // Need minimum number of responses to calculate variance
    if (values.length >= settings.minimumQuestions) {
      // Calculate variance
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance =
        values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

      if (variance < settings.varianceThreshold) {
        issues.push({
          type: 'straightLiner',
          rowIndex,
          columns: likertColumns,
          variance,
          threshold: settings.varianceThreshold,
        });
      }
    }
  });

  return issues;
}

/**
 * Calculate IQR outliers
 */
function detectOutliersIQR(values: number[], iqrMultiple: number): Set<number> {
  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - iqrMultiple * iqr;
  const upperBound = q3 + iqrMultiple * iqr;

  const outlierIndices = new Set<number>();
  values.forEach((value, index) => {
    if (value < lowerBound || value > upperBound) {
      outlierIndices.add(index);
    }
  });

  return outlierIndices;
}

/**
 * Calculate Z-score outliers
 */
function detectOutliersZScore(values: number[], threshold: number): Set<number> {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const outlierIndices = new Set<number>();

  if (stdDev === 0) return outlierIndices;

  values.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev);
    if (zScore > threshold) {
      outlierIndices.add(index);
    }
  });

  return outlierIndices;
}

/**
 * Detect outliers in numeric columns
 */
export function detectOutliers(
  surveyData: SurveyData,
  settings: CleaningSettings['outliers']
): OutlierIssue[] {
  if (!settings.enabled) return [];

  const issues: OutlierIssue[] = [];

  const numericColumns = settings.columns
    ? surveyData.columns.filter(
        (c) => c.type === 'number' && settings.columns?.includes(c.name)
      )
    : surveyData.columns.filter((c) => c.type === 'number');

  numericColumns.forEach((column) => {
    const values: { value: number; rowIndex: number }[] = [];

    surveyData.rows.forEach((row, index) => {
      const value = Number(row[column.name]);
      if (!isNaN(value)) {
        values.push({ value, rowIndex: index });
      }
    });

    if (values.length < 10) return; // Need sufficient data

    const numericValues = values.map((v) => v.value);

    let outlierIndices: Set<number>;

    if (settings.method === 'zscore') {
      const threshold = settings.zScoreThreshold || 3;
      outlierIndices = detectOutliersZScore(numericValues, threshold);
    } else {
      const multiple = settings.iqrMultiple || 1.5;
      outlierIndices = detectOutliersIQR(numericValues, multiple);
    }

    outlierIndices.forEach((localIndex) => {
      const { value, rowIndex } = values[localIndex];
      const mean = numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length;
      const variance =
        numericValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / numericValues.length;
      const stdDev = Math.sqrt(variance);
      const zScore = stdDev > 0 ? Math.abs((value - mean) / stdDev) : 0;

      issues.push({
        type: 'outlier',
        rowIndex,
        column: column.name,
        value,
        method: settings.method,
        score: zScore,
      });
    });
  });

  return issues;
}

/**
 * Detect missing data patterns
 */
export function detectMissingData(
  surveyData: SurveyData,
  settings: CleaningSettings['missingData']
): MissingDataIssue[] {
  if (!settings.enabled) return [];

  const issues: MissingDataIssue[] = [];

  const columnsToCheck = settings.columns
    ? surveyData.columns.filter((c) => settings.columns?.includes(c.name))
    : surveyData.columns;

  columnsToCheck.forEach((column) => {
    const rowIndices: number[] = [];

    surveyData.rows.forEach((row, index) => {
      const value = row[column.name];
      if (value === '' || value == null || value === 'N/A' || value === 'null') {
        rowIndices.push(index);
      }
    });

    const missingCount = rowIndices.length;
    const percentage = (missingCount / surveyData.rows.length) * 100;

    // Only flag if above threshold
    if (settings.threshold && percentage >= settings.threshold) {
      issues.push({
        type: 'missingData',
        column: column.name,
        rowIndices,
        missingCount,
        totalCount: surveyData.rows.length,
        percentage,
      });
    }
  });

  return issues;
}

/**
 * Detect text quality issues
 */
export function detectTextIssues(
  surveyData: SurveyData,
  settings: CleaningSettings['textCleaning']
): TextIssue[] {
  if (!settings.enabled || !settings.detectGibberish) return [];

  const issues: TextIssue[] = [];

  const textColumns = surveyData.columns.filter((c) => c.type === 'text');

  textColumns.forEach((column) => {
    surveyData.rows.forEach((row, rowIndex) => {
      const value = String(row[column.name] || '');

      if (value.trim() === '') return;

      const detectedIssues: string[] = [];

      // Too short
      if (value.trim().length < settings.minimumLength) {
        detectedIssues.push('too-short');
      }

      // Repeated characters (e.g., "aaaaa", "12121212")
      const repeatedPattern = new RegExp(
        `(.)\\1{${settings.maximumRepeatedChars},}`,
        'i'
      );
      if (repeatedPattern.test(value)) {
        detectedIssues.push('repeated-chars');
      }

      // All same character
      if (value.length > 3 && new Set(value.split('')).size === 1) {
        detectedIssues.push('single-char-repeated');
      }

      // Keyboard mashing patterns (sequential keys)
      const mashPatterns = ['asdf', 'qwer', 'zxcv', '1234', 'abcd'];
      if (mashPatterns.some((pattern) => value.toLowerCase().includes(pattern))) {
        detectedIssues.push('keyboard-mashing');
      }

      // No vowels (likely gibberish for languages with vowels)
      const hasVowels = /[aeiou]/i.test(value);
      if (!hasVowels && value.length > 3) {
        detectedIssues.push('no-vowels');
      }

      // Very high consonant-to-vowel ratio
      const consonants = (value.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
      const vowels = (value.match(/[aeiou]/gi) || []).length;
      if (vowels > 0 && consonants / vowels > 5) {
        detectedIssues.push('unusual-consonant-ratio');
      }

      if (detectedIssues.length > 0) {
        issues.push({
          type: 'textIssue',
          rowIndex,
          column: column.name,
          value,
          issues: detectedIssues,
        });
      }
    });
  });

  return issues;
}

/**
 * Clean text value based on settings
 */
export function cleanTextValue(value: string, settings: CleaningSettings['textCleaning']): string {
  let cleaned = value;

  if (settings.trimWhitespace) {
    cleaned = cleaned.trim();
  }

  if (settings.removeUrls) {
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/gi, '');
  }

  if (settings.removeSpecialChars) {
    // Keep alphanumeric, spaces, and basic punctuation
    cleaned = cleaned.replace(/[^a-zA-Z0-9\s.,!?'-]/g, '');
  }

  return cleaned;
}

/**
 * Impute missing values for a column
 */
export function imputeMissingValues(
  column: Column,
  rows: Record<string, string | number>[],
  strategy: CleaningSettings['missingData']['strategy']
): Record<string, string | number>[] {
  if (strategy === 'leave' || strategy === 'flag') {
    return rows; // No imputation
  }

  if (strategy === 'remove') {
    // Filter out rows with missing values in this column
    return rows.filter((row) => {
      const value = row[column.name];
      return value !== '' && value != null && value !== 'N/A';
    });
  }

  // Imputation strategies
  const values: (string | number)[] = [];
  rows.forEach((row) => {
    const value = row[column.name];
    if (value !== '' && value != null && value !== 'N/A') {
      values.push(value);
    }
  });

  if (values.length === 0) return rows;

  let imputeValue: string | number;

  if (column.type === 'number') {
    const numericValues = values.map(Number).filter((v) => !isNaN(v));
    if (numericValues.length === 0) return rows;

    if (strategy === 'impute-mean') {
      imputeValue = numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length;
    } else if (strategy === 'impute-median') {
      const sorted = [...numericValues].sort((a, b) => a - b);
      imputeValue = sorted[Math.floor(sorted.length / 2)];
    } else {
      // Mode for numbers (most frequent)
      const counts = new Map<number, number>();
      numericValues.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
      imputeValue = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
    }
  } else {
    // Mode for categorical/text
    const counts = new Map<string, number>();
    values.forEach((v) => counts.set(String(v), (counts.get(String(v)) || 0) + 1));
    imputeValue = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }

  // Apply imputation
  return rows.map((row) => {
    const value = row[column.name];
    if (value === '' || value == null || value === 'N/A') {
      return { ...row, [column.name]: imputeValue };
    }
    return row;
  });
}

/**
 * Calculate completeness score for a row (% of non-empty values)
 */
export function calculateRowCompleteness(
  row: Record<string, string | number>,
  columns: string[]
): number {
  let filledCount = 0;

  columns.forEach((col) => {
    const value = row[col];
    if (value !== '' && value != null) {
      filledCount++;
    }
  });

  return filledCount / columns.length;
}
