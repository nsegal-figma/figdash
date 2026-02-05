import { useState } from 'react';
import { Download } from 'lucide-react';
import { useChartImageExport } from '../hooks/useChartImageExport';
import { useChartTheme } from '../hooks/useChartTheme';
import { useSVGExport, type ChartExportData } from '../hooks/useSVGExport';

interface ChartExportButtonProps {
  chartId: string;
  chartTitle: string;
  chartData?: ChartExportData;
}

export function ChartExportButton({ chartId, chartTitle, chartData }: ChartExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { exportChartAsImage } = useChartImageExport();
  const { downloadChartSVG } = useSVGExport();
  const { theme, styles } = useChartTheme();

  const handleExportPNG = async (includeTable: boolean) => {
    const fileName = `${chartTitle.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    await exportChartAsImage(chartId, fileName, includeTable);
    setIsOpen(false);
  };

  const handleExportSVG = () => {
    if (chartData) {
      downloadChartSVG(chartData);
    }
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
              onClick={() => handleExportPNG(false)}
              className="w-full px-3 py-2 text-left hover:opacity-80"
              style={{
                fontFamily: styles.fontFamily,
                fontSize: styles.axisTickFontSize,
                color: theme.colors.textSecondary,
              }}
            >
              PNG (Chart only)
            </button>
            <button
              onClick={() => handleExportPNG(true)}
              className="w-full px-3 py-2 text-left hover:opacity-80"
              style={{
                fontFamily: styles.fontFamily,
                fontSize: styles.axisTickFontSize,
                color: theme.colors.textSecondary,
              }}
            >
              PNG (Chart + Table)
            </button>
            {chartData && (
              <button
                onClick={handleExportSVG}
                className="w-full px-3 py-2 text-left hover:opacity-80"
                style={{
                  fontFamily: styles.fontFamily,
                  fontSize: styles.axisTickFontSize,
                  color: theme.colors.textSecondary,
                }}
              >
                SVG (Editable)
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
