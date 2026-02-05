import { useState } from 'react';
import { Copy, Check, ChevronDown } from 'lucide-react';
import { useClipboardCopy } from '../hooks/useClipboardCopy';
import { useChartTheme } from '../hooks/useChartTheme';
import { useSVGExport, type ChartExportData } from '../hooks/useSVGExport';

interface CopyChartButtonProps {
  chartId: string;
  chartData?: ChartExportData;
}

export function CopyChartButton({ chartId, chartData }: CopyChartButtonProps) {
  const [copied, setCopied] = useState<'png' | 'svg' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { copyChartToClipboard } = useClipboardCopy();
  const { copyChartSVGToClipboard } = useSVGExport();
  const { theme, styles } = useChartTheme();

  const handleCopyPNG = async () => {
    setIsLoading(true);
    setIsOpen(false);
    const success = await copyChartToClipboard(chartId);

    if (success) {
      setCopied('png');
      setTimeout(() => setCopied(null), 2000);
    } else {
      alert('Failed to copy chart. Please try exporting instead.');
    }

    setIsLoading(false);
  };

  const handleCopySVG = async () => {
    if (!chartData) return;

    setIsLoading(true);
    setIsOpen(false);
    const success = await copyChartSVGToClipboard(chartData);

    if (success) {
      setCopied('svg');
      setTimeout(() => setCopied(null), 2000);
    } else {
      alert('Failed to copy SVG. Please try downloading instead.');
    }

    setIsLoading(false);
  };

  // If chartData is available, show dropdown. Otherwise, show simple PNG button.
  if (!chartData) {
    return (
      <button
        onClick={handleCopyPNG}
        disabled={isLoading || copied !== null}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 transition-colors ${
          copied ? 'border-green-300 bg-green-50 text-green-700' : 'hover:opacity-80'
        }`}
        style={
          copied
            ? {
                fontFamily: styles.fontFamily,
                fontSize: styles.axisTickFontSize,
                fontWeight: 500,
              }
            : {
                fontFamily: styles.fontFamily,
                fontSize: styles.axisTickFontSize,
                fontWeight: 500,
                borderColor: theme.colors.borderColor,
                backgroundColor: theme.colors.cardBackground,
                color: theme.colors.textSecondary,
              }
        }
        data-export-exclude
        title="Copy chart to clipboard"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Copy
          </>
        )}
      </button>
    );
  }

  return (
    <div className="relative" data-export-exclude>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 transition-colors ${
          copied ? 'border-green-300 bg-green-50 text-green-700' : 'hover:opacity-80'
        }`}
        style={
          copied
            ? {
                fontFamily: styles.fontFamily,
                fontSize: styles.axisTickFontSize,
                fontWeight: 500,
              }
            : {
                fontFamily: styles.fontFamily,
                fontSize: styles.axisTickFontSize,
                fontWeight: 500,
                borderColor: theme.colors.borderColor,
                backgroundColor: theme.colors.cardBackground,
                color: theme.colors.textSecondary,
              }
        }
        title="Copy chart to clipboard"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" />
            Copied {copied.toUpperCase()}!
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Copy
            <ChevronDown className="h-3 w-3 ml-0.5" />
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
            className="absolute right-0 top-full z-20 mt-1 w-40 rounded-md border py-1 shadow-lg"
            style={{
              borderColor: theme.colors.borderColor,
              backgroundColor: theme.colors.cardBackground,
            }}
          >
            <button
              onClick={handleCopyPNG}
              className="w-full px-3 py-2 text-left hover:opacity-80"
              style={{
                fontFamily: styles.fontFamily,
                fontSize: styles.axisTickFontSize,
                color: theme.colors.textSecondary,
              }}
            >
              Copy as PNG
            </button>
            <button
              onClick={handleCopySVG}
              className="w-full px-3 py-2 text-left hover:opacity-80"
              style={{
                fontFamily: styles.fontFamily,
                fontSize: styles.axisTickFontSize,
                color: theme.colors.textSecondary,
              }}
            >
              Copy as SVG
            </button>
          </div>
        </>
      )}
    </div>
  );
}
