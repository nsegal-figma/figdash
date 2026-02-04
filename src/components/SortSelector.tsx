import { ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react';
import { useSurveyStore } from '../stores/useSurveyStore';
import { useChartTheme } from '../hooks/useChartTheme';

export function SortSelector() {
  const { sortOrder, setSortOrder } = useSurveyStore();
  const { theme, styles } = useChartTheme();

  const toggleSort = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  return (
    <button
      onClick={toggleSort}
      className="inline-flex items-center gap-2 rounded-md border px-3 py-2 transition-colors hover:opacity-80"
      style={{
        fontFamily: styles.fontFamily,
        fontSize: styles.labelFontSize,
        fontWeight: 500,
        borderColor: theme.colors.borderColor,
        backgroundColor: theme.colors.cardBackground,
        color: theme.colors.textPrimary,
      }}
      title={sortOrder === 'desc' ? 'Sort: High to Low' : 'Sort: Low to High'}
    >
      {sortOrder === 'desc' ? (
        <ArrowDownNarrowWide className="h-4 w-4" />
      ) : (
        <ArrowUpNarrowWide className="h-4 w-4" />
      )}
      Sort
    </button>
  );
}
