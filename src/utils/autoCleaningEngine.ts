/**
 * Auto-Cleaning Engine
 * Orchestrates all cleaning operations in AUTO mode
 */

import type { SurveyData } from '../types/survey';
import type {
  CleaningSettings,
  CleaningReport,
  CleaningAction,
  DuplicateIssue,
} from '../types/cleaning';
import {
  detectDuplicates,
  detectSpeeders,
  detectStraightLiners,
  detectOutliers,
  detectMissingData,
  detectTextIssues,
  cleanTextValue,
  imputeMissingValues,
  calculateRowCompleteness,
} from './dataCleaningOperations';
import { generateCleaningReport } from './reportGenerator';

interface CleaningResult {
  cleanedData: SurveyData;
  report: CleaningReport;
}

/**
 * Run auto-cleaning with all enabled operations
 */
export async function runAutoCleaning(
  surveyData: SurveyData,
  settings: CleaningSettings
): Promise<CleaningResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const warnings: string[] = [];
  const actionsApplied: CleaningAction[] = [];

  // Store original stats
  const originalRowCount = surveyData.rows.length;
  const originalColumnCount = surveyData.columns.length;

  // Run all detection algorithms
  let duplicates: DuplicateIssue[] = [];
  let speeders;
  let straightLiners;
  let outliers;
  let missingData;
  let textIssues;

  try {
    duplicates = detectDuplicates(surveyData, settings.duplicates);
  } catch (error) {
    errors.push(`Duplicate detection failed: ${error}`);
  }

  try {
    speeders = detectSpeeders(surveyData, settings.speeders);
  } catch (error) {
    errors.push(`Speeder detection failed: ${error}`);
  }

  try {
    straightLiners = detectStraightLiners(surveyData, settings.straightLiners);
  } catch (error) {
    errors.push(`Straight-liner detection failed: ${error}`);
  }

  try {
    outliers = detectOutliers(surveyData, settings.outliers);
  } catch (error) {
    errors.push(`Outlier detection failed: ${error}`);
  }

  try {
    missingData = detectMissingData(surveyData, settings.missingData);
  } catch (error) {
    errors.push(`Missing data detection failed: ${error}`);
  }

  try {
    textIssues = detectTextIssues(surveyData, settings.textCleaning);
  } catch (error) {
    errors.push(`Text issue detection failed: ${error}`);
  }

  // Start with original data
  let cleanedRows = [...surveyData.rows];
  let cleanedColumns = [...surveyData.columns];

  // Apply cleaning operations in order

  // 1. Text Cleaning
  if (settings.textCleaning.enabled) {
    const textColumns = cleanedColumns.filter((c) => c.type === 'text');
    let cleanedCount = 0;

    cleanedRows = cleanedRows.map((row) => {
      const newRow = { ...row };
      textColumns.forEach((col) => {
        const original = String(newRow[col.name] || '');
        const cleaned = cleanTextValue(original, settings.textCleaning);
        if (cleaned !== original) {
          newRow[col.name] = cleaned;
          cleanedCount++;
        }
      });
      return newRow;
    });

    if (cleanedCount > 0) {
      actionsApplied.push({
        type: 'textIssue',
        description: 'Cleaned text values (trimmed whitespace, removed URLs/special chars)',
        affected: {
          columns: textColumns.map((c) => c.name),
          count: cleanedCount,
        },
      });
    }
  }

  // 2. Missing Data Imputation
  if (settings.missingData.enabled && settings.missingData.strategy !== 'leave') {
    missingData?.forEach((issue) => {
      const column = cleanedColumns.find((c) => c.name === issue.column);
      if (column) {
        const before = cleanedRows.length;
        cleanedRows = imputeMissingValues(column, cleanedRows, settings.missingData.strategy);
        const after = cleanedRows.length;

        actionsApplied.push({
          type: 'missingData',
          description: `Applied ${settings.missingData.strategy} to ${issue.column}`,
          affected: {
            columns: [issue.column],
            count: settings.missingData.strategy === 'remove' ? before - after : issue.missingCount,
          },
        });
      }
    });
  }

  // 3. Remove problematic rows (duplicates, speeders, straight-liners)
  const rowsToRemove = new Set<number>();

  // Remove duplicates (keep best based on strategy)
  if (settings.duplicates.enabled && duplicates.length > 0) {
    duplicates.forEach((dup) => {
      const comparisonColumns = cleanedColumns.map((c) => c.name);

      if (settings.duplicates.keepStrategy === 'first') {
        // Remove all except first
        dup.rowIndices.slice(1).forEach((idx) => rowsToRemove.add(idx));
      } else if (settings.duplicates.keepStrategy === 'last') {
        // Remove all except last
        dup.rowIndices.slice(0, -1).forEach((idx) => rowsToRemove.add(idx));
      } else {
        // Keep most complete
        const completeness = dup.rowIndices.map((idx) => ({
          idx,
          completeness: calculateRowCompleteness(cleanedRows[idx], comparisonColumns),
        }));
        completeness.sort((a, b) => b.completeness - a.completeness);

        // Remove all except most complete
        completeness.slice(1).forEach((c) => rowsToRemove.add(c.idx));
      }
    });

    if (rowsToRemove.size > 0) {
      actionsApplied.push({
        type: 'duplicate',
        description: `Removed duplicate responses (kept ${settings.duplicates.keepStrategy})`,
        affected: {
          rows: Array.from(rowsToRemove),
          count: rowsToRemove.size,
        },
      });
    }
  }

  // Remove speeders
  if (settings.speeders.enabled && speeders && speeders.length > 0) {
    speeders.forEach((speeder) => rowsToRemove.add(speeder.rowIndex));

    actionsApplied.push({
      type: 'speeder',
      description: `Removed speeder responses (< ${speeders[0]?.threshold?.toFixed(0)}s)`,
      affected: {
        rows: speeders.map((s) => s.rowIndex),
        count: speeders.length,
      },
    });
  }

  // Remove straight-liners
  if (settings.straightLiners.enabled && straightLiners && straightLiners.length > 0) {
    straightLiners.forEach((sl) => rowsToRemove.add(sl.rowIndex));

    actionsApplied.push({
      type: 'straightLiner',
      description: `Removed straight-liner responses (variance < ${settings.straightLiners.varianceThreshold})`,
      affected: {
        rows: straightLiners.map((sl) => sl.rowIndex),
        count: straightLiners.length,
      },
    });
  }

  // Apply row removals
  if (rowsToRemove.size > 0) {
    cleanedRows = cleanedRows.filter((_, index) => !rowsToRemove.has(index));
  }

  // 4. Handle outliers (if action is 'remove' or 'cap')
  if (settings.outliers.enabled && outliers && outliers.length > 0) {
    if (settings.outliers.action === 'remove') {
      const outlierRows = new Set(outliers.map((o) => o.rowIndex));
      cleanedRows = cleanedRows.filter((_, index) => !outlierRows.has(index));

      actionsApplied.push({
        type: 'outlier',
        description: `Removed rows with statistical outliers (${settings.outliers.method})`,
        affected: {
          rows: Array.from(outlierRows),
          count: outlierRows.size,
        },
      });
    } else if (settings.outliers.action === 'cap') {
      // Winsorize outliers
      const outliersByColumn = new Map<string, typeof outliers>();
      outliers.forEach((o) => {
        const existing = outliersByColumn.get(o.column) || [];
        existing.push(o);
        outliersByColumn.set(o.column, existing);
      });

      outliersByColumn.forEach((colOutliers, columnName) => {
        const values = cleanedRows.map((r) => Number(r[columnName])).filter((v) => !isNaN(v));
        const sorted = [...values].sort((a, b) => a - b);
        const p5 = sorted[Math.floor(sorted.length * 0.05)];
        const p95 = sorted[Math.floor(sorted.length * 0.95)];

        colOutliers.forEach((outlier) => {
          if (outlier.value < p5) {
            cleanedRows[outlier.rowIndex][columnName] = p5;
          } else if (outlier.value > p95) {
            cleanedRows[outlier.rowIndex][columnName] = p95;
          }
        });
      });

      actionsApplied.push({
        type: 'outlier',
        description: `Capped outliers to 5th/95th percentiles`,
        affected: {
          columns: Array.from(outliersByColumn.keys()),
          count: outliers.length,
        },
      });
    } else {
      // Just flag, no action
      warnings.push(`${outliers.length} outliers detected but not removed (action='flag')`);
    }
  }

  // Create cleaned survey data
  const cleanedData: SurveyData = {
    fileName: surveyData.fileName,
    columns: cleanedColumns,
    rows: cleanedRows,
    totalRows: cleanedRows.length,
    uploadedAt: new Date(),
  };

  // Generate report
  const report = generateCleaningReport(
    originalRowCount,
    originalColumnCount,
    cleanedRows.length,
    cleanedColumns.length,
    {
      duplicates: duplicates || [],
      speeders: speeders || [],
      straightLiners: straightLiners || [],
      outliers: outliers || [],
      missingData: missingData || [],
      textIssues: textIssues || [],
    },
    actionsApplied,
    settings,
    startTime,
    errors,
    warnings
  );

  return {
    cleanedData,
    report,
  };
}
