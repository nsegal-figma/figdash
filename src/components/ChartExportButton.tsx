import { useState } from 'react';
import { Download } from 'lucide-react';
import { useChartImageExport } from '../hooks/useChartImageExport';
import { useChartTheme } from '../hooks/useChartTheme';

interface ChartExportButtonProps {
  chartId: string;
  chartTitle: string;
}

export function ChartExportButton({ chartId, chartTitle }: ChartExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { exportChartAsImage } = useChartImageExport();
  const { theme, styles } = useChartTheme();

  const handleExport = async (includeTable: boolean) => {
    const fileName = `${chartTitle.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    await exportChartAsImage(chartId, fileName, includeTable);
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
          borderColor: theme.colors.borderColor,
          backgroundColor: theme.colors.cardBackground,
          color: theme.colors.textSecondary,
        }}
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
          <div
            className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border py-1 shadow-lg"
            style={{
              borderColor: theme.colors.borderColor,
              backgroundColor: theme.colors.cardBackground,
            }}
          >
            <button
              onClick={() => handleExport(false)}
              className="w-full px-3 py-2 text-left hover:opacity-80"
              style={{
                fontFamily: styles.fontFamily,
                fontSize: styles.axisTickFontSize,
                color: theme.colors.textSecondary,
              }}
            >
              Chart only
            </button>
            <button
              onClick={() => handleExport(true)}
              className="w-full px-3 py-2 text-left hover:opacity-80"
              style={{
                fontFamily: styles.fontFamily,
                fontSize: styles.axisTickFontSize,
                color: theme.colors.textSecondary,
              }}
            >
              Chart + Data Table
            </button>
          </div>
        </>
      )}
    </div>
  );
}
