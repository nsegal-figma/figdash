/**
 * ChartTypeSelector Component
 * Accessible dropdown for selecting chart type with recommendations
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  BarChart2,
  PieChart,
  Circle,
  GitCommitHorizontal,
  ChevronDown,
  Target,
  Grid3x3,
  LayoutGrid,
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
  BarChart: BarChart3,
  Layers: BarChart3,
  ArrowLeftRight: BarChart3,
  BarChart4: BarChart3,
  Grid3x3: Grid3x3,
  LayoutGrid: LayoutGrid,
};

function getChartIcon(iconName: string): React.ElementType {
  return CHART_ICONS[iconName] || BarChart3;
}

// ============ Constants ============

const IMPLEMENTED_TYPES: ChartType[] = [
  'horizontal-bar', 'vertical-bar', 'pie', 'donut', 'lollipop',
  'stacked-bar', 'histogram', 'waffle', 'treemap', 'diverging-bar',
];

// ============ Main Component ============

export function ChartTypeSelector({
  recommendations,
  selectedType,
  onTypeChange,
}: ChartTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const { theme, styles } = useChartTheme();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedConfig = CHART_TYPE_CONFIGS[selectedType];
  const SelectedIcon = getChartIcon(selectedConfig.icon);

  // Get recommended types (confidence > 0.6)
  const recommendedTypes = recommendations.filter((r) => r.confidence >= 0.6);

  // Build flat list of selectable items for keyboard navigation
  const selectableItems = (() => {
    const items: ChartType[] = [];
    // Recommended first
    for (const rec of recommendedTypes) {
      if (IMPLEMENTED_TYPES.includes(rec.type)) items.push(rec.type);
    }
    // Then all charts not already in recommended
    const categories = [
      getChartTypesByCategory('bar'),
      getChartTypesByCategory('part-to-whole'),
      getChartTypesByCategory('ranking'),
    ].flat();
    for (const type of categories) {
      if (IMPLEMENTED_TYPES.includes(type) && !items.includes(type)) {
        items.push(type);
      }
    }
    return items;
  })();

  const handleSelect = useCallback((type: ChartType) => {
    onTypeChange(type);
    setIsOpen(false);
    setFocusIndex(-1);
    triggerRef.current?.focus();
  }, [onTypeChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setFocusIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusIndex((prev) => Math.min(prev + 1, selectableItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusIndex >= 0 && focusIndex < selectableItems.length) {
          handleSelect(selectableItems[focusIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusIndex(-1);
        triggerRef.current?.focus();
        break;
      case 'Home':
        e.preventDefault();
        setFocusIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusIndex(selectableItems.length - 1);
        break;
    }
  }, [isOpen, focusIndex, selectableItems, handleSelect]);

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && focusIndex >= 0 && menuRef.current) {
      const items = menuRef.current.querySelectorAll('[role="option"]');
      items[focusIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, focusIndex]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setFocusIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Get all available chart types grouped by category
  const categories = [
    { category: 'bar', label: CHART_CATEGORY_LABELS['bar'], types: getChartTypesByCategory('bar') },
    { category: 'part-to-whole', label: CHART_CATEGORY_LABELS['part-to-whole'], types: getChartTypesByCategory('part-to-whole') },
    { category: 'proportional', label: CHART_CATEGORY_LABELS['proportional'], types: getChartTypesByCategory('proportional') },
    { category: 'ranking', label: CHART_CATEGORY_LABELS['ranking'], types: getChartTypesByCategory('ranking') },
    { category: 'distribution', label: CHART_CATEGORY_LABELS['distribution'], types: getChartTypesByCategory('distribution') },
    { category: 'comparison', label: CHART_CATEGORY_LABELS['comparison'], types: getChartTypesByCategory('comparison') },
  ];

  const renderOption = (type: ChartType, rec?: ChartRecommendation) => {
    const config = CHART_TYPE_CONFIGS[type];
    const Icon = getChartIcon(config.icon);
    const isSelected = type === selectedType;
    const itemIndex = selectableItems.indexOf(type);
    const isFocused = itemIndex === focusIndex;
    const confidenceLabel = rec ? getConfidenceLabel(rec.confidence) : null;

    return (
      <div
        key={type}
        role="option"
        aria-selected={isSelected}
        tabIndex={-1}
        onClick={() => handleSelect(type)}
        onMouseEnter={() => setFocusIndex(itemIndex)}
        className="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors"
        style={{
          backgroundColor: isFocused
            ? `${theme.colors.textPrimary}15`
            : isSelected
              ? `${theme.colors.textPrimary}10`
              : undefined,
          fontFamily: styles.fontFamily,
          outline: 'none',
        }}
      >
        <Icon
          className="h-4 w-4 flex-shrink-0"
          style={{ color: theme.colors.textSecondary }}
          aria-hidden="true"
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
            {rec?.isDefault && (
              <Target
                className="h-3 w-3"
                style={{ color: '#f59e0b' }}
                aria-label="Default recommendation"
              />
            )}
          </div>
          {rec && (
            <div
              style={{
                fontSize: styles.axisTickFontSize,
                color: theme.colors.textMuted,
              }}
            >
              {rec.reason}
            </div>
          )}
        </div>
        {confidenceLabel && (
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: rec && rec.confidence >= 0.85 ? '#f59e0b20' : '#6b728020',
              color: rec && rec.confidence >= 0.85 ? '#d97706' : theme.colors.textMuted,
            }}
          >
            {confidenceLabel}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="relative" data-export-exclude>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setFocusIndex(0);
        }}
        onKeyDown={handleKeyDown}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1.5 transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1"
        style={{
          fontFamily: styles.fontFamily,
          fontSize: styles.axisTickFontSize,
          fontWeight: 500,
          borderColor: theme.colors.borderColor,
          backgroundColor: theme.colors.cardBackground,
          color: theme.colors.textSecondary,
          // @ts-expect-error CSS custom property for focus ring
          '--tw-ring-color': theme.colors.textPrimary,
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Chart type: ${selectedConfig.label}. Click to change.`}
      >
        <SelectedIcon className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">{selectedConfig.label}</span>
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            role="listbox"
            aria-label="Select chart type"
            aria-activedescendant={focusIndex >= 0 ? `chart-option-${selectableItems[focusIndex]}` : undefined}
            onKeyDown={handleKeyDown}
            className="absolute right-0 top-full z-20 mt-1 w-80 max-h-80 overflow-y-auto rounded-md border py-1 shadow-lg"
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
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
                role="presentation"
              >
                Recommended
              </div>
              {recommendedTypes.map((rec) => {
                if (!IMPLEMENTED_TYPES.includes(rec.type)) return null;
                return renderOption(rec.type, rec);
              })}
              <div
                className="my-1 border-t"
                style={{ borderColor: theme.colors.borderColor }}
                role="separator"
              />
            </>
          )}

          {/* All Charts Section */}
          <div
            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
            style={{ color: theme.colors.textMuted }}
            role="presentation"
          >
            All Charts
          </div>
          {categories.map((cat) => {
            const availableTypes = cat.types.filter((t) => IMPLEMENTED_TYPES.includes(t));
            if (availableTypes.length === 0) return null;

            return (
              <div key={cat.category}>
                {availableTypes.map((chartType) => {
                  if (recommendedTypes.some((r) => r.type === chartType)) return null;
                  return renderOption(chartType);
                })}
              </div>
            );
          })}
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
