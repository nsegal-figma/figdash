import { ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react';
import { useSurveyStore } from '../stores/useSurveyStore';

export function SortSelector() {
  const { sortOrder, setSortOrder } = useSurveyStore();

  const toggleSort = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  return (
    <button
      onClick={toggleSort}
      className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
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
