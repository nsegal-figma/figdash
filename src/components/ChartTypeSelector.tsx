/**
 * ChartTypeSelector Component
 * Dropdown for selecting chart type with recommendations
 */

import { useState } from 'react';
import {
  BarChart3,
  BarChart2,
  PieChart,
  Circle,
  GitCommitHorizontal,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useChartTheme } from '../hooks/useChartTheme';
import type { ChartType, ChartRecommendation } from '../types/chartTypes';
import {
  CHART_TYPE_CONFIGS,
  CHART_CATEGORY_LABELS,
  getChartTypesByCategory,
} from '../types/chartTypes';
import { getConfidenceLabel } from '../lib/analytics/chartRecommendations';

// ============ Types ============

export interface ChartTypeSelectorProps {
  /** Available recommendations for this data */
  recommendations: ChartRecommendation[];
  /** Currently selected chart type */
  selectedType: ChartType;
  /** Callback when type changes */
  onTypeChange: (type: ChartType) => void;
}

// ============ Icon Mapping ============

const CHART_ICONS: Record<string, React.ElementType> = {
  BarChart3: BarChart3,
  BarChart2: BarChart2,
  PieChart: PieChart,
  Circle: Circle,
  GitCommitHorizontal: GitCommitHorizontal,
  // Fallback for other icons
  BarChart: BarChart3,
  Layers: BarChart3,
  ArrowLeftRight: BarChart3,
  BarChart4: BarChart3,
};

function getChartIcon(iconName: string): React.ElementType {
  return CHART_ICONS[iconName] || BarChart3;
}

// ============ Main Component ============

export function ChartTypeSelector({
  recommendations,
  selectedType,
  onTypeChange,
}: ChartTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, styles } = useChartTheme();

  const selectedConfig = CHART_TYPE_CONFIGS[selectedType];
  const SelectedIcon = getChartIcon(selectedConfig.icon);

  // Get recommended types (confidence > 0.6)
  const recommendedTypes = recommendations.filter((r) => r.confidence >= 0.6);

  // Get all available chart types grouped by category
  const categories: Array<{
    category: string;
    label: string;
    types: ChartType[];
  }> = [
    { category: 'bar', label: CHART_CATEGORY_LABELS['bar'], types: getChartTypesByCategory('bar') },
    { category: 'part-to-whole', label: CHART_CATEGORY_LABELS['part-to-whole'], types: getChartTypesByCategory('part-to-whole') },
    { category: 'ranking', label: CHART_CATEGORY_LABELS['ranking'], types: getChartTypesByCategory('ranking') },
  ];

  // Filter to only show types that are implemented
  const implementedTypes: ChartType[] = ['horizontal-bar', 'vertical-bar', 'pie', 'donut', 'lollipop'];

  const handleSelect = (type: ChartType) => {
    onTypeChange(type);
    setIsOpen(false);
  };

  return (
    <div className="relative" data-export-exclude>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 transition-colors hover:opacity-80"
        style={{
          fontFamily: styles.fontFamily,
          fontSize: styles.axisTickFontSize,
          fontWeight: 500,
          borderColor: theme.colors.borderColor,
          backgroundColor: theme.colors.cardBackground,
          color: theme.colors.textSecondary,
        }}
        title="Change chart type"
      >
        <SelectedIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{selectedConfig.label}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div
            className="absolute left-0 top-full z-20 mt-1 w-64 rounded-md border py-1 shadow-lg"
            style={{
              borderColor: theme.colors.borderColor,
              backgroundColor: theme.colors.cardBackground,
            }}
          >
            {/* Recommended Section */}
            {recommendedTypes.length > 0 && (
              <>
                <div
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: theme.colors.textMuted }}
                >
                  Recommended
                </div>
                {recommendedTypes.map((rec) => {
                  const config = CHART_TYPE_CONFIGS[rec.type];
                  if (!implementedTypes.includes(rec.type)) return null;
                  const Icon = getChartIcon(config.icon);
                  const confidenceLabel = getConfidenceLabel(rec.confidence);
                  const isSelected = rec.type === selectedType;

                  return (
                    <button
                      key={rec.type}
                      onClick={() => handleSelect(rec.type)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:opacity-80 transition-colors"
                      style={{
                        backgroundColor: isSelected ? `${theme.colors.textPrimary}10` : undefined,
                        fontFamily: styles.fontFamily,
                      }}
                    >
                      <Icon
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: theme.colors.textSecondary }}
                      />
                      <div className="flex-1 text-left">
                        <div
                          className="flex items-center gap-2"
                          style={{
                            fontSize: styles.labelFontSize,
                            color: theme.colors.textPrimary,
                            fontWeight: isSelected ? 600 : 400,
                          }}
                        >
                          {config.label}
                          {rec.isDefault && (
                            <Sparkles
                              className="h-3 w-3"
                              style={{ color: '#f59e0b' }}
                            />
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: styles.axisTickFontSize,
                            color: theme.colors.textMuted,
                          }}
                        >
                          {rec.reason}
                        </div>
                      </div>
                      {confidenceLabel && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: rec.confidence >= 0.85 ? '#f59e0b20' : '#6b728020',
                            color: rec.confidence >= 0.85 ? '#d97706' : theme.colors.textMuted,
                          }}
                        >
                          {confidenceLabel}
                        </span>
                      )}
                    </button>
                  );
                })}
                <div
                  className="my-1 border-t"
                  style={{ borderColor: theme.colors.borderColor }}
                />
              </>
            )}

            {/* All Charts Section */}
            <div
              className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
              style={{ color: theme.colors.textMuted }}
            >
              All Charts
            </div>
            {categories.map((cat) => {
              const availableTypes = cat.types.filter((t) => implementedTypes.includes(t));
              if (availableTypes.length === 0) return null;

              return (
                <div key={cat.category}>
                  {availableTypes.map((chartType) => {
                    const config = CHART_TYPE_CONFIGS[chartType];
                    const Icon = getChartIcon(config.icon);
                    const isSelected = chartType === selectedType;
                    // Don't show in "All Charts" if already in recommended
                    if (recommendedTypes.some((r) => r.type === chartType)) return null;

                    return (
                      <button
                        key={chartType}
                        onClick={() => handleSelect(chartType)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:opacity-80 transition-colors"
                        style={{
                          backgroundColor: isSelected ? `${theme.colors.textPrimary}10` : undefined,
                          fontFamily: styles.fontFamily,
                        }}
                      >
                        <Icon
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color: theme.colors.textSecondary }}
                        />
                        <div className="flex-1 text-left">
                          <div
                            style={{
                              fontSize: styles.labelFontSize,
                              color: theme.colors.textPrimary,
                              fontWeight: isSelected ? 600 : 400,
                            }}
                          >
                            {config.label}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
