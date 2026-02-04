/**
 * Purpose-Built Survey Analytics Dashboard
 * Clean, simple, focused on survey data visualization
 */

import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyStore } from '../stores/useSurveyStore';
import { useChartTheme } from '../hooks/useChartTheme';
import { EmptyState, Button } from '../components';
import { SortSelector } from '../components/SortSelector';
import { ChartFilter } from '../components/ChartFilter';
import { ChartExportButton } from '../components/ChartExportButton';
import { CopyChartButton } from '../components/CopyChartButton';
import { EditableChartTitle } from '../components/EditableChartTitle';
import { ResetFiltersButton } from '../components/ResetFiltersButton';
import { KeyFindings } from '../components/KeyFindings';
import { CrossTabBuilder } from '../components/CrossTabBuilder';
import { ThemeEditorButton } from '../components/ThemeEditor';
import { generateAllVisualizations } from '../lib/analytics/advanced';
import { generateGradientColors } from '../lib/colorPalettes';
import { FileText, Upload as UploadIcon, Download } from 'lucide-react';
import { usePDFExport } from '../hooks/usePDFExport';
import { formatFileName } from '../utils/csvParser';
import type { ChartTheme } from '../types/chartTheme';

// Themed Horizontal Bar Component with axis and tooltip
interface HorizontalBarProps {
  label: string;
  value: number;
  maxValue: number;
  totalN: number;
  color: string;
  showLabel?: boolean;
  showAxis?: boolean;
  theme: ChartTheme;
  styles: ReturnType<typeof import('../lib/themes').computeThemeStyles>;
}

function HorizontalBar({
  label,
  value,
  maxValue,
  totalN,
  color,
  showLabel = true,
  showAxis = false,
  theme,
  styles,
}: HorizontalBarProps) {
  const percentage = (value / maxValue) * 100;
  const percentOfTotal = (value / totalN) * 100;

  // Generate axis labels based on theme's axisDivisions
  const getAxisLabels = () => {
    const divisions = theme.grid.axisDivisions;
    const labels = [];
    for (let i = 0; i <= divisions; i++) {
      labels.push(Math.round(maxValue * (i / divisions)));
    }
    return labels;
  };

  return (
    <>
      {showAxis && theme.grid.showAxisTicks && (
        <div
          className="flex items-center gap-4"
          style={{ marginBottom: theme.layout.barGap }}
          data-chart-axis
        >
          <div style={{ width: theme.layout.labelWidth }} className="flex-shrink-0" />
          <div
            className="flex-1 flex justify-between px-1"
            style={{
              fontFamily: styles.fontFamily,
              fontSize: styles.axisTickFontSize,
              color: theme.colors.textMuted,
            }}
          >
            {getAxisLabels().map((val, i) => (
              <span key={i}>{val}</span>
            ))}
          </div>
        </div>
      )}
      <div
        className="flex items-center gap-4 group"
        style={{ marginBottom: theme.layout.barGap }}
      >
        <div
          className="text-right flex-shrink-0"
          style={{
            width: theme.layout.labelWidth,
            fontFamily: styles.fontFamily,
            fontSize: styles.labelFontSize,
            fontWeight: theme.typography.labelWeight,
            color: theme.colors.textSecondary,
          }}
        >
          {label}
        </div>
        <div className="flex-1 flex items-center relative">
          {/* Vertical Grid Lines */}
          {theme.grid.showVerticalGrid && (
            <div className="absolute inset-0 flex justify-between pointer-events-none">
              {Array.from({ length: theme.grid.axisDivisions + 1 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '1px',
                    height: '100%',
                    backgroundColor: theme.colors.gridColor,
                    opacity: theme.grid.gridOpacity,
                    borderStyle: styles.gridBorderStyle,
                  }}
                />
              ))}
            </div>
          )}
          <div
            className="relative"
            style={{
              width: `${Math.max(percentage, 3)}%`,
              height: theme.layout.barHeight,
              background: styles.getBarGradient(color),
              borderRadius: `0 ${styles.barBorderRadius} ${styles.barBorderRadius} 0`,
              borderWidth: theme.shapes.barBorderWidth > 0 ? theme.shapes.barBorderWidth : undefined,
              borderColor: theme.shapes.barBorderWidth > 0 ? theme.shapes.barBorderColor : undefined,
              borderStyle: theme.shapes.barBorderWidth > 0 ? 'solid' : undefined,
              cursor: theme.effects.hoverCursor ? 'pointer' : 'default',
              transition: styles.animationTransition,
            }}
            onMouseEnter={(e) => {
              if (theme.effects.hoverOpacity < 1) {
                e.currentTarget.style.opacity = String(theme.effects.hoverOpacity);
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {theme.dataLabels.showBarValues && showLabel && theme.dataLabels.valuePosition === 'inside' && (
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{
                  fontFamily: styles.fontFamily,
                  fontSize: styles.valueFontSize,
                  fontWeight: theme.typography.valueWeight,
                  color: theme.colors.valueLabelColor,
                }}
              >
                {theme.dataLabels.numberFormat === 'percentage'
                  ? `${percentOfTotal.toFixed(theme.dataLabels.percentageDecimals)}%`
                  : value}
              </span>
            )}
          </div>
          {/* Value label outside bar */}
          {theme.dataLabels.showBarValues && showLabel && theme.dataLabels.valuePosition !== 'inside' && (
            <span
              className="ml-2"
              style={{
                fontFamily: styles.fontFamily,
                fontSize: styles.valueFontSize,
                fontWeight: theme.typography.valueWeight,
                color: theme.colors.textPrimary,
              }}
            >
              {theme.dataLabels.numberFormat === 'percentage'
                ? `${percentOfTotal.toFixed(theme.dataLabels.percentageDecimals)}%`
                : value}
            </span>
          )}

          {/* Hover Tooltip */}
          <div
            className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden rounded-lg bg-gray-900 px-3 py-2 shadow-xl group-hover:block"
            style={{
              fontFamily: styles.fontFamily,
              fontSize: styles.labelFontSize,
              minWidth: '120px',
            }}
          >
            <div className="font-medium text-white">{label}</div>
            <div className="mt-1 text-gray-300">
              {value} ({percentOfTotal.toFixed(1)}%)
            </div>
            {/* Tooltip arrow */}
            <div className="absolute -top-1 left-4 h-2 w-2 rotate-45 bg-gray-900" />
          </div>
        </div>
      </div>
    </>
  );
}

