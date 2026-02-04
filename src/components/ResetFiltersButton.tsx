import { FilterX } from 'lucide-react';
import { useSurveyStore } from '../stores/useSurveyStore';
import { useChartTheme } from '../hooks/useChartTheme';

export function ResetFiltersButton() {
  const { filters, clearAllFilters } = useSurveyStore();
  const { theme, styles } = useChartTheme();
  const hasFilters = filters.size > 0;

  if (!hasFilters) return null;

  return (
    <button
      onClick={clearAllFilters}
      className="inline-flex items-center gap-2 rounded-md border px-3 py-2 transition-colors hover:opacity-80"
      style={{
        fontFamily: styles.fontFamily,
        fontSize: styles.labelFontSize,
        fontWeight: 500,
        borderColor: theme.colors.borderColor,
        backgroundColor: theme.colors.cardBackground,
        color: theme.colors.textPrimary,
      }}
    >
      <FilterX className="h-4 w-4" />
      Reset Filters
      <span
        className="rounded-md px-1.5 py-0.5"
        style={{
          fontFamily: styles.fontFamily,
          fontSize: styles.axisTickFontSize,
          fontWeight: 600,
          backgroundColor: theme.colors.borderColor,
          color: theme.colors.textPrimary,
        }}
      >
        {filters.size}
      </span>
    </button>
  );
}
