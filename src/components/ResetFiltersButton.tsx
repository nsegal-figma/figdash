import { FilterX } from 'lucide-react';
import { useSurveyStore } from '../stores/useSurveyStore';

export function ResetFiltersButton() {
  const { filters, clearAllFilters } = useSurveyStore();
  const hasFilters = filters.size > 0;

  if (!hasFilters) return null;

  return (
    <button
      onClick={clearAllFilters}
      className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
    >
      <FilterX className="h-4 w-4" />
      Reset Filters
      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-900">
        {filters.size}
      </span>
    </button>
  );
}
