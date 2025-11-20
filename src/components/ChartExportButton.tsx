import { useState } from 'react';
import { Download } from 'lucide-react';
import { useChartImageExport } from '../hooks/useChartImageExport';

interface ChartExportButtonProps {
  chartId: string;
  chartTitle: string;
}

export function ChartExportButton({ chartId, chartTitle }: ChartExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { exportChartAsImage } = useChartImageExport();

  const handleExport = async (includeTable: boolean) => {
    const fileName = `${chartTitle.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    await exportChartAsImage(chartId, fileName, includeTable);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
        data-export-exclude
      >
        <Download className="h-3 w-3" />
        Export
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            <button
              onClick={() => handleExport(false)}
              className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
            >
              Chart only
            </button>
            <button
              onClick={() => handleExport(true)}
              className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
            >
              Chart + Data Table
            </button>
          </div>
        </>
      )}
    </div>
  );
}
