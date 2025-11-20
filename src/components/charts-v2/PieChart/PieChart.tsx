/**
 * PieChartV2 Component
 * Enhanced pie/donut chart using design tokens
 * Implements Epic E7: All pie/donut features
 */

import { PieChart as RechartsPieChart, Pie, Cell, Label } from 'recharts';
import {
  ChartTooltip,
  ChartLegend,
  ChartContainer,
  ChartLoading,
  ChartEmpty,
} from '../primitives';
import { designTokens } from '@/lib/designTokens';

export interface PieChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface PieChartV2Props {
  /** Chart data array */
  data: PieChartData[];
  /** Data key for values */
  valueKey?: string;
  /** Data key for labels */
  nameKey?: string;
  /** Chart title */
  title?: string;
  /** Chart width */
  width?: number | string;
  /** Chart height */
  height?: number | string;
  /** Show tooltip */
  showTooltip?: boolean;
  /** Show legend */
  showLegend?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Custom colors */
  colors?: string[];
  /** Value formatter */
  valueFormatter?: (value: any) => string;
  /** Chart variant */
  variant?: 'pie' | 'donut';
  /** Inner radius for donut (0-1, or pixel value) */
  innerRadius?: number | string;
  /** Outer radius (0-1, or pixel value) */
  outerRadius?: number | string;
  /** Start angle (degrees) */
  startAngle?: number;
  /** End angle (degrees) */
  endAngle?: number;
  /** Padding angle between segments */
  paddingAngle?: number;
  /** Show percentage labels */
  showLabels?: boolean;
  /** Label position */
  labelPosition?: 'inside' | 'outside';
  /** Center label for donut */
  centerLabel?: string;
  /** Center value for donut */
  centerValue?: string;
}

/**
 * PieChartV2 - Enhanced pie/donut chart with design tokens
 *
 * Implements all Epic E7 features:
 * - VIZ-041: Donut chart base
 * - VIZ-042: Donut interactions (hover, click)
 * - VIZ-043: Pie chart variant
 * - VIZ-044: Advanced features (labels, center text, padding)
 *
 * Usage:
 * ```tsx
 * <PieChartV2
 *   data={categoryData}
 *   variant="donut"
 *   centerLabel="Total"
 *   centerValue="1,234"
 *   showLabels
 * />
 * ```
 */
export function PieChartV2({
  data,
  valueKey = 'value',
  nameKey = 'name',
  title,
  width = '100%',
  height = 400,
  showTooltip = true,
  showLegend = true,
  isLoading = false,
  colors,
  valueFormatter,
  variant = 'donut',
  innerRadius = variant === 'donut' ? '60%' : '0%',
  outerRadius = '80%',
  startAngle = 0,
  endAngle = 360,
  paddingAngle = 2,
  showLabels = false,
  labelPosition = 'outside',
  centerLabel,
  centerValue,
}: PieChartV2Props) {
  const pieColors = colors || designTokens.colors.data.categorical;

  if (isLoading) {
    return <ChartLoading width={width} height={height} variant="pie" />;
  }

  if (!data || data.length === 0) {
    return <ChartEmpty width={width} height={height} variant="no-data" />;
  }

  // Calculate total for percentage labels
  const total = data.reduce((sum, item) => sum + (item[valueKey] as number), 0);

  return (
    <ChartContainer title={title} width={width} height={height}>
      <RechartsPieChart>
        {showTooltip && (
          <ChartTooltip
            valueFormatter={
              valueFormatter ||
              ((value) => {
                const percentage = ((value / total) * 100).toFixed(1);
                return `${value} (${percentage}%)`;
              })
            }
          />
        )}

        {showLegend && (
          <ChartLegend
            iconShape="circle"
            layout="vertical"
            position="right"
          />
        )}

        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          paddingAngle={paddingAngle}
          animationDuration={designTokens.animation.duration.normal}
          label={
            showLabels
              ? {
                  position: labelPosition,
                  fill: designTokens.colors.neutral.text[700],
                  fontSize: parseInt(designTokens.typography.fontSize.sm),
                  fontFamily: designTokens.typography.fontFamily.primary,
                }
              : false
          }
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={pieColors[index % pieColors.length]}
              stroke={designTokens.colors.chart.tooltip.background}
              strokeWidth={1}
            />
          ))}

          {/* Center label for donut charts */}
          {variant === 'donut' && (centerLabel || centerValue) && (
            <Label
              value={centerValue || centerLabel}
              position="center"
              style={{
                fontSize: centerValue
                  ? designTokens.typography.fontSize['2xl']
                  : designTokens.typography.fontSize.lg,
                fontWeight: designTokens.typography.fontWeight.bold,
                fill: designTokens.colors.neutral.text[900],
                fontFamily: designTokens.typography.fontFamily.primary,
              }}
            />
          )}
          {variant === 'donut' && centerLabel && centerValue && (
            <Label
              value={centerLabel}
              position="center"
              dy={-20}
              style={{
                fontSize: designTokens.typography.fontSize.sm,
                fontWeight: designTokens.typography.fontWeight.medium,
                fill: designTokens.colors.neutral.text[600],
                fontFamily: designTokens.typography.fontFamily.primary,
              }}
            />
          )}
        </Pie>
      </RechartsPieChart>
    </ChartContainer>
  );
}
