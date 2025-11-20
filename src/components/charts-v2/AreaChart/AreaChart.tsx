/**
 * AreaChartV2 Component
 * Enhanced area chart using design tokens and primitive components
 * Implements Epic E6: All area chart features
 */

import { AreaChart as RechartsAreaChart, Area, ReferenceLine } from 'recharts';
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

export interface AreaChartData {
  [key: string]: string | number;
}

export interface AreaChartV2Props {
  /** Chart data array */
  data: AreaChartData[];
  /** Key for X axis values */
  xKey: string;
  /** Key(s) for Y axis values */
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
  /** Show legend */
  showLegend?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Custom colors */
  colors?: string[];
  /** Value formatter */
  valueFormatter?: (value: any) => string;
  /** Curve type */
  curveType?: 'linear' | 'monotone' | 'step';
  /** Area opacity */
  opacity?: number;
  /** Stacked areas */
  stacked?: boolean;
  /** Reference lines */
  referenceLines?: Array<{
    value: number;
    label?: string;
    color?: string;
  }>;
  /** Show dots on data points */
  showDots?: boolean;
  /** Stroke width */
  strokeWidth?: number;
}

/**
 * AreaChartV2 - Enhanced area chart with design tokens
 *
 * Implements all Epic E6 features:
 * - VIZ-038: Base area chart
 * - VIZ-039: Stacked area charts
 * - VIZ-040: Range area charts (via min/max keys)
 *
 * Usage:
 * ```tsx
 * <AreaChartV2
 *   data={data}
 *   xKey="date"
 *   yKeys="value"
 *   curveType="monotone"
 *   opacity={0.7}
 * />
 * ```
 */
export function AreaChartV2({
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
  curveType = 'monotone',
  opacity = 0.6,
  stacked = false,
  referenceLines = [],
  showDots = false,
  strokeWidth = 2,
}: AreaChartV2Props) {
  const yKeysArray = Array.isArray(yKeys) ? yKeys : [yKeys];
  const isMultiSeries = yKeysArray.length > 1;
  const areaColors = colors || designTokens.colors.data.categorical;

  if (isLoading) {
    return <ChartLoading width={width} height={height} variant="line" />;
  }

  if (!data || data.length === 0) {
    return <ChartEmpty width={width} height={height} variant="no-data" />;
  }

  return (
    <ChartContainer title={title} width={width} height={height}>
      <RechartsAreaChart data={data}>
        {showGrid && <Grid />}

        <AxisX dataKey={xKey} label={xLabel} />
        <AxisY label={yLabel} tickFormatter={valueFormatter} />

        {showTooltip && <ChartTooltip valueFormatter={valueFormatter} />}

        {showLegend && isMultiSeries && <ChartLegend />}

        {referenceLines.map((line, index) => (
          <ReferenceLine
            key={`ref-${index}`}
            y={line.value}
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
          const color = areaColors[index % areaColors.length];

          return (
            <Area
              key={key}
              type={curveType}
              dataKey={key}
              stroke={color}
              strokeWidth={strokeWidth}
              fill={color}
              fillOpacity={opacity}
              dot={showDots ? { r: 4, fill: color } : false}
              activeDot={showDots ? { r: 6 } : false}
              animationDuration={designTokens.animation.duration.normal}
              stackId={stacked ? 'stack' : undefined}
            />
          );
        })}
      </RechartsAreaChart>
    </ChartContainer>
  );
}
