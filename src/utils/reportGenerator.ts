/**
 * Report Generator
 * Generate comprehensive cleaning reports
 */

import type {
  CleaningReport,
  CleaningSettings,
  CleaningAction,
  DuplicateIssue,
  SpeederIssue,
  StraightLinerIssue,
  OutlierIssue,
  MissingDataIssue,
  TextIssue,
} from '../types/cleaning';

/**
 * Group duplicate issues by group ID
 */
function groupDuplicates(issues: DuplicateIssue[]): DuplicateIssue[] {
  const grouped = new Map<string, number[]>();

  issues.forEach((issue) => {
    const existing = grouped.get(issue.groupId) || [];
    existing.push(...issue.rowIndices);
    grouped.set(issue.groupId, Array.from(new Set(existing)));
  });

  return Array.from(grouped.entries()).map(([groupId, rowIndices]) => ({
    type: 'duplicate' as const,
    groupId,
    rowIndices,
    similarity: 1.0,
  }));
}

/**
 * Generate comprehensive cleaning report
 */
export function generateCleaningReport(
  originalRowCount: number,
  originalColumnCount: number,
  finalRowCount: number,
  finalColumnCount: number,
  issues: {
    duplicates: DuplicateIssue[];
    speeders: SpeederIssue[];
    straightLiners: StraightLinerIssue[];
    outliers: OutlierIssue[];
    missingData: MissingDataIssue[];
    textIssues: TextIssue[];
  },
  actionsApplied: CleaningAction[],
  settings: CleaningSettings,
  startTime: number,
  errors: string[] = [],
  warnings: string[] = []
): CleaningReport {
  const endTime = Date.now();

  // Calculate summary stats
  const rowsRemoved = originalRowCount - finalRowCount;
  const rowsFlagged = 0; // TODO: track flagged rows
  const columnsModified = new Set(
    actionsApplied
      .flatMap((a) => a.affected.columns || [])
  ).size;
  const valuesImputed = actionsApplied
    .filter((a) => a.type === 'missingData')
    .reduce((sum, a) => sum + a.affected.count, 0);

  return {
    timestamp: new Date(),
    mode: settings.mode,
    settings,

    summary: {
      originalRows: originalRowCount,
      originalColumns: originalColumnCount,
      finalRows: finalRowCount,
      finalColumns: finalColumnCount,
      rowsRemoved,
      rowsFlagged,
      columnsModified,
      valuesImputed,
    },

    issuesDetected: {
      duplicates: groupDuplicates(issues.duplicates),
      speeders: issues.speeders,
      straightLiners: issues.straightLiners,
      outliers: issues.outliers,
      missingData: issues.missingData,
      textIssues: issues.textIssues,
    },

    actionsApplied,

    executionTime: endTime - startTime,
    errors,
    warnings,
  };
}

/**
 * Generate human-readable summary of the report
 */
export function summarizeReport(report: CleaningReport): string {
  const { summary, issuesDetected } = report;

  const lines: string[] = [];

  lines.push(`# Data Cleaning Report`);
  lines.push(`Generated: ${report.timestamp.toLocaleString()}`);
  lines.push(`Mode: ${report.mode.toUpperCase()}`);
  lines.push('');

  lines.push(`## Summary`);
  lines.push(`- Original: ${summary.originalRows} rows, ${summary.originalColumns} columns`);
  lines.push(`- Final: ${summary.finalRows} rows, ${summary.finalColumns} columns`);
  lines.push(`- Rows removed: ${summary.rowsRemoved}`);
  lines.push(`- Values imputed: ${summary.valuesImputed}`);
  lines.push('');

  lines.push(`## Issues Detected`);
  if (issuesDetected.duplicates.length > 0) {
    lines.push(`- Duplicates: ${issuesDetected.duplicates.length} groups`);
  }
  if (issuesDetected.speeders.length > 0) {
    lines.push(`- Speeders: ${issuesDetected.speeders.length} responses`);
  }
  if (issuesDetected.straightLiners.length > 0) {
    lines.push(`- Straight-liners: ${issuesDetected.straightLiners.length} responses`);
  }
  if (issuesDetected.outliers.length > 0) {
    lines.push(`- Outliers: ${issuesDetected.outliers.length} values`);
  }
  if (issuesDetected.missingData.length > 0) {
    lines.push(`- Missing data: ${issuesDetected.missingData.length} columns affected`);
  }
  if (issuesDetected.textIssues.length > 0) {
    lines.push(`- Text issues: ${issuesDetected.textIssues.length} responses`);
  }
  lines.push('');

  lines.push(`## Actions Applied`);
  report.actionsApplied.forEach((action, i) => {
    lines.push(`${i + 1}. ${action.description} (${action.affected.count} affected)`);
  });

  if (report.warnings.length > 0) {
    lines.push('');
    lines.push(`## Warnings`);
    report.warnings.forEach((warning) => lines.push(`- ${warning}`));
  }

  if (report.errors.length > 0) {
    lines.push('');
    lines.push(`## Errors`);
    report.errors.forEach((error) => lines.push(`- ${error}`));
  }

  lines.push('');
  lines.push(`Execution time: ${report.executionTime}ms`);

  return lines.join('\n');
}

/**
 * Export report as downloadable JSON
 */
export function exportReportAsJSON(report: CleaningReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Download report as file
 */
export function downloadReport(report: CleaningReport, format: 'json' | 'markdown', fileName: string) {
  const content = format === 'json' ? exportReportAsJSON(report) : summarizeReport(report);
  const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}-cleaning-report.${format === 'json' ? 'json' : 'md'}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
