/**
 * BarChartV2 Component
 * Enhanced bar chart using design tokens and primitive components
 */

import { BarChart as RechartsBarChart, Bar, ReferenceLine, LabelList } from 'recharts';
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
  /** Bar orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Stacked bars (for multi-series) */
  stacked?: boolean;
  /** Reference lines for annotations */
  referenceLines?: Array<{
    value: number;
    label?: string;
    color?: string;
  }>;
  /** Show data labels on bars */
  showDataLabels?: boolean;
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
  orientation = 'vertical',
  stacked = false,
  referenceLines = [],
  showDataLabels = false,
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

  // For horizontal bars, swap X and Y axis roles
  const isHorizontal = orientation === 'horizontal';

  return (
    <ChartContainer title={title} width={width} height={height}>
      <RechartsBarChart data={data} layout={isHorizontal ? 'vertical' : 'horizontal'}>
        {gradientDefs}

        {showGrid && <Grid />}

        {isHorizontal ? (
          <>
            <AxisX label={yLabel} tickFormatter={valueFormatter} />
            <AxisY dataKey={xKey} label={xLabel} type="category" />
          </>
        ) : (
          <>
            <AxisX dataKey={xKey} label={xLabel} tickRotation={xTickRotation} />
            <AxisY label={yLabel} tickFormatter={valueFormatter} />
          </>
        )}

        {showTooltip && <ChartTooltip valueFormatter={valueFormatter} />}

        {showLegend && isMultiSeries && <ChartLegend />}

        {referenceLines.map((line, index) => (
          <ReferenceLine
            key={`ref-${index}`}
            y={isHorizontal ? undefined : line.value}
            x={isHorizontal ? line.value : undefined}
            stroke={line.color || designTokens.colors.semantic.info}
            strokeDasharray="3 3"
            label={{
              value: line.label,
              fill: designTokens.colors.neutral.text[600],
              fontSize: parseInt(designTokens.typography.fontSize.xs),
            }}
          />
        ))}

        {yKeysArray.map((key, index) => {
          const color = barColors[index % barColors.length];
          const fillColor = gradient ? `url(#barGradient${index})` : color;

          return (
            <Bar
              key={key}
              dataKey={key}
              fill={fillColor}
              radius={isHorizontal ? [0, barRadius, barRadius, 0] : [barRadius, barRadius, 0, 0]}
              animationDuration={designTokens.animation.duration.normal}
              stroke={showBarBorder ? barBorderColor : undefined}
              strokeWidth={showBarBorder ? 2 : 0}
              stackId={stacked ? 'stack' : undefined}
              style={{
                cursor: hoverEffects ? 'pointer' : 'default',
                transition: hoverEffects ? 'all 150ms ease-out' : 'none',
              }}
            >
              {showDataLabels && (
                <LabelList
                  dataKey={key}
                  position={isHorizontal ? 'right' : 'top'}
                  formatter={valueFormatter}
                  style={{
                    fill: designTokens.colors.neutral.text[700],
                    fontSize: parseInt(designTokens.typography.fontSize.xs),
                    fontFamily: designTokens.typography.fontFamily.primary,
                  }}
                />
              )}
            </Bar>
          );
        })}
      </RechartsBarChart>
    </ChartContainer>
  );
}
