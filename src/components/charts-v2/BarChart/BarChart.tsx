/**
 * BarChartV2 Component
 * Enhanced bar chart using design tokens and primitive components
 */

import { BarChart as RechartsBarChart, Bar } from 'recharts';
import {
  AxisX,
  AxisY,
  Grid,
  ChartTooltip,
  ChartLegend,
  ChartContainer,
  ChartLoading,
  ChartEmpty,
} from '../primitives';
import { designTokens } from '@/lib/designTokens';

export interface BarChartData {
  [key: string]: string | number;
}

export interface BarChartV2Props {
  /** Chart data array */
  data: BarChartData[];
  /** Key for X axis values */
  xKey: string;
  /** Key(s) for Y axis values (bar data) */
  yKeys: string | string[];
  /** Chart title */
  title?: string;
  /** X axis label */
  xLabel?: string;
  /** Y axis label */
  yLabel?: string;
  /** Chart width */
  width?: number | string;
  /** Chart height */
  height?: number | string;
  /** Show grid */
  showGrid?: boolean;
  /** Show tooltip */
  showTooltip?: boolean;
  /** Show legend (for multi-series) */
  showLegend?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Custom colors for bars */
  colors?: string[];
  /** Value formatter for tooltip/axis */
  valueFormatter?: (value: any) => string;
  /** X axis tick rotation */
  xTickRotation?: number;
}

/**
 * BarChartV2 - Enhanced bar chart with design tokens
 *
 * Features:
 * - Uses all primitive components (Axis, Grid, Tooltip, Legend)
 * - Design token styling throughout
 * - Loading and empty states
 * - Multi-series support
 * - Responsive sizing
 * - WCAG AA compliant colors
 *
 * Usage:
 * ```tsx
 * <BarChartV2
 *   data={surveyData}
 *   xKey="category"
 *   yKeys="responseCount"
 *   title="Survey Responses by Category"
 *   xLabel="Categories"
 *   yLabel="Response Count"
 * />
 * ```
 */
export function BarChartV2({
  data,
  xKey,
  yKeys,
  title,
  xLabel,
  yLabel,
  width = '100%',
  height = 400,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  isLoading = false,
  colors,
  valueFormatter,
  xTickRotation = 0,
}: BarChartV2Props) {
  // Normalize yKeys to array
  const yKeysArray = Array.isArray(yKeys) ? yKeys : [yKeys];
  const isMultiSeries = yKeysArray.length > 1;

  // Use provided colors or design token categorical colors
  const barColors = colors || designTokens.colors.data.categorical;

  // Handle loading state
  if (isLoading) {
    return <ChartLoading width={width} height={height} />;
  }

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <ChartEmpty
        width={width}
        height={height}
        variant="no-data"
        message="No data available for this chart"
      />
    );
  }

  return (
    <ChartContainer title={title} width={width} height={height}>
      <RechartsBarChart data={data}>
        {showGrid && <Grid />}

        <AxisX
          dataKey={xKey}
          label={xLabel}
          tickRotation={xTickRotation}
        />

        <AxisY
          label={yLabel}
          tickFormatter={valueFormatter}
        />

        {showTooltip && (
          <ChartTooltip
            valueFormatter={valueFormatter}
          />
        )}

        {showLegend && isMultiSeries && <ChartLegend />}

        {yKeysArray.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={barColors[index % barColors.length]}
            radius={[8, 8, 0, 0]}
            animationDuration={designTokens.animation.duration.normal}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
}
