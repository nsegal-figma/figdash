import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { useSurveyStore } from '../stores/useSurveyStore';
import { useChartTheme } from '../hooks/useChartTheme';

interface ChartFilterProps {
  columnName: string;
  availableValues: string[];
}

export function ChartFilter({ columnName, availableValues }: ChartFilterProps) {
  const { filters, setFilter, clearFilter } = useSurveyStore();
  const { theme, styles } = useChartTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentFilter = filters.get(columnName) || [];
  const hasFilter = currentFilter.length > 0;

  const toggleValue = (value: string) => {
    const newFilter = currentFilter.includes(value)
      ? currentFilter.filter(v => v !== value)
      : [...currentFilter, value];

    setFilter(columnName, newFilter);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearFilter(columnName);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 transition-colors hover:opacity-80"
        style={{
          fontFamily: styles.fontFamily,
          fontSize: styles.axisTickFontSize,
          fontWeight: 500,
          borderColor: hasFilter ? theme.colors.textPrimary : theme.colors.borderColor,
          backgroundColor: theme.colors.cardBackground,
          color: hasFilter ? theme.colors.textPrimary : theme.colors.textSecondary,
        }}
      >
        <Filter className="h-3 w-3" />
        Filter
        {hasFilter && (
          <>
            <span style={{ color: theme.colors.textMuted }}>·</span>
            <span>{currentFilter.length}</span>
            <button
              onClick={handleClear}
              className="ml-1 hover:opacity-70"
              style={{ color: theme.colors.textMuted }}
            >
              <X className="h-3 w-3" />
            </button>
          </>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            className="absolute right-0 top-full z-20 mt-1 w-64 rounded-md border p-3 shadow-lg"
            style={{
              borderColor: theme.colors.borderColor,
              backgroundColor: theme.colors.cardBackground,
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h4
                style={{
                  fontFamily: styles.fontFamily,
                  fontSize: styles.axisTickFontSize,
                  fontWeight: 500,
                  color: theme.colors.textPrimary,
                }}
              >
                Show only:
              </h4>
              {hasFilter && (
                <button
                  onClick={handleClear}
                  className="hover:opacity-70"
                  style={{
                    fontFamily: styles.fontFamily,
                    fontSize: styles.axisTickFontSize,
                    color: theme.colors.textMuted,
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableValues.map((value) => {
                const isSelected = currentFilter.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleValue(value)}
                    className="rounded-md border px-2.5 py-1.5 transition-colors hover:opacity-80"
                    style={{
                      fontFamily: styles.fontFamily,
                      fontSize: styles.axisTickFontSize,
                      fontWeight: 500,
                      borderColor: isSelected ? theme.colors.textPrimary : theme.colors.borderColor,
                      backgroundColor: isSelected ? theme.colors.textPrimary : theme.colors.cardBackground,
                      color: isSelected ? theme.colors.cardBackground : theme.colors.textSecondary,
                    }}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
