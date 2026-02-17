import { CheckCircle, Download } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import type { CleaningReport } from '../types/cleaning';
import type { Column } from '../types/survey';
import { downloadReport } from '../utils/reportGenerator';

interface CleaningReportDisplayProps {
  report: CleaningReport;
  fileName: string;
  columns?: Column[];
}

export function CleaningReportDisplay({ report, fileName, columns }: CleaningReportDisplayProps) {
  const { summary, issuesDetected, actionsApplied } = report;

  // Build "What we found" bullets — only non-zero categories
  const findings: string[] = [];
  if (issuesDetected.duplicates.length > 0)
    findings.push(`${issuesDetected.duplicates.length} duplicate response${issuesDetected.duplicates.length !== 1 ? 's' : ''}`);
  if (issuesDetected.speeders.length > 0)
    findings.push(`${issuesDetected.speeders.length} speeder${issuesDetected.speeders.length !== 1 ? 's' : ''}`);
  if (issuesDetected.straightLiners.length > 0)
    findings.push(`${issuesDetected.straightLiners.length} straight-liner${issuesDetected.straightLiners.length !== 1 ? 's' : ''}`);
  if (issuesDetected.outliers.length > 0)
    findings.push(`${issuesDetected.outliers.length} outlier${issuesDetected.outliers.length !== 1 ? 's' : ''}`);
  if (issuesDetected.missingData.length > 0)
    findings.push(`${issuesDetected.missingData.length} column${issuesDetected.missingData.length !== 1 ? 's' : ''} with missing data`);
  if (issuesDetected.textIssues.length > 0)
    findings.push(`${issuesDetected.textIssues.length} text quality issue${issuesDetected.textIssues.length !== 1 ? 's' : ''}`);

  // Build "What changed" bullets from actions applied
  const changes: string[] = [];
  for (const action of actionsApplied) {
    if (action.affected.count > 0) {
      changes.push(`${action.description} (${action.affected.count} row${action.affected.count !== 1 ? 's' : ''})`);
    }
  }
  if (summary.rowsRemoved > 0) {
    changes.push(`Removed ${summary.rowsRemoved} row${summary.rowsRemoved !== 1 ? 's' : ''}`);
  } else {
    changes.push('No rows removed');
  }
  if (summary.valuesImputed > 0) {
    changes.push(`Imputed ${summary.valuesImputed} value${summary.valuesImputed !== 1 ? 's' : ''}`);
  }

  // Max columns to show before truncating
  const MAX_COLUMNS = 8;
  const displayColumns = columns?.slice(0, MAX_COLUMNS);
  const remainingColumns = columns ? columns.length - MAX_COLUMNS : 0;

  return (
    <Card padding="lg">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-gray-900" />
            <h2 className="text-base font-semibold text-gray-900">Data Cleaning Complete</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => downloadReport(report, 'markdown', fileName)}
            icon={<Download className="h-4 w-4" />}
          >
            Download Report
          </Button>
        </div>

        {/* Row / Column count */}
        <p className="text-sm text-gray-600">
          {summary.finalRows} rows &middot; {summary.finalColumns} columns
        </p>

        {/* Two-column: What we found / What changed */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">What we found</h3>
            {findings.length > 0 ? (
              <ul className="space-y-1">
                {findings.map((f, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                    <span className="text-gray-400 mt-0.5">&bull;</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No issues detected</p>
            )}
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">What changed</h3>
            <ul className="space-y-1">
              {changes.map((c, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5">
                  <span className="text-gray-400 mt-0.5">&bull;</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Data Structure table */}
        {displayColumns && displayColumns.length > 0 && (
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">Data Structure</h3>
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {displayColumns.map((col, i) => (
                    <tr key={col.name} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-1.5 text-gray-900 truncate max-w-[250px]" title={col.name}>
                        {col.name}
                      </td>
                      <td className="px-3 py-1.5 text-gray-500 text-right whitespace-nowrap">
                        {col.type}
                      </td>
                    </tr>
                  ))}
                  {remainingColumns > 0 && (
                    <tr className={displayColumns.length % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-1.5 text-gray-400" colSpan={2}>
                        + {remainingColumns} more column{remainingColumns !== 1 ? 's' : ''}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
