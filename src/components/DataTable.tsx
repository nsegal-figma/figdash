import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { Column } from '../types/survey';

export interface DataTableProps {
  columns: Column[];
  data: Record<string, string | number>[];
  maxRows?: number;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable({ columns, data, maxRows = 10 }: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (columnName: string) => {
    if (sortColumn === columnName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === '' || aValue == null) return 1;
      if (bValue === '' || bValue == null) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);
      
      return sortDirection === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sortColumn, sortDirection]);

  const displayData = sortedData.slice(0, maxRows);

  const getColumnTypeColor = (type: Column['type']) => {
    switch (type) {
      case 'number': return 'text-blue-600';
      case 'categorical': return 'text-purple-600';
      case 'date': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.name}
                  onClick={() => handleSort(column.name)}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{column.name}</span>
                        <span className={`text-[10px] font-normal ${getColumnTypeColor(column.type)}`}>
                          {column.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {sortColumn === column.name ? (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column.name}`}
                    className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                  >
                    {row[column.name] === '' || row[column.name] == null ? (
                      <span className="text-gray-400 italic">—</span>
                    ) : (
                      String(row[column.name])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > maxRows && (
        <p className="mt-2 text-sm text-gray-600 text-center">
          Showing {maxRows} of {data.length} rows
        </p>
      )}
    </div>
  );
}