export function SurveyDashboard() {
  const navigate = useNavigate();
  const { surveyData, sortOrder, filters, customTitles, insights, executiveSummary, isGeneratingInsights } = useSurveyStore();
  const { theme, colorPalette, styles } = useChartTheme();
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

  const formattedFileName = useMemo(() =>
    surveyData ? formatFileName(surveyData.fileName) : '',
    [surveyData]
  );

  if (!surveyData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: theme.colors.background }}
      >
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
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-30"
        style={{
          backgroundColor: theme.colors.cardBackground,
          borderBottom: `1px solid ${theme.colors.borderColor}`,
        }}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1
              className="tracking-tight"
              style={{
                fontFamily: styles.fontFamily,
                fontSize: '1.5rem',
                fontWeight: 600,
                color: theme.colors.textPrimary,
              }}
            >
              {formattedFileName}
            </h1>
            <p
              className="mt-1"
              style={{
                fontFamily: styles.fontFamily,
                fontSize: styles.labelFontSize,
                color: theme.colors.textSecondary,
              }}
            >
              n={surveyData.totalRows} responses
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ResetFiltersButton />
            <SortSelector />
            <ThemeEditorButton />
            <button
              onClick={() => exportDashboardToPDF(`${formattedFileName}-dashboard.pdf`)}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 transition-colors hover:opacity-80"
              style={{
                fontFamily: styles.fontFamily,
                fontSize: styles.labelFontSize,
                fontWeight: 500,
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.borderColor,
                color: theme.colors.textPrimary,
              }}
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">

        {/* Export Content Container */}
        <div data-export-content>
          {/* Key Findings */}
          <KeyFindings
            insights={insights}
            executiveSummary={executiveSummary}
            isLoading={isGeneratingInsights}
          />

          {/* Cross-Tab Builder */}
          <div className="mb-12">
            <CrossTabBuilder />
          </div>

          {/* All Survey Questions */}
          <div className="space-y-8">
            {analyses.map((analysis, idx) => {
              const chartId = `chart-${analysis.columnName}-${idx}`;
              return (
            <div
              key={idx}
              className="border p-6"
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.borderColor,
                borderRadius: styles.containerBorderRadius,
                boxShadow: styles.containerShadow,
              }}
              data-chart-id={chartId}
            >

              {/* Question Title & Actions */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <EditableChartTitle
                    columnName={analysis.columnName}
                    originalTitle={analysis.originalTitle}
                  />
                  <p
                    className="mt-0.5"
                    style={{
                      fontFamily: styles.fontFamily,
                      fontSize: styles.labelFontSize,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    n={analysis.n}
                  </p>
                </div>
                <div className="flex items-center gap-2" data-export-exclude>
                  <CopyChartButton chartId={chartId} />
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
                  // Generate gradient colors for this chart using theme's color palette
                  const chartColors = generateGradientColors(colorPalette, analysis.data, sortOrder);

                  return analysis.data.map((item: any, barIdx: number) => (
                    <HorizontalBar
                      key={barIdx}
                      label={item.name}
                      value={item.value}
                      maxValue={Math.max(...analysis.data.map((d: any) => d.value))}
                      totalN={analysis.n}
                      color={chartColors[barIdx]}
                      showAxis={barIdx === 0}
                      theme={theme}
                      styles={styles}
                    />
                  ));
                })()}
              </div>

              {/* Data Table */}
              <div
                className="mt-6 pt-6"
                style={{
                  borderTop: `2px solid ${theme.colors.textMuted}40`,
                }}
                data-chart-table
              >
                <h3
                  className="mb-3 uppercase tracking-wide"
                  style={{
                    fontFamily: styles.fontFamily,
                    fontSize: styles.axisTickFontSize,
                    fontWeight: 500,
                    color: theme.colors.textMuted,
                  }}
                >
                  Data
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full" style={{ fontFamily: styles.fontFamily }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${theme.colors.textMuted}30` }}>
                        <th
                          className="px-4 py-3 text-left uppercase"
                          style={{
                            fontSize: styles.axisTickFontSize,
                            fontWeight: 500,
                            color: theme.colors.textMuted,
                          }}
                        >
                          Response
                        </th>
                        <th
                          className="px-4 py-3 text-right uppercase"
                          style={{
                            fontSize: styles.axisTickFontSize,
                            fontWeight: 500,
                            color: theme.colors.textMuted,
                          }}
                        >
                          Count
                        </th>
                        <th
                          className="px-4 py-3 text-right uppercase"
                          style={{
                            fontSize: styles.axisTickFontSize,
                            fontWeight: 500,
                            color: theme.colors.textMuted,
                          }}
                        >
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.type === 'simple' && analysis.data.map((item: any, i: number) => {
                        const pct = (item.value / analysis.n) * 100;
                        return (
                          <tr
                            key={i}
                            className="transition-colors"
                            style={{ borderBottom: `1px solid ${theme.colors.textMuted}15` }}
                          >
                            <td
                              className="px-4 py-3"
                              style={{
                                fontSize: styles.labelFontSize,
                                color: theme.colors.textPrimary,
                              }}
                            >
                              {item.name}
                            </td>
                            <td
                              className="px-4 py-3 text-right"
                              style={{
                                fontSize: styles.labelFontSize,
                                fontWeight: 500,
                                color: theme.colors.textPrimary,
                              }}
                            >
                              {item.value}
                            </td>
                            <td
                              className="px-4 py-3 text-right"
                              style={{
                                fontSize: styles.labelFontSize,
                                color: theme.colors.textSecondary,
                              }}
                            >
                              {pct.toFixed(1)}%
                            </td>
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
            className="px-5 py-2.5 border rounded-lg transition-colors hover:opacity-80"
            style={{
              fontFamily: styles.fontFamily,
              fontSize: styles.labelFontSize,
              fontWeight: 500,
              color: theme.colors.textSecondary,
              borderColor: theme.colors.borderColor,
              backgroundColor: theme.colors.cardBackground,
            }}
          >
            Upload New Data
          </button>
          <button
            onClick={() => navigate('/insights')}
            className="px-5 py-2.5 border rounded-lg transition-colors hover:opacity-80"
            style={{
              fontFamily: styles.fontFamily,
              fontSize: styles.labelFontSize,
              fontWeight: 500,
              color: theme.colors.textPrimary,
              borderColor: theme.colors.textPrimary,
              backgroundColor: theme.colors.cardBackground,
            }}
          >
            Text Insights
          </button>
        </div>
      </div>
    </div>
  );
}

export { SurveyDashboard as Dashboard };
