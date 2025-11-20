/**
 * useChartExport Hook
 * Provides chart export functionality
 */

import { useCallback } from 'react';
import { exportToCSV, exportToPNG, exportToSVG, copyDataToClipboard } from '../lib/chartUtils/exportUtils';

export interface UseChartExportResult {
  /** Export data to CSV */
  exportCSV: (data: Record<string, any>[], filename?: string) => void;
  /** Export chart as PNG */
  exportPNG: (svgElement: SVGSVGElement, filename?: string) => Promise<void>;
  /** Export chart as SVG */
  exportSVG: (svgElement: SVGSVGElement, filename?: string) => void;
  /** Copy data to clipboard as JSON */
  copyData: (data: Record<string, any>[]) => Promise<void>;
}

/**
 * Hook for chart export functionality
 *
 * Usage:
 * ```tsx
 * const { exportCSV, exportPNG } = useChartExport();
 *
 * <button onClick={() => exportCSV(chartData, 'survey-data.csv')}>
 *   Export CSV
 * </button>
 * ```
 */
export function useChartExport(): UseChartExportResult {
  const exportCSV = useCallback((data: Record<string, any>[], filename?: string) => {
    exportToCSV(data, filename);
  }, []);

  const exportPNG = useCallback(async (svgElement: SVGSVGElement, filename?: string) => {
    await exportToPNG(svgElement, filename);
  }, []);

  const exportSVG = useCallback((svgElement: SVGSVGElement, filename?: string) => {
    exportToSVG(svgElement, filename);
  }, []);

  const copyData = useCallback(async (data: Record<string, any>[]) => {
    await copyDataToClipboard(data);
  }, []);

  return {
    exportCSV,
    exportPNG,
    exportSVG,
    copyData,
  };
}
