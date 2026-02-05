/**
 * useSVGExport Hook
 * Provides SVG export functionality for charts with theme integration
 */

import { useCallback } from 'react';
import { useChartTheme } from './useChartTheme';
import { useSurveyStore } from '../stores/useSurveyStore';
import { generateGradientColors } from '../lib/colorPalettes';
import {
  generateChartSVG,
  downloadSVG,
  copySVGToClipboard,
  type SVGChartData,
} from '../lib/chartUtils/svgGenerator';

export interface ChartExportData {
  title: string;
  n: number;
  data: SVGChartData[];
}

export interface SVGExportResult {
  /** Generate SVG string from chart data */
  generateSVG: (chartData: ChartExportData) => string;
  /** Download chart as SVG file */
  downloadChartSVG: (chartData: ChartExportData, filename?: string) => void;
  /** Copy chart SVG to clipboard */
  copyChartSVGToClipboard: (chartData: ChartExportData) => Promise<boolean>;
}

/**
 * Hook for SVG export functionality
 *
 * Usage:
 * ```tsx
 * function ChartActions({ chartData }) {
 *   const { downloadChartSVG, copyChartSVGToClipboard } = useSVGExport();
 *
 *   return (
 *     <>
 *       <button onClick={() => downloadChartSVG(chartData)}>
 *         Download SVG
 *       </button>
 *       <button onClick={() => copyChartSVGToClipboard(chartData)}>
 *         Copy SVG
 *       </button>
 *     </>
 *   );
 * }
 * ```
 */
export function useSVGExport(): SVGExportResult {
  const { theme, colorPalette } = useChartTheme();
  const sortOrder = useSurveyStore((state) => state.sortOrder);

  /**
   * Generate SVG string from chart data
   */
  const generateSVG = useCallback(
    (chartData: ChartExportData): string => {
      // Generate colors for each bar based on the current palette and sort order
      const colors = generateGradientColors(
        colorPalette,
        chartData.data,
        sortOrder
      );

      return generateChartSVG({
        data: chartData.data,
        title: chartData.title,
        totalN: chartData.n,
        colors,
        theme,
        width: 1200,
      });
    },
    [theme, colorPalette, sortOrder]
  );

  /**
   * Download chart as SVG file
   */
  const downloadChartSVG = useCallback(
    (chartData: ChartExportData, filename?: string): void => {
      const svg = generateSVG(chartData);
      const defaultFilename = chartData.title
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase();

      downloadSVG(svg, filename || defaultFilename);
    },
    [generateSVG]
  );

  /**
   * Copy chart SVG to clipboard
   */
  const copyChartSVGToClipboard = useCallback(
    async (chartData: ChartExportData): Promise<boolean> => {
      const svg = generateSVG(chartData);
      return copySVGToClipboard(svg);
    },
    [generateSVG]
  );

  return {
    generateSVG,
    downloadChartSVG,
    copyChartSVGToClipboard,
  };
}
