import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSurveyStore } from '../stores/useSurveyStore';
import { FigmaFileSelectorModal } from './FigmaFileSelectorModal';
import html2canvas from 'html2canvas';

interface ExportToFigmaButtonProps {
  chartId: string;
  chartTitle: string;
}

export function ExportToFigmaButton({ chartId, chartTitle }: ExportToFigmaButtonProps) {
  const { figmaToken } = useSurveyStore();
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [chartBlob, setChartBlob] = useState<Blob | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  if (!figmaToken) return null; // Only show when connected

  const handleClick = async () => {
    setIsCapturing(true);

    try {
      // Capture the chart as image
      const chartElement = document.querySelector(`[data-chart-id="${chartId}"]`) as HTMLElement;

      if (!chartElement) {
        alert('Chart not found');
        setIsCapturing(false);
        return;
      }

      const canvas = await html2canvas(chartElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 1200,
        onclone: (clonedDoc) => {
          const cloned = clonedDoc.querySelector(`[data-chart-id="${chartId}"]`) as HTMLElement;
          if (!cloned) return;

          // Remove controls
          const controls = cloned.querySelectorAll('[data-export-exclude]');
          controls.forEach(el => el.remove());

          // Remove axis
          const axes = cloned.querySelectorAll('[data-chart-axis]');
          axes.forEach(el => el.remove());

          // Remove tooltips
          const tooltips = cloned.querySelectorAll('.group-hover\\:block, .hidden');
          tooltips.forEach(el => el.remove());

          // Remove table
          const table = cloned.querySelector('[data-chart-table]');
          if (table) table.remove();

          cloned.style.width = '1200px';
          cloned.style.minWidth = '1200px';
        },
      });

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          setChartBlob(blob);
          setShowFileSelector(true);
        }
        setIsCapturing(false);
      }, 'image/png');

    } catch (error) {
      console.error('Failed to capture chart:', error);
      alert('Failed to capture chart');
      setIsCapturing(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isCapturing}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        data-export-exclude
      >
        {isCapturing ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
          </svg>
        )}
        Add to Figma
      </button>

      {showFileSelector && chartBlob && (
        <FigmaFileSelectorModal
          chartBlob={chartBlob}
          chartTitle={chartTitle}
          onClose={() => {
            setShowFileSelector(false);
            setChartBlob(null);
          }}
        />
      )}
    </>
  );
}
