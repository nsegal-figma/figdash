/**
 * ChartRenderer Component
 * Dynamically renders the appropriate chart type based on selection
 * Includes storytelling support for all chart types
 */

import { useEffect, memo } from 'react';
import type { ChartType } from '../../types/chartTypes';
import type { ChartTheme } from '../../types/chartTheme';
import { useStorytelling, useChartStorytelling } from '../../hooks/useStorytelling';
import { HorizontalBarChart } from './HorizontalBarChart';
import { VerticalBarChart } from './VerticalBarChart';
import { ThemedPieChart, DonutChart } from './ThemedPieChart';
import { LollipopChart } from './LollipopChart';
import { StackedBarChart } from './StackedBarChart';
import { HistogramChart } from './HistogramChart';
import { WaffleChart } from './WaffleChart';
import { TreemapChart } from './TreemapChart';
import { DivergingBarChart } from './DivergingBarChart';

// ============ Types ============

export interface ChartData {
  name: string;
  value: number;
}

// Storytelling props passed to chart components
export interface StorytellingProps {
  getAnnotationsForBar: (barName: string) => Array<{
    id: string;
    text: string;
    isVisible: boolean;
  }>;
  getEmphasisForBar: (barName: string) => { intensity: number } | undefined;
  updateAnnotationText: (annotationId: string, text: string) => void;
  removeAnnotation: (annotationId: string) => void;
}

export interface ChartRendererProps {
  /** Selected chart type */
  type: ChartType;
  /** Chart data */
  data: ChartData[];
  /** Total sample size */
  totalN: number;
  /** Column name (for storytelling) */
  columnName: string;
  /** Colors for the chart */
  colors: string[];
  /** Chart theme */
  theme: ChartTheme;
  /** Computed theme styles */
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;
  /** Chart height (for pie/donut/vertical) */
  height?: number;
}

// ============ Main Renderer ============

export const ChartRenderer = memo(function ChartRenderer({
  type,
  data,
  totalN,
  columnName,
  colors,
  theme,
  styles,
  height = 300,
}: ChartRendererProps) {
  // Subscribe to storytelling state - this isolates re-renders to just this component
  const { isEnabled: isStorytellingEnabled } = useStorytelling();
  const {
    analyzeChart,
    getAnnotationsForBar,
    getEmphasisForBar,
    updateAnnotationText,
    removeAnnotation,
  } = useChartStorytelling(columnName);

  // Trigger pattern detection when storytelling is enabled
  useEffect(() => {
    if (isStorytellingEnabled) {
      analyzeChart(data, totalN);
    }
  }, [isStorytellingEnabled, data, totalN, analyzeChart]);

  // Build storytelling helpers to pass to charts
  const storytellingProps = isStorytellingEnabled ? {
    getAnnotationsForBar,
    getEmphasisForBar,
    updateAnnotationText,
    removeAnnotation,
  } : undefined;

  switch (type) {
    case 'horizontal-bar':
      return (
        <HorizontalBarChart
          data={data}
          totalN={totalN}
          columnName={columnName}
          colors={colors}
          theme={theme}
          styles={styles}
          enableStorytelling={isStorytellingEnabled}
        />
      );

    case 'vertical-bar':
      return (
        <VerticalBarChart
          data={data}
          totalN={totalN}
          colors={colors}
          theme={theme}
          styles={styles}
          height={height}
          columnName={columnName}
          storytelling={storytellingProps}
        />
      );

    case 'pie':
      return (
        <ThemedPieChart
          data={data}
          totalN={totalN}
          colors={colors}
          theme={theme}
          styles={styles}
          height={height}
          columnName={columnName}
          storytelling={storytellingProps}
        />
      );

    case 'donut':
      return (
        <DonutChart
          data={data}
          totalN={totalN}
          colors={colors}
          theme={theme}
          styles={styles}
          height={height}
          columnName={columnName}
          storytelling={storytellingProps}
        />
      );

    case 'lollipop':
      return (
        <LollipopChart
          data={data}
          totalN={totalN}
          colors={colors}
          theme={theme}
          styles={styles}
          columnName={columnName}
          storytelling={storytellingProps}
        />
      );

    case 'stacked-bar':
      return (
        <StackedBarChart
          data={data}
          totalN={totalN}
          colors={colors}
          theme={theme}
          styles={styles}
          height={height}
          columnName={columnName}
          storytelling={storytellingProps}
        />
      );

    case 'histogram':
      return (
        <HistogramChart
          data={data}
          totalN={totalN}
          colors={colors}
          theme={theme}
          styles={styles}
          height={height}
          columnName={columnName}
          storytelling={storytellingProps}
        />
      );

    case 'waffle':
      return (
        <WaffleChart
          data={data}
          totalN={totalN}
          colors={colors}
          theme={theme}
          styles={styles}
          height={height}
          columnName={columnName}
          storytelling={storytellingProps}
        />
      );

    case 'treemap':
      return (
        <TreemapChart
          data={data}
          totalN={totalN}
          colors={colors}
          theme={theme}
          styles={styles}
          height={height}
          columnName={columnName}
          storytelling={storytellingProps}
        />
      );

    case 'diverging-bar':
      return (
        <DivergingBarChart
          data={data}
          totalN={totalN}
          colors={colors}
          theme={theme}
          styles={styles}
          height={height}
          columnName={columnName}
          storytelling={storytellingProps}
        />
      );

    // Grouped bar and unknown types fall back to horizontal bar
    case 'grouped-bar':
    default:
      return (
        <HorizontalBarChart
          data={data}
          totalN={totalN}
          columnName={columnName}
          colors={colors}
          theme={theme}
          styles={styles}
          enableStorytelling={isStorytellingEnabled}
        />
      );
  }
});
