/**
 * Cleaning Report Charts
 * Visualizations for cleaning report data
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { CleaningReport } from '../types/cleaning';

interface CleaningReportChartsProps {
  report: CleaningReport;
  originalData: any; // Original survey data for comparison
}

export function CleaningReportCharts({ report }: CleaningReportChartsProps) {
  const { issuesDetected } = report;

  // Prepare data for issues overview chart
  const issueOverviewData = [
    { name: 'Duplicates', count: issuesDetected.duplicates.length, color: '#f97316' },
    { name: 'Speeders', count: issuesDetected.speeders.length, color: '#eab308' },
    { name: 'Straight-liners', count: issuesDetected.straightLiners.length, color: '#a855f7' },
    { name: 'Outliers', count: issuesDetected.outliers.length, color: '#ef4444' },
    { name: 'Missing Data', count: issuesDetected.missingData.length, color: '#6b7280' },
    { name: 'Text Issues', count: issuesDetected.textIssues.length, color: '#f59e0b' },
  ].filter((item) => item.count > 0);

  // Prepare data for before/after comparison
  const beforeAfterData = [
    {
      stage: 'Before',
      rows: report.summary.originalRows,
    },
    {
      stage: 'After',
      rows: report.summary.finalRows,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Issues Overview Chart */}
      {issueOverviewData.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Issues Detected by Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={issueOverviewData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" style={{ fontSize: '12px' }} />
              <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {issueOverviewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Before/After Row Count */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Data Volume: Before vs After</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={beforeAfterData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="stage" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
              }}
            />
            <Bar dataKey="rows" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 text-center text-xs text-gray-600">
          Removed {report.summary.rowsRemoved} rows ({((report.summary.rowsRemoved / report.summary.originalRows) * 100).toFixed(1)}% of original data)
        </div>
      </div>

      {/* Missing Data Heatmap */}
      {issuesDetected.missingData.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Missing Data by Column</h3>
          <div className="space-y-2">
            {issuesDetected.missingData.map((md, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-40 truncate text-xs text-gray-700" title={md.column}>
                  {md.column}
                </div>
                <div className="flex-1 h-6 bg-gray-100 rounded-md overflow-hidden">
                  <div
                    className={`h-full ${
                      md.percentage > 70
                        ? 'bg-red-500'
                        : md.percentage > 40
                        ? 'bg-orange-500'
                        : 'bg-yellow-500'
                    }`}
                    style={{ width: `${md.percentage}%` }}
                  />
                </div>
                <div className="w-16 text-right text-xs font-medium text-gray-700">
                  {md.percentage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Speeder Distribution (if available) */}
      {issuesDetected.speeders.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Speeder Distribution</h3>
          <div className="space-y-1">
            {issuesDetected.speeders
              .sort((a, b) => a.completionTime - b.completionTime)
              .slice(0, 10)
              .map((speeder, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-gray-700">Row {speeder.rowIndex + 1}</div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-md overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{
                        width: `${Math.min((speeder.completionTime / speeder.threshold) * 50, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="w-16 text-right text-xs text-gray-700">
                    {speeder.completionTime}s
                  </div>
                </div>
              ))}
            {issuesDetected.speeders.length > 10 && (
              <div className="text-xs text-gray-500 text-center pt-2">
                ... and {issuesDetected.speeders.length - 10} more speeders
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
