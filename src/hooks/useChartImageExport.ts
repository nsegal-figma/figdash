import html2canvas from 'html2canvas';

export function useChartImageExport() {
  const exportChartAsImage = async (
    chartId: string,
    fileName: string,
    includeTable: boolean = false
  ) => {
    try {
      // Get the chart element
      const chartElement = document.querySelector(`[data-chart-id="${chartId}"]`) as HTMLElement;

      if (!chartElement) {
        console.error('Chart element not found');
        return;
      }

      // Show loading cursor
      document.body.style.cursor = 'wait';

      // Hide tooltips and dropdowns before export
      const tooltips = document.querySelectorAll('.group-hover\\:block, [role="tooltip"]');
      tooltips.forEach((el) => (el as HTMLElement).style.display = 'none');

      // Capture the element directly (don't clone - causes layout issues)
      const canvas = await html2canvas(chartElement, {
        scale: 2, // 2x for good quality without being too large
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 1200, // Fixed width for consistent export
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector(`[data-chart-id="${chartId}"]`) as HTMLElement;

          if (!clonedElement) return;

          // Remove UI controls from the clone
          const controls = clonedElement.querySelectorAll('[data-export-exclude]');
          controls.forEach(el => el.remove());

          // Remove table if not included
          if (!includeTable) {
            const tableSection = clonedElement.querySelector('[data-chart-table]');
            if (tableSection) {
              tableSection.remove();
            }
          }

          // Remove axis (causes rendering issues)
          const axes = clonedElement.querySelectorAll('[data-chart-axis]');
          axes.forEach(el => el.remove());

          // Remove any hover tooltips
          const hoverElements = clonedElement.querySelectorAll('.group-hover\\:block, .hidden');
          hoverElements.forEach(el => el.remove());

          // Ensure proper width and layout
          clonedElement.style.width = '1200px';
          clonedElement.style.minWidth = '1200px';
          clonedElement.style.maxWidth = '1200px';
        },
      });

      // Restore tooltips
      tooltips.forEach((el) => (el as HTMLElement).style.display = '');

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();

        URL.revokeObjectURL(url);
        document.body.style.cursor = 'default';
      }, 'image/png');

    } catch (error) {
      console.error('Chart export failed:', error);
      document.body.style.cursor = 'default';
      alert('Failed to export chart. Please try again.');
    }
  };

  return { exportChartAsImage };
}
