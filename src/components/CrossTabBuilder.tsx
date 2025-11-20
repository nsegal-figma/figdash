import { useState, useMemo } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
import { useSurveyStore } from '../stores/useSurveyStore';
import { Card, Button } from './';
import { generateColorsFromPalette } from '../lib/colorPalettes';
import { suggestCrossTabs } from '../lib/analytics/crossTabSuggestions';

interface CrossTabVisualization {
  id: string;
  rowColumn: string;
  segmentColumn: string;
  visualizationType: 'stacked' | 'grouped';
}

export function CrossTabBuilder() {
  const { surveyData, selectedPalette, filters } = useSurveyStore();
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

    const uniqueRows = [...new Set(rowValues)] as string[];
    const uniqueSegments = [...new Set(segmentValues)] as string[];

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

    return { data, legend: uniqueSegments.map(String) };
  };

  const colors = generateColorsFromPalette(selectedPalette, 20);

  return (
    <div className="space-y-6">
      {/* Suggested Cross-Tabs */}
      {suggestions.length > 0 && showSuggestions && (
        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gray-700" />
              <h3 className="text-sm font-medium text-gray-900">Suggested Cross-Tabs</h3>
              <div className="group relative">
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <div className="pointer-events-none absolute left-0 top-full z-20 mt-1 hidden w-64 rounded-md border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-lg group-hover:block">
                  <strong>Strength</strong> measures how strongly two variables are related.
                  <ul className="mt-2 space-y-1">
                    <li>• <strong>30%+</strong>: Strong relationship</li>
                    <li>• <strong>20-30%</strong>: Moderate relationship</li>
                    <li>• <strong>10-20%</strong>: Weak but notable</li>
                    <li>• <strong>0%</strong>: No relationship</li>
                  </ul>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          </div>
          <p className="mb-4 text-xs text-gray-600">
            Statistical analysis found these variable pairs have interesting patterns worth exploring
          </p>
          <div className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleCreateFromSuggestion(suggestion.rowColumn, suggestion.segmentColumn)}
                className="w-full rounded-md border border-gray-200 bg-white p-3 text-left transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {suggestion.rowColumn} × {suggestion.segmentColumn}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">{suggestion.insight}</div>
                  </div>
                  <div className="ml-3 flex items-center gap-1">
                    <div className="text-xs font-semibold text-gray-900">
                      {(suggestion.cramersV * 100).toFixed(0)}%
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
          className="inline-flex items-center gap-2 rounded-md border border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Create Custom Cross-Tab
        </button>
      )}

      {/* Builder Form */}
      {isBuilding && (
        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Build Cross-Tab</h3>
            <button
              onClick={() => setIsBuilding(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Row Variable (Y-axis)
              </label>
              <select
                value={selectedRow}
                onChange={(e) => setSelectedRow(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
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
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Segment Variable (Colors/Stack)
              </label>
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
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
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Visualization Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVisualizationType('stacked')}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    visualizationType === 'stacked'
                      ? 'border-gray-900 bg-gray-50 text-gray-900'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Stacked Bars
                </button>
                <button
                  type="button"
                  onClick={() => setVisualizationType('grouped')}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    visualizationType === 'grouped'
                      ? 'border-gray-900 bg-gray-50 text-gray-900'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
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
              <div>
                <h2 className="text-base font-medium text-gray-900">
                  {crossTab.rowColumn} by {crossTab.segmentColumn}
                </h2>
                <p className="mt-0.5 text-sm text-gray-600">n={surveyData.totalRows}</p>
              </div>
              <button
                onClick={() => handleRemoveCrossTab(crossTab.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Visualization */}
            <div className="mb-6">
              {crossTab.visualizationType === 'stacked' ? (
                <>
                  {/* Axis */}
                  <div className="mb-2 flex items-center gap-4">
                    <div className="w-56 flex-shrink-0" />
                    <div className="flex flex-1 justify-between px-1 text-xs text-gray-400">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Stacked Bars */}
                  {data.map((item, idx) => (
                    <div key={idx} className="mb-2 flex items-center gap-4 group">
                      <div className="w-56 flex-shrink-0 text-right text-sm text-gray-700">
                        {item.label}
                      </div>
                      <div className="flex h-10 flex-1 relative">
                        {item.segments.map((seg, segIdx) => {
                          const pct = item.total > 0 ? (seg.value / item.total) * 100 : 0;
                          if (pct === 0) return null;

                          return (
                            <div
                              key={segIdx}
                              className="relative flex items-center justify-center transition-all hover:opacity-90 first:rounded-l-md last:rounded-r-md cursor-pointer"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: colors[segIdx % colors.length],
                              }}
                              title={`${seg.name}: ${seg.value} (${pct.toFixed(1)}%)`}
                            >
                              {pct > 5 && (
                                <span className="text-xs font-semibold text-white">
                                  {pct.toFixed(0)}%
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
                  <div className="flex gap-8 overflow-x-auto">
                    {data.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex-1 min-w-[150px]">
                        <div className="mb-3 text-center text-xs font-medium text-gray-700 line-clamp-2">
                          {row.label}
                        </div>
                        <div className="flex items-end justify-center gap-3" style={{ height: '250px' }}>
                          {row.segments.map((seg, segIdx) => {
                            if (seg.value === 0) return null;
                            const pct = row.total > 0 ? (seg.value / row.total) * 100 : 0;

                            return (
                              <div key={segIdx} className="relative flex flex-col items-center group">
                                <div
                                  className="w-14 rounded-t-md transition-all hover:opacity-90 cursor-pointer relative"
                                  style={{
                                    height: `${pct * 2.5}px`, // Scale to fit 250px container
                                    minHeight: '20px',
                                    backgroundColor: colors[segIdx % colors.length],
                                  }}
                                  title={`${seg.name}: ${seg.value} (${pct.toFixed(1)}%)`}
                                >
                                  {/* Percentage label on top */}
                                  {pct > 5 && (
                                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-900">
                                      {pct.toFixed(0)}%
                                    </span>
                                  )}
                                </div>
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
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {legend.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div
                      className="h-3 w-3 flex-shrink-0 rounded-sm mt-0.5"
                      style={{ backgroundColor: colors[i % colors.length] }}
                    />
                    <span className="text-xs leading-relaxed text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
