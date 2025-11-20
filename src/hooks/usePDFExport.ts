import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export function usePDFExport() {
  const exportDashboardToPDF = async (fileName: string) => {
    try {
      // Get the main dashboard content (exclude header/nav)
      const element = document.querySelector('[data-export-content]') as HTMLElement;

      if (!element) {
        console.error('Dashboard content not found for export');
        return;
      }

      // Show loading state
      const originalCursor = document.body.style.cursor;
      document.body.style.cursor = 'wait';

      // Capture the content as canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');

      // Add image to PDF
      if (imgHeight > 297) {
        // If content is too tall, split into pages
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= 297;
        }
      } else {
        // Single page
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      // Save PDF
      pdf.save(fileName);

      // Restore cursor
      document.body.style.cursor = originalCursor;
    } catch (error) {
      console.error('PDF export failed:', error);
      document.body.style.cursor = 'default';
      alert('Failed to export PDF. Please try again.');
    }
  };

  return { exportDashboardToPDF };
}
