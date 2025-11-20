/**
 * Chart Export Utilities
 * Functions for exporting chart data and images
 */

/**
 * Export data to CSV
 * @param data - Data array to export
 * @param filename - Output filename (default: 'chart-data.csv')
 */
export function exportToCSV(data: Record<string, any>[], filename = 'chart-data.csv'): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first row
  const headers = Object.keys(data[0]);

  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape values containing commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export chart as PNG image
 * @param svgElement - SVG element to export
 * @param filename - Output filename (default: 'chart.png')
 * @param scale - Image scale (default: 2 for retina)
 */
export async function exportToPNG(
  svgElement: SVGSVGElement,
  filename = 'chart.png',
  scale = 2
): Promise<void> {
  try {
    // Serialize SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // Set canvas size (scaled for retina)
    const svgRect = svgElement.getBoundingClientRect();
    canvas.width = svgRect.width * scale;
    canvas.height = svgRect.height * scale;

    // Create image from SVG
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });

    // Draw to canvas (scaled)
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    // Convert to PNG and download
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to create PNG blob');
        return;
      }

      const link = document.createElement('a');
      const pngUrl = URL.createObjectURL(blob);

      link.setAttribute('href', pngUrl);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pngUrl);
    }, 'image/png');
  } catch (error) {
    console.error('Error exporting chart to PNG:', error);
    throw error;
  }
}

/**
 * Export chart as SVG file
 * @param svgElement - SVG element to export
 * @param filename - Output filename (default: 'chart.svg')
 */
export function exportToSVG(svgElement: SVGSVGElement, filename = 'chart.svg'): void {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy chart data to clipboard as JSON
 * @param data - Data to copy
 */
export async function copyDataToClipboard(data: Record<string, any>[]): Promise<void> {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await navigator.clipboard.writeText(jsonString);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw error;
  }
}
