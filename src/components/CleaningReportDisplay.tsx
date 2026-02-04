import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import {
  CheckCircle,
  AlertTriangle,
  Users,
  Zap,
  TrendingDown,
  FileQuestion,
  FileText,
  ChevronDown,
  ChevronRight,
  Download,
  BarChart3,
} from 'lucide-react';
import type { CleaningReport } from '../types/cleaning';
import { downloadReport } from '../utils/reportGenerator';
import { CleaningReportCharts } from './CleaningReportCharts';

interface CleaningReportDisplayProps {
  report: CleaningReport;
  fileName: string;
}

export function CleaningReportDisplay({ report, fileName }: CleaningReportDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showCharts, setShowCharts] = useState(true);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const { summary, issuesDetected, actionsApplied } = report;

  const totalIssues =
    issuesDetected.duplicates.length +
    issuesDetected.speeders.length +
    issuesDetected.straightLiners.length +
    issuesDetected.outliers.length +
    issuesDetected.missingData.length +
    issuesDetected.textIssues.length;

  return (
    <Card padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-gray-900 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Data Cleaning Complete</h2>
              <p className="text-sm text-gray-600 mt-1">
                {totalIssues} issue{totalIssues !== 1 ? 's' : ''} detected and processed
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCharts(!showCharts)}
              icon={<BarChart3 className="h-4 w-4" />}
            >
              {showCharts ? 'Hide' : 'Show'} Charts
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => downloadReport(report, 'markdown', fileName)}
              icon={<Download className="h-4 w-4" />}
            >
              Download Report
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-2xl font-bold text-gray-900">{summary.originalRows}</div>
            <div className="text-xs text-gray-600">Original Rows</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-2xl font-bold text-gray-900">{summary.finalRows}</div>
            <div className="text-xs text-gray-600">Final Rows</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-2xl font-bold text-gray-900">{summary.rowsRemoved}</div>
            <div className="text-xs text-gray-600">Rows Removed</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-2xl font-bold text-gray-900">{summary.valuesImputed}</div>
            <div className="text-xs text-gray-600">Values Imputed</div>
          </div>
        </div>

        {/* Charts */}
        {showCharts && totalIssues > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <CleaningReportCharts report={report} originalData={null} />
          </div>
        )}

        {/* Issues Detected - Expandable Sections */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Issues Detected</h3>

          {/* Duplicates */}
          {issuesDetected.duplicates.length > 0 && (
            <IssueSection
              title="Duplicate Responses"
              count={issuesDetected.duplicates.length}
              icon={<Users className="h-4 w-4 text-gray-900" />}
              isExpanded={expandedSections.has('duplicates')}
              onToggle={() => toggleSection('duplicates')}
            >
              <div className="space-y-2">
                {issuesDetected.duplicates.slice(0, 5).map((dup, i) => (
                  <div key={i} className="text-xs text-gray-700">
                    <span className="font-medium">Group {i + 1}:</span> Rows{' '}
                    {dup.rowIndices.map((r) => r + 1).join(', ')}
                    {dup.similarity < 1 && ` (${(dup.similarity * 100).toFixed(0)}% similar)`}
                  </div>
                ))}
                {issuesDetected.duplicates.length > 5 && (
                  <div className="text-xs text-gray-500">
                    ... and {issuesDetected.duplicates.length - 5} more
                  </div>
                )}
              </div>
            </IssueSection>
          )}

          {/* Speeders */}
          {issuesDetected.speeders.length > 0 && (
            <IssueSection
              title="Speeders (Too Fast)"
              count={issuesDetected.speeders.length}
              icon={<Zap className="h-4 w-4 text-gray-900" />}
              isExpanded={expandedSections.has('speeders')}
              onToggle={() => toggleSection('speeders')}
            >
              <div className="space-y-2">
                {issuesDetected.speeders.slice(0, 5).map((speeder, i) => (
                  <div key={i} className="text-xs text-gray-700">
                    <span className="font-medium">Row {speeder.rowIndex + 1}:</span>{' '}
                    {speeder.completionTime}s (threshold: {speeder.threshold.toFixed(0)}s,{' '}
                    {speeder.percentile.toFixed(1)}th percentile)
                  </div>
                ))}
                {issuesDetected.speeders.length > 5 && (
                  <div className="text-xs text-gray-500">
                    ... and {issuesDetected.speeders.length - 5} more
                  </div>
                )}
              </div>
            </IssueSection>
          )}

          {/* Straight-liners */}
          {issuesDetected.straightLiners.length > 0 && (
            <IssueSection
              title="Straight-liners (Low Variance)"
              count={issuesDetected.straightLiners.length}
              icon={<TrendingDown className="h-4 w-4 text-gray-900" />}
              isExpanded={expandedSections.has('straightLiners')}
              onToggle={() => toggleSection('straightLiners')}
            >
              <div className="space-y-2">
                {issuesDetected.straightLiners.slice(0, 5).map((sl, i) => (
                  <div key={i} className="text-xs text-gray-700">
                    <span className="font-medium">Row {sl.rowIndex + 1}:</span> Variance ={' '}
                    {sl.variance.toFixed(3)} across {sl.columns.length} questions
                  </div>
                ))}
                {issuesDetected.straightLiners.length > 5 && (
                  <div className="text-xs text-gray-500">
                    ... and {issuesDetected.straightLiners.length - 5} more
                  </div>
                )}
              </div>
            </IssueSection>
          )}

          {/* Outliers */}
          {issuesDetected.outliers.length > 0 && (
            <IssueSection
              title="Statistical Outliers"
              count={issuesDetected.outliers.length}
              icon={<AlertTriangle className="h-4 w-4 text-gray-900" />}
              isExpanded={expandedSections.has('outliers')}
              onToggle={() => toggleSection('outliers')}
            >
              <div className="space-y-2">
                {issuesDetected.outliers.slice(0, 5).map((outlier, i) => (
                  <div key={i} className="text-xs text-gray-700">
                    <span className="font-medium">Row {outlier.rowIndex + 1}:</span>{' '}
                    {outlier.column} = {outlier.value} (z-score: {outlier.score.toFixed(2)})
                  </div>
                ))}
                {issuesDetected.outliers.length > 5 && (
                  <div className="text-xs text-gray-500">
                    ... and {issuesDetected.outliers.length - 5} more
                  </div>
                )}
              </div>
            </IssueSection>
          )}

          {/* Missing Data */}
          {issuesDetected.missingData.length > 0 && (
            <IssueSection
              title="Missing Data"
              count={issuesDetected.missingData.length}
              icon={<FileQuestion className="h-4 w-4 text-gray-600" />}
              isExpanded={expandedSections.has('missingData')}
              onToggle={() => toggleSection('missingData')}
            >
              <div className="space-y-2">
                {issuesDetected.missingData.map((missing, i) => (
                  <div key={i} className="text-xs text-gray-700">
                    <span className="font-medium">{missing.column}:</span>{' '}
                    {missing.missingCount} missing ({missing.percentage.toFixed(1)}%)
                  </div>
                ))}
              </div>
            </IssueSection>
          )}

          {/* Text Issues */}
          {issuesDetected.textIssues.length > 0 && (
            <IssueSection
              title="Text Quality Issues"
              count={issuesDetected.textIssues.length}
              icon={<FileText className="h-4 w-4 text-amber-600" />}
              isExpanded={expandedSections.has('textIssues')}
              onToggle={() => toggleSection('textIssues')}
            >
              <div className="space-y-2">
                {issuesDetected.textIssues.slice(0, 5).map((text, i) => (
                  <div key={i} className="text-xs text-gray-700">
                    <span className="font-medium">Row {text.rowIndex + 1}:</span> {text.column} -{' '}
                    {text.issues.join(', ')}
                  </div>
                ))}
                {issuesDetected.textIssues.length > 5 && (
                  <div className="text-xs text-gray-500">
                    ... and {issuesDetected.textIssues.length - 5} more
                  </div>
                )}
              </div>
            </IssueSection>
          )}
        </div>

        {/* Actions Applied */}
        {actionsApplied.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Actions Applied</h3>
            <div className="space-y-2">
              {actionsApplied.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs"
                >
                  <CheckCircle className="h-4 w-4 text-gray-900 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{action.description}</div>
                    <div className="text-gray-600">
                      {action.affected.count} row{action.affected.count !== 1 ? 's' : ''} affected
                      {action.affected.columns && action.affected.columns.length > 0 && (
                        <> in {action.affected.columns.join(', ')}</>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Execution Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
          <span>
            Completed in {report.executionTime}ms •{' '}
            {report.timestamp.toLocaleTimeString()}
          </span>
          <span className="uppercase font-medium">{report.mode} mode</span>
        </div>
      </div>
    </Card>
  );
}

// Helper component for expandable issue sections
function IssueSection({
  title,
  count,
  icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-3 text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-gray-900">{title}</span>
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            {count}
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {isExpanded && <div className="border-t border-gray-200 p-3">{children}</div>}
    </div>
  );
}
