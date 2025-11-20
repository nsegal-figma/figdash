/**
 * Purpose-Built Survey Analytics Dashboard
 * Clean, simple, focused on survey data visualization
 */

import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyStore } from '../stores/useSurveyStore';
import { EmptyState, Button } from '../components';
import { PaletteSelector } from '../components/PaletteSelector';
import { SortSelector } from '../components/SortSelector';
import { ChartFilter } from '../components/ChartFilter';
import { ChartExportButton } from '../components/ChartExportButton';
import { EditableChartTitle } from '../components/EditableChartTitle';
import { ResetFiltersButton } from '../components/ResetFiltersButton';
import { CrossTabBuilder } from '../components/CrossTabBuilder';
import { generateAllVisualizations } from '../lib/analytics/advanced';
import { generateGradientColors } from '../lib/colorPalettes';
import { FileText, Upload as UploadIcon, Download } from 'lucide-react';
import { usePDFExport } from '../hooks/usePDFExport';

// Simple Horizontal Bar Component with axis and tooltip
function HorizontalBar({
  label,
  value,
  maxValue,
  totalN,
  color,
  showLabel = true,
  showAxis = false,
}: {
  label: string;
  value: number;
  maxValue: number;
  totalN: number;
  color: string;
  showLabel?: boolean;
  showAxis?: boolean;
}) {
  const percentage = (value / maxValue) * 100;
  const percentOfTotal = (value / totalN) * 100;

  return (
    <>
      {showAxis && (
        <div className="flex items-center gap-4 mb-2" data-chart-axis>
          <div className="w-56 flex-shrink-0" />
          <div className="flex-1 flex justify-between text-xs text-gray-400 px-1">
            <span>0</span>
            <span>{Math.round(maxValue * 0.25)}</span>
            <span>{Math.round(maxValue * 0.5)}</span>
            <span>{Math.round(maxValue * 0.75)}</span>
            <span>{maxValue}</span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-4 mb-2 group">
        <div className="w-56 text-sm text-gray-700 text-right flex-shrink-0">
          {label}
        </div>
        <div className="flex-1 flex items-center relative">
          <div
            className="h-10 rounded-r-md relative transition-all hover:opacity-90 cursor-pointer"
            style={{
              width: `${Math.max(percentage, 3)}%`,
              background: `linear-gradient(90deg, ${color}dd, ${color})`,
            }}
            title={`${label}: ${value} (${percentOfTotal.toFixed(1)}%)`}
          >
            {showLabel && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-white">
                {value}
              </span>
            )}
          </div>

          {/* Hover Tooltip */}
          <div className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg group-hover:block">
            <div className="font-medium text-gray-900">{label}</div>
            <div className="mt-1 text-gray-600">
              {value} ({percentOfTotal.toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function SurveyDashboard() {
  const navigate = useNavigate();
  const { surveyData, selectedPalette, sortOrder, filters, customTitles } = useSurveyStore();
  const { exportDashboardToPDF } = usePDFExport();

  // Redirect to upload if no data
  useEffect(() => {
    if (!surveyData) {
      navigate('/', { replace: true });
    }
  }, [surveyData, navigate]);

  const analyses = useMemo(() => {
    if (!surveyData) return [];

    // Use dynamic visualization generator for ALL columns
    const visualizations = generateAllVisualizations(
      surveyData.columns,
      surveyData.rows
    );

    // Convert to format expected by UI, apply filters, and apply sorting
    return visualizations
      .filter(v => v.visualization !== 'text_analysis') // Text goes to Insights page
      .map(v => {
        const columnName = v.columnName;
        const filter = filters.get(columnName);

        let filteredData = v.data;
        let filteredN = v.n;

        // Apply filter if exists for this column
        if (filter && filter.length > 0) {
          filteredData = v.data.filter(item => filter.includes(item.name));
          filteredN = filteredData.reduce((sum, item) => sum + item.value, 0);
        }

        // Sort data based on sortOrder
        const sortedData = [...filteredData].sort((a, b) => {
          return sortOrder === 'desc' ? b.value - a.value : a.value - b.value;
        });

        // Get all available values for the filter
        const availableValues = v.data.map(item => item.name);

        // Use custom title if it exists
        const displayTitle = customTitles.get(columnName) || v.title;

        return {
          title: displayTitle,
          originalTitle: v.title,
          columnName,
          n: filteredN,
          type: 'simple',
          data: sortedData,
          availableValues,
        };
      });
  }, [surveyData, sortOrder, filters, customTitles]);

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="No Survey Data"
          description="Upload a CSV file to begin analysis"
          action={
            <Button onClick={() => navigate('/')}>
              <UploadIcon className="h-4 w-4 mr-2" />
              Upload Data
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* Header */}
        <div className="mb-10 flex items-start justify-between border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{surveyData.fileName}</h1>
            <p className="mt-1 text-sm text-gray-600">n={surveyData.totalRows} responses</p>
          </div>
          <div className="flex items-center gap-2">
            <ResetFiltersButton />
            <SortSelector />
            <PaletteSelector />
            <button
              onClick={() => exportDashboardToPDF(`${surveyData.fileName}-dashboard.pdf`)}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Export Content Container */}
        <div data-export-content>
          {/* Cross-Tab Builder */}
          <div className="mb-12">
            <CrossTabBuilder />
          </div>

          {/* All Survey Questions */}
          <div className="space-y-8">
            {analyses.map((analysis, idx) => {
              const chartId = `chart-${analysis.columnName}-${idx}`;
              return (
            <div key={idx} className="rounded-lg border border-gray-200 bg-white p-6" data-chart-id={chartId}>

              {/* Question Title & Actions */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <EditableChartTitle
                    columnName={analysis.columnName}
                    originalTitle={analysis.originalTitle}
                  />
                  <p className="mt-0.5 text-sm text-gray-600">n={analysis.n}</p>
                </div>
                <div className="flex items-center gap-2" data-export-exclude>
                  <ChartExportButton chartId={chartId} chartTitle={analysis.title} />
                  {analysis.availableValues && analysis.availableValues.length > 1 && (
                    <ChartFilter
                      columnName={analysis.columnName}
                      availableValues={analysis.availableValues}
                    />
                  )}
                </div>
              </div>

              {/* Horizontal Bars */}
              <div className="mb-8">
                {(() => {
                  // Generate gradient colors for this chart
                  const chartColors = generateGradientColors(selectedPalette, analysis.data, sortOrder);

                  return analysis.data.map((item: any, barIdx: number) => (
                    <HorizontalBar
                      key={barIdx}
                      label={item.name}
                      value={item.value}
                      maxValue={Math.max(...analysis.data.map((d: any) => d.value))}
                      totalN={analysis.n}
                      color={chartColors[barIdx]}
                      showAxis={barIdx === 0}
                    />
                  ));
                })()}
              </div>

              {/* Data Table */}
              <div className="mt-6 border-t border-gray-200 pt-6" data-chart-table>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Data</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.type === 'simple' && analysis.data.map((item: any, i: number) => {
                        const pct = (item.value / analysis.n) * 100;
                        return (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{item.value}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-right">{pct.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Upload New Data
          </button>
          <button
            onClick={() => navigate('/insights')}
            className="px-5 py-2.5 text-sm font-medium text-gray-900 border border-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Text Insights
          </button>
        </div>
      </div>
    </div>
  );
}

export { SurveyDashboard as Dashboard };
