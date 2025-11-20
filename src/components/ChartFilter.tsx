import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { useSurveyStore } from '../stores/useSurveyStore';

interface ChartFilterProps {
  columnName: string;
  availableValues: string[];
}

export function ChartFilter({ columnName, availableValues }: ChartFilterProps) {
  const { filters, setFilter, clearFilter } = useSurveyStore();
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
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
          hasFilter
            ? 'border-gray-900 bg-gray-50 text-gray-900'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Filter className="h-3 w-3" />
        Filter
        {hasFilter && (
          <>
            <span className="text-gray-400">·</span>
            <span>{currentFilter.length}</span>
            <button
              onClick={handleClear}
              className="ml-1 text-gray-500 hover:text-gray-700"
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
          <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-md border border-gray-200 bg-white p-3 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xs font-medium text-gray-900">Show only:</h4>
              {hasFilter && (
                <button
                  onClick={handleClear}
                  className="text-xs text-gray-500 hover:text-gray-700"
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
                    className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      isSelected
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
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
