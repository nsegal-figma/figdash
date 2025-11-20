import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useClipboardCopy } from '../hooks/useClipboardCopy';

interface CopyChartButtonProps {
  chartId: string;
}

export function CopyChartButton({ chartId }: CopyChartButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { copyChartToClipboard } = useClipboardCopy();

  const handleCopy = async () => {
    setIsLoading(true);
    const success = await copyChartToClipboard(chartId);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      alert('Failed to copy chart. Please try exporting instead.');
    }

    setIsLoading(false);
  };

  return (
    <button
      onClick={handleCopy}
      disabled={isLoading || copied}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
        copied
          ? 'border-green-300 bg-green-50 text-green-700'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
      }`}
      data-export-exclude
      title="Copy chart to clipboard for pasting in Figma"
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
