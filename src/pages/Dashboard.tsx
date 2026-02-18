/**
 * Purpose-Built Survey Analytics Dashboard
 * Clean, simple, focused on survey data visualization
 */

import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSurveyStore } from '../stores/useSurveyStore';
import { useChartTheme } from '../hooks/useChartTheme';
import { useReducedMotion } from '../hooks/useReducedMotion';
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
import { StorytellingToggle } from '../components/storytelling';
import { ChartTypeSelector } from '../components/ChartTypeSelector';
import { ChartRenderer } from '../components/charts/ChartRenderer';
import { generateAllVisualizations } from '../lib/analytics/advanced';
import { generateGradientColors } from '../lib/colorPalettes';
import { FileText, Upload as UploadIcon, Download } from 'lucide-react';
import { usePDFExport } from '../hooks/usePDFExport';
import { formatFileName } from '../utils/csvParser';

export function SurveyDashboard() {
  const navigate = useNavigate();
  const { surveyData, sortOrder, filters, customTitles, insights, executiveSummary, isGeneratingInsights, chartTypeSelections, setChartType } = useSurveyStore();
  const { theme, colorPalette, styles } = useChartTheme();
  const prefersReducedMotion = useReducedMotion();
  // Note: Storytelling state is now handled internally by ChartRenderer
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
          type: 'simple' as const,
          data: sortedData,
          availableValues,
          recommendations: v.recommendations,
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
    <main className="min-h-screen" style={{ backgroundColor: theme.colors.background }} aria-label="Survey Dashboard">
      {/* Sticky Header */}
      <header
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
            <StorytellingToggle />
            <ResetFiltersButton />
            <SortSelector />
            <ThemeEditorButton />
            <button
              onClick={() => exportDashboardToPDF(`${formattedFileName}-dashboard.pdf`)}
              aria-label="Export dashboard as PDF"
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1"
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
      </header>

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
            <motion.div
              key={analysis.columnName}
              role="region"
              aria-label={`Chart: ${analysis.title}, ${analysis.n} responses`}
              className="border p-6"
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.borderColor,
                borderRadius: styles.containerBorderRadius,
                boxShadow: styles.containerShadow,
              }}
              data-chart-id={chartId}
              whileHover={!prefersReducedMotion ? { y: -2, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)' } : undefined}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : {
                duration: 0.3,
                delay: idx * 0.05,
                ease: 'easeOut',
              }}
            >

              {/* Question Title & Actions */}
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
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
                <div className="flex flex-shrink-0 items-center gap-2" data-export-exclude>
                  {/* Chart Type Selector */}
                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <ChartTypeSelector
                      recommendations={analysis.recommendations}
                      selectedType={chartTypeSelections.get(analysis.columnName) || (analysis.recommendations.find(r => r.isDefault)?.type || 'horizontal-bar')}
                      onTypeChange={(type) => setChartType(analysis.columnName, type)}
                    />
                  )}
                  <CopyChartButton
                    chartId={chartId}
                    chartData={{ title: analysis.title, n: analysis.n, data: analysis.data }}
                  />
                  <ChartExportButton
                    chartId={chartId}
                    chartTitle={analysis.title}
                    chartData={{ title: analysis.title, n: analysis.n, data: analysis.data }}
                  />
                  {analysis.availableValues && analysis.availableValues.length > 1 && (
                    <ChartFilter
                      columnName={analysis.columnName}
                      availableValues={analysis.availableValues}
                    />
                  )}
                </div>
              </div>

              {/* Dynamic Chart Renderer - storytelling handled internally */}
              <AnimatePresence mode="wait">
              <motion.div
                key={chartTypeSelections.get(analysis.columnName) || 'default'}
                className="mb-8"
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <ChartRenderer
                  type={chartTypeSelections.get(analysis.columnName) ||
                    (analysis.recommendations?.find(r => r.isDefault)?.type || 'horizontal-bar')}
                  data={analysis.data}
                  totalN={analysis.n}
                  columnName={analysis.columnName}
                  colors={generateGradientColors(colorPalette, analysis.data, sortOrder)}
                  theme={theme}
                  styles={styles}
                  height={300}
                />
              </motion.div>
              </AnimatePresence>

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
                  <table className="min-w-full" style={{ fontFamily: styles.fontFamily }} aria-label={`Data table for ${analysis.title}`}>
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
                      {analysis.type === 'simple' && analysis.data.map((item: { name: string; value: number }, i: number) => {
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

            </motion.div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 border rounded-lg transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1"
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
            className="px-5 py-2.5 border rounded-lg transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1"
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
    </main>
  );
}

export { SurveyDashboard as Dashboard };
