import { useState, useMemo } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
import { useSurveyStore } from '../stores/useSurveyStore';
import { useChartTheme } from '../hooks/useChartTheme';
import { Card, Button } from './';
import { generateColorsFromPalette } from '../lib/colorPalettes';
import { suggestCrossTabs } from '../lib/analytics/crossTabSuggestions';
import { BORDER_RADIUS_MAP } from '../lib/themes';

interface CrossTabVisualization {
  id: string;
  rowColumn: string;
  segmentColumn: string;
  visualizationType: 'stacked' | 'grouped';
}

export function CrossTabBuilder() {
  const { surveyData, filters } = useSurveyStore();
  const { theme, colorPalette, styles } = useChartTheme();
  const [crossTabs, setCrossTabs] = useState<CrossTabVisualization[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [selectedRow, setSelectedRow] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [visualizationType, setVisualizationType] = useState<'stacked' | 'grouped'>('stacked');
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Get suggested cross-tabs
  const suggestions = useMemo(() => {
    if (!surveyData) return [];
    return suggestCrossTabs(surveyData);
  }, [surveyData]);

  if (!surveyData) return null;

  // Get only categorical columns for cross-tabs
  const categoricalColumns = surveyData.columns.filter(
    (c) => c.type === 'categorical' || c.type === 'text'
  );

  const handleAddCrossTab = () => {
    if (!selectedRow || !selectedSegment || selectedRow === selectedSegment) return;

    const newCrossTab: CrossTabVisualization = {
      id: `${selectedRow}-${selectedSegment}-${Date.now()}`,
      rowColumn: selectedRow,
      segmentColumn: selectedSegment,
      visualizationType,
    };

    setCrossTabs([newCrossTab, ...crossTabs]); // Prepend to show newest on top
    setSelectedRow('');
    setSelectedSegment('');
    setVisualizationType('stacked');
    setIsBuilding(false);
  };

  const handleRemoveCrossTab = (id: string) => {
    setCrossTabs(crossTabs.filter((ct) => ct.id !== id));
  };

  const handleCreateFromSuggestion = (rowCol: string, segCol: string) => {
    const newCrossTab: CrossTabVisualization = {
      id: `${rowCol}-${segCol}-${Date.now()}`,
      rowColumn: rowCol,
      segmentColumn: segCol,
      visualizationType: 'stacked',
    };
    setCrossTabs([newCrossTab, ...crossTabs]);
    // Keep suggestions visible so user can create multiple
  };

  // Sort satisfaction scale values in logical order
  const sortSatisfactionScale = (values: string[]): string[] => {
    const satisfactionOrder = [
      'Extremely satisfied',
      'Very satisfied',
      'Somewhat satisfied',
      'Neither satisfied nor dissatisfied',
      'Somewhat dissatisfied',
      'Very dissatisfied',
      'Extremely dissatisfied',
    ];

    const agreementOrder = [
      'Strongly agree',
      'Agree',
      'Somewhat agree',
      'Neither agree nor disagree',
      'Somewhat disagree',
      'Disagree',
      'Strongly disagree',
    ];

    // Check if values match satisfaction pattern
    const lowerValues = values.map(v => v.toLowerCase());
    const isSatisfaction = lowerValues.some(v => v.includes('satisfied'));
    const isAgreement = lowerValues.some(v => v.includes('agree'));

    if (isSatisfaction) {
      return [...values].sort((a, b) => {
        const aIndex = satisfactionOrder.findIndex(s => s.toLowerCase() === a.toLowerCase());
        const bIndex = satisfactionOrder.findIndex(s => s.toLowerCase() === b.toLowerCase());
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }

    if (isAgreement) {
      return [...values].sort((a, b) => {
        const aIndex = agreementOrder.findIndex(s => s.toLowerCase() === a.toLowerCase());
        const bIndex = agreementOrder.findIndex(s => s.toLowerCase() === b.toLowerCase());
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }

    return values;
  };

  const generateCrossTabData = (crossTab: CrossTabVisualization) => {
    // Apply filters if they exist for either variable
    const rowFilter = filters.get(crossTab.rowColumn);
    const segmentFilter = filters.get(crossTab.segmentColumn);

    let filteredRows = surveyData.rows;

    // Apply row filter
    if (rowFilter && rowFilter.length > 0) {
      filteredRows = filteredRows.filter(r => rowFilter.includes(String(r[crossTab.rowColumn])));
    }

    // Apply segment filter
    if (segmentFilter && segmentFilter.length > 0) {
      filteredRows = filteredRows.filter(r => segmentFilter.includes(String(r[crossTab.segmentColumn])));
    }

    const rowValues = filteredRows.map((r) => r[crossTab.rowColumn]).filter((v) => v);
    const segmentValues = filteredRows.map((r) => r[crossTab.segmentColumn]).filter((v) => v);

    let uniqueRows = [...new Set(rowValues)] as string[];
    const uniqueSegments = sortSatisfactionScale([...new Set(segmentValues)] as string[]);

    // Sort rows to put "Other" last
    uniqueRows = uniqueRows.sort((a, b) => {
      if (a.toLowerCase() === 'other') return 1;
      if (b.toLowerCase() === 'other') return -1;
      return 0;
    });

    const data = uniqueRows.map((row) => {
      const segments = uniqueSegments.map((segment) => {
        const count = filteredRows.filter(
          (r) => r[crossTab.rowColumn] === row && r[crossTab.segmentColumn] === segment
        ).length;
        return { name: segment, value: count };
      });

      return {
        label: String(row),
        segments,
        total: segments.reduce((sum, s) => sum + s.value, 0),
      };
    });

    // Filter out rows with no data
    const dataWithValues = data.filter(d => d.total > 0);

    return { data: dataWithValues, legend: uniqueSegments.map(String) };
  };

  const colors = generateColorsFromPalette(colorPalette, 20);

  return (
    <div className="space-y-6">
      {/* Suggested Cross-Tabs */}
      {suggestions.length > 0 && showSuggestions && (
        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: theme.colors.textSecondary }} />
              <h3
                style={{
                  fontFamily: styles.fontFamily,
                  fontSize: styles.labelFontSize,
                  fontWeight: 500,
                  color: theme.colors.textPrimary,
                }}
              >
                Suggested Cross-Tabs
              </h3>
              <div className="group relative">
                <button style={{ color: theme.colors.textMuted }}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <div
                  className="pointer-events-none absolute left-0 top-full z-20 mt-1 hidden w-64 rounded-md border p-3 shadow-lg group-hover:block"
                  style={{
                    fontFamily: styles.fontFamily,
                    fontSize: styles.axisTickFontSize,
                    backgroundColor: theme.colors.cardBackground,
                    borderColor: theme.colors.borderColor,
                    color: theme.colors.textSecondary,
                  }}
                >
                  <strong>Association Strength</strong> measures how strongly two variables are related using Cramér's V.
                  <ul className="mt-2 space-y-1">
                    <li>• <strong>V &gt; 0.30</strong>: Strong relationship</li>
                    <li>• <strong>V = 0.20-0.30</strong>: Moderate relationship</li>
                    <li>• <strong>V = 0.10-0.20</strong>: Weak but notable</li>
                    <li>• <strong>V &lt; 0.10</strong>: Minimal relationship</li>
                  </ul>
                  <p className="mt-2" style={{ color: theme.colors.textMuted }}>
                    Values range from 0 (no association) to 1 (perfect association).
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSuggestions(false)}
              className="hover:opacity-70"
              style={{
                fontFamily: styles.fontFamily,
                fontSize: styles.axisTickFontSize,
                color: theme.colors.textMuted,
              }}
            >
              Dismiss
            </button>
          </div>
          <p
            className="mb-4"
            style={{
              fontFamily: styles.fontFamily,
              fontSize: styles.axisTickFontSize,
              color: theme.colors.textSecondary,
            }}
          >
            Statistical analysis found these variable pairs have interesting patterns worth exploring
          </p>
          <div className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleCreateFromSuggestion(suggestion.rowColumn, suggestion.segmentColumn)}
                className="w-full rounded-md border p-3 text-left transition-colors hover:opacity-90"
                style={{
                  backgroundColor: theme.colors.cardBackground,
                  borderColor: theme.colors.borderColor,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div
                      style={{
                        fontFamily: styles.fontFamily,
                        fontSize: styles.labelFontSize,
                        fontWeight: 500,
                        color: theme.colors.textPrimary,
                      }}
                    >
                      {suggestion.rowColumn} × {suggestion.segmentColumn}
                    </div>
                    <div
                      className="mt-1"
                      style={{
                        fontFamily: styles.fontFamily,
                        fontSize: styles.axisTickFontSize,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {suggestion.insight}
                    </div>
                  </div>
                  <div className="ml-3 flex flex-col items-end gap-1">
                    <div
                      style={{
                        fontFamily: styles.fontFamily,
                        fontSize: styles.axisTickFontSize,
                        fontWeight: 600,
                        color: suggestion.cramersV > 0.3 ? theme.colors.textPrimary : theme.colors.textSecondary,
                      }}
                    >
                      {suggestion.cramersV > 0.3 ? 'Strong' : suggestion.cramersV > 0.2 ? 'Moderate' : 'Weak'}
                    </div>
                    <div
                      style={{
                        fontFamily: styles.fontFamily,
                        fontSize: styles.axisTickFontSize,
                        color: theme.colors.textMuted,
                      }}
                    >
                      V = {suggestion.cramersV.toFixed(2)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Add Cross-Tab Button */}
      {!isBuilding && (
        <button
          onClick={() => setIsBuilding(true)}
          className="inline-flex items-center gap-2 rounded-md border border-dashed px-4 py-3 transition-colors hover:opacity-80"
          style={{
            fontFamily: styles.fontFamily,
            fontSize: styles.labelFontSize,
            fontWeight: 500,
            borderColor: theme.colors.borderColor,
            backgroundColor: theme.colors.cardBackground,
            color: theme.colors.textSecondary,
          }}
        >
          <Plus className="h-4 w-4" />
          Create Custom Cross-Tab
        </button>
      )}

      {/* Builder Form */}
      {isBuilding && (
        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <h3
              style={{
                fontFamily: styles.fontFamily,
                fontSize: styles.labelFontSize,
                fontWeight: 500,
                color: theme.colors.textPrimary,
              }}
            >
              Build Cross-Tab
            </h3>
            <button
              onClick={() => setIsBuilding(false)}
              style={{ color: theme.colors.textMuted }}
              className="hover:opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className="mb-2 block"
                style={{
                  fontFamily: styles.fontFamily,
                  fontSize: styles.axisTickFontSize,
                  fontWeight: 500,
                  color: theme.colors.textSecondary,
                }}
              >
                Row Variable (Y-axis)
              </label>
              <select
                value={selectedRow}
                onChange={(e) => setSelectedRow(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1"
                style={{
                  fontFamily: styles.fontFamily,
                  fontSize: styles.labelFontSize,
                  borderColor: theme.colors.borderColor,
                  backgroundColor: theme.colors.cardBackground,
                  color: theme.colors.textPrimary,
                }}
              >
                <option value="">Select a variable...</option>
                {categoricalColumns.map((col) => (
                  <option key={col.name} value={col.name}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="mb-2 block"
                style={{
                  fontFamily: styles.fontFamily,
                  fontSize: styles.axisTickFontSize,
                  fontWeight: 500,
                  color: theme.colors.textSecondary,
                }}
              >
                Segment Variable (Colors/Stack)
              </label>
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1"
                style={{
                  fontFamily: styles.fontFamily,
                  fontSize: styles.labelFontSize,
                  borderColor: theme.colors.borderColor,
                  backgroundColor: theme.colors.cardBackground,
                  color: theme.colors.textPrimary,
                }}
              >
                <option value="">Select a variable...</option>
                {categoricalColumns.map((col) => (
                  <option key={col.name} value={col.name} disabled={col.name === selectedRow}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="mb-2 block"
                style={{
                  fontFamily: styles.fontFamily,
                  fontSize: styles.axisTickFontSize,
                  fontWeight: 500,
                  color: theme.colors.textSecondary,
                }}
              >
                Visualization Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVisualizationType('stacked')}
                  className="flex-1 rounded-md border px-3 py-2 transition-colors"
                  style={{
                    fontFamily: styles.fontFamily,
                    fontSize: styles.labelFontSize,
                    fontWeight: 500,
                    borderColor: visualizationType === 'stacked' ? theme.colors.textPrimary : theme.colors.borderColor,
                    backgroundColor: theme.colors.cardBackground,
                    color: visualizationType === 'stacked' ? theme.colors.textPrimary : theme.colors.textSecondary,
                  }}
                >
                  Stacked Bars
                </button>
                <button
                  type="button"
                  onClick={() => setVisualizationType('grouped')}
                  className="flex-1 rounded-md border px-3 py-2 transition-colors"
                  style={{
                    fontFamily: styles.fontFamily,
                    fontSize: styles.labelFontSize,
                    fontWeight: 500,
                    borderColor: visualizationType === 'grouped' ? theme.colors.textPrimary : theme.colors.borderColor,
                    backgroundColor: theme.colors.cardBackground,
                    color: visualizationType === 'grouped' ? theme.colors.textPrimary : theme.colors.textSecondary,
                  }}
                >
                  Grouped Bars
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsBuilding(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddCrossTab}
                disabled={!selectedRow || !selectedSegment || selectedRow === selectedSegment}
              >
                Create
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Cross-Tab Visualizations */}
      {crossTabs.map((crossTab) => {
        const { data, legend } = generateCrossTabData(crossTab);

        return (
          <Card key={crossTab.id} padding="lg">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex-1 mr-8">
                <div className="space-y-2">
                  <div
                    className="uppercase tracking-wide"
                    style={{
                      fontFamily: styles.fontFamily,
                      fontSize: styles.axisTickFontSize,
                      fontWeight: 500,
                      color: theme.colors.textMuted,
                    }}
                  >
                    Row Variable (Y-axis)
                  </div>
                  <div
                    style={{
                      fontFamily: styles.fontFamily,
                      fontSize: styles.labelFontSize,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    {crossTab.rowColumn}
                  </div>
                  <div
                    className="uppercase tracking-wide mt-3"
                    style={{
                      fontFamily: styles.fontFamily,
                      fontSize: styles.axisTickFontSize,
                      fontWeight: 500,
                      color: theme.colors.textMuted,
                    }}
                  >
                    Segment Variable (Colors/Stack)
                  </div>
                  <div
                    style={{
                      fontFamily: styles.fontFamily,
                      fontSize: styles.labelFontSize,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    {crossTab.segmentColumn}
                  </div>
                </div>
                <p
                  className="mt-3"
                  style={{
                    fontFamily: styles.fontFamily,
                    fontSize: styles.labelFontSize,
                    color: theme.colors.textSecondary,
                  }}
                >
                  n={surveyData.totalRows}
                </p>
              </div>
              <button
                onClick={() => handleRemoveCrossTab(crossTab.id)}
                className="flex-shrink-0 hover:opacity-70"
                style={{ color: theme.colors.textMuted }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Visualization */}
            <div className="mb-6">
              {crossTab.visualizationType === 'stacked' ? (
                <>
                  {/* Axis */}
                  {theme.grid.showAxisTicks && (
                    <div
                      className="flex items-center gap-4"
                      style={{ marginBottom: theme.layout.barGap }}
                    >
                      <div style={{ width: theme.layout.labelWidth }} className="flex-shrink-0" />
                      <div
                        className="flex flex-1 justify-between px-1"
                        style={{
                          fontFamily: styles.fontFamily,
                          fontSize: styles.axisTickFontSize,
                          color: theme.colors.textMuted,
                        }}
                      >
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  )}

                  {/* Stacked Bars */}
                  {data.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 group"
                      style={{ marginBottom: theme.layout.barGap }}
                    >
                      <div
                        className="flex-shrink-0 text-right"
                        style={{
                          width: theme.layout.labelWidth,
                          fontFamily: styles.fontFamily,
                          fontSize: styles.labelFontSize,
                          fontWeight: theme.typography.labelWeight,
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        className="flex flex-1 relative"
                        style={{ height: theme.layout.barHeight }}
                      >
                        {item.segments.map((seg, segIdx) => {
                          const pct = item.total > 0 ? (seg.value / item.total) * 100 : 0;
                          if (pct === 0) return null;

                          // Determine border radius based on theme settings
                          const isFirst = segIdx === item.segments.findIndex(s => s.value > 0);
                          const isLast = segIdx === [...item.segments].reverse().findIndex(s => s.value > 0);
                          const radius = BORDER_RADIUS_MAP[theme.shapes.barBorderRadius];
                          let borderRadius = '0';
                          if (theme.shapes.stackedBarRadius === 'all') {
                            borderRadius = radius;
                          } else if (theme.shapes.stackedBarRadius === 'ends-only') {
                            if (isFirst && isLast) borderRadius = radius;
                            else if (isFirst) borderRadius = `${radius} 0 0 ${radius}`;
                            else if (isLast) borderRadius = `0 ${radius} ${radius} 0`;
                          }

                          return (
                            <div
                              key={segIdx}
                              className="relative flex items-center justify-center"
                              style={{
                                width: `${pct}%`,
                                background: styles.getBarGradient(colors[segIdx % colors.length]),
                                borderRadius,
                                cursor: theme.effects.hoverCursor ? 'pointer' : 'default',
                                transition: styles.animationTransition,
                              }}
                              title={`${seg.name}: ${seg.value} (${pct.toFixed(1)}%)`}
                              onMouseEnter={(e) => {
                                if (theme.effects.hoverOpacity < 1) {
                                  e.currentTarget.style.opacity = String(theme.effects.hoverOpacity);
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                              }}
                            >
                              {theme.dataLabels.showStackedPercentages && pct > theme.dataLabels.minPercentageForLabel && (
                                <span
                                  style={{
                                    fontFamily: styles.fontFamily,
                                    fontSize: styles.valueFontSize,
                                    fontWeight: theme.typography.valueWeight,
                                    color: theme.colors.valueLabelColor,
                                  }}
                                >
                                  {pct.toFixed(theme.dataLabels.percentageDecimals)}%
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {/* Grouped Vertical Bars */}
                  <div className="flex gap-8 overflow-x-auto pb-4">
                    {data.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex flex-col items-center min-w-[180px]">
                        <div
                          className="mb-3 text-center line-clamp-2 h-8"
                          style={{
                            fontFamily: styles.fontFamily,
                            fontSize: styles.labelFontSize,
                            fontWeight: theme.typography.labelWeight,
                            color: theme.colors.textSecondary,
                          }}
                        >
                          {row.label}
                        </div>
                        <div
                          className="flex items-end justify-center gap-2"
                          style={{ height: theme.layout.groupedChartHeight }}
                        >
                          {row.segments.map((seg, segIdx) => {
                            const pct = row.total > 0 ? (seg.value / row.total) * 100 : 0;
                            const heightMultiplier = theme.layout.groupedChartHeight / 112; // Scale based on height

                            // Always render to maintain spacing, but invisible if 0
                            return (
                              <div key={segIdx} className="relative flex flex-col items-center">
                                {/* Percentage label on top - only show if value > 0 */}
                                {theme.dataLabels.showStackedPercentages && pct > 0 && (
                                  <span
                                    className="mb-1 h-4"
                                    style={{
                                      fontFamily: styles.fontFamily,
                                      fontSize: styles.valueFontSize,
                                      fontWeight: theme.typography.valueWeight,
                                      color: theme.colors.textPrimary,
                                    }}
                                  >
                                    {pct.toFixed(theme.dataLabels.percentageDecimals)}%
                                  </span>
                                )}
                                {(!theme.dataLabels.showStackedPercentages || pct === 0) && <span className="mb-1 h-4" />}
                                <div
                                  style={{
                                    width: theme.layout.groupedBarWidth,
                                    height: `${Math.max(pct * heightMultiplier, pct > 0 ? 20 : 0)}px`,
                                    background: pct > 0 ? styles.getBarGradient(colors[segIdx % colors.length]) : 'transparent',
                                    borderRadius: pct > 0 ? `${styles.groupedBarBorderRadius} ${styles.groupedBarBorderRadius} 0 0` : undefined,
                                    cursor: pct > 0 && theme.effects.hoverCursor ? 'pointer' : 'default',
                                    transition: pct > 0 ? styles.animationTransition : undefined,
                                  }}
                                  title={pct > 0 ? `${seg.name}: ${seg.value} (${pct.toFixed(1)}%)` : ''}
                                  onMouseEnter={(e) => {
                                    if (pct > 0 && theme.effects.hoverOpacity < 1) {
                                      e.currentTarget.style.opacity = String(theme.effects.hoverOpacity);
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (pct > 0) {
                                      e.currentTarget.style.opacity = '1';
                                    }
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Legend */}
            {theme.layout.legendPosition !== 'none' && (
              <div
                className="border-t pt-4"
                style={{ borderColor: theme.colors.borderColor }}
              >
                <div className="space-y-2">
                  {legend.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="flex-shrink-0"
                        style={{
                          width: theme.layout.legendSwatchSize,
                          height: theme.layout.legendSwatchSize,
                          backgroundColor: colors[i % colors.length],
                          borderRadius: theme.shapes.legendSwatchShape === 'circle'
                            ? '50%'
                            : theme.shapes.legendSwatchShape === 'rounded'
                            ? '2px'
                            : '0',
                        }}
                      />
                      <span
                        style={{
                          fontFamily: styles.fontFamily,
                          fontSize: styles.legendFontSize,
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
