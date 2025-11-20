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
  /** Use gradient fill for bars */
  gradient?: boolean;
  /** Bar corner radius (top corners) */
  barRadius?: number;
  /** Enable hover effects (scale, shadow) */
  hoverEffects?: boolean;
  /** Show bar borders */
  showBarBorder?: boolean;
  /** Bar border color */
  barBorderColor?: string;
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
  gradient = false,
  barRadius = 8,
  hoverEffects = true,
  showBarBorder = false,
  barBorderColor = '#FFFFFF',
}: BarChartV2Props) {
  // Normalize yKeys to array
  const yKeysArray = Array.isArray(yKeys) ? yKeys : [yKeys];
  const isMultiSeries = yKeysArray.length > 1;

  // Use provided colors or design token categorical colors
  const barColors = colors || designTokens.colors.data.categorical;

  // Generate gradient definitions if needed
  const gradientDefs = gradient ? (
    <defs>
      {barColors.map((color, index) => {
        const lighterColor = designTokens.colors.data.sequential[2]; // Lighter shade
        return (
          <linearGradient key={`gradient-${index}`} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lighterColor} stopOpacity={0.8} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </linearGradient>
        );
      })}
    </defs>
  ) : null;

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
        {gradientDefs}

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

        {yKeysArray.map((key, index) => {
          const color = barColors[index % barColors.length];
          const fillColor = gradient ? `url(#barGradient${index})` : color;

          return (
            <Bar
              key={key}
              dataKey={key}
              fill={fillColor}
              radius={[barRadius, barRadius, 0, 0]}
              animationDuration={designTokens.animation.duration.normal}
              stroke={showBarBorder ? barBorderColor : undefined}
              strokeWidth={showBarBorder ? 2 : 0}
              style={{
                cursor: hoverEffects ? 'pointer' : 'default',
                transition: hoverEffects ? 'all 150ms ease-out' : 'none',
              }}
            />
          );
        })}
      </RechartsBarChart>
    </ChartContainer>
  );
}
