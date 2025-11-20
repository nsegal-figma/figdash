import html2canvas from 'html2canvas';

export function useClipboardCopy() {
  const copyChartToClipboard = async (chartId: string): Promise<boolean> => {
    try {
      // Get the chart element
      const chartElement = document.querySelector(`[data-chart-id="${chartId}"]`) as HTMLElement;

      if (!chartElement) {
        console.error('Chart element not found');
        return false;
      }

      // Capture as canvas
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

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });

      if (!blob) {
        console.error('Failed to create blob');
        return false;
      }

      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);

      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  };

  return { copyChartToClipboard };
}
