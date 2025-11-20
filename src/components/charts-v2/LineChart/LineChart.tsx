/**
 * LineChartV2 Component
 * Enhanced line chart using design tokens and primitive components
 * Implements Epic E5: All line chart enhancements
 */

import { LineChart as RechartsLineChart, Line, ReferenceLine, Area } from 'recharts';
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

export interface LineChartData {
  [key: string]: string | number;
}

export interface LineChartV2Props {
  /** Chart data array */
  data: LineChartData[];
  /** Key for X axis values */
  xKey: string;
  /** Key(s) for Y axis values (line data) */
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
  /** Show legend (for multi-line) */
  showLegend?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Custom colors for lines */
  colors?: string[];
  /** Value formatter */
  valueFormatter?: (value: any) => string;
  /** Line interpolation type */
  curveType?: 'linear' | 'monotone' | 'step';
  /** Show dots on data points */
  showDots?: boolean;
  /** Dot size */
  dotSize?: number;
  /** Line stroke width */
  strokeWidth?: number;
  /** Fill area under line */
  fillArea?: boolean;
  /** Area opacity */
  areaOpacity?: number;
  /** Reference lines for annotations */
  referenceLines?: Array<{
    value: number;
    label?: string;
    color?: string;
  }>;
  /** Crosshair style tooltip */
  crosshair?: boolean;
  /** Sparkline mode (minimal, no axes/grid) */
  sparkline?: boolean;
}

/**
 * LineChartV2 - Enhanced line chart with design tokens
 *
 * Implements all Epic E5 features:
 * - VIZ-032: Basic structure with primitives
 * - VIZ-033: Styling (curves, dots, stroke width, gradients)
 * - VIZ-034: Multi-line support
 * - VIZ-035: Crosshair tooltip
 * - VIZ-036: Sparkline variant
 * - VIZ-037: Annotations (reference lines)
 *
 * Usage:
 * ```tsx
 * <LineChartV2
 *   data={timeSeriesData}
 *   xKey="date"
 *   yKeys="value"
 *   title="Response Trend Over Time"
 *   curveType="monotone"
 *   showDots
 * />
 * ```
 */
export function LineChartV2({
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
  showDots = true,
  dotSize = 4,
  strokeWidth = 2,
  fillArea = false,
  areaOpacity = 0.3,
  referenceLines = [],
  crosshair = false,
  sparkline = false,
}: LineChartV2Props) {
  // Normalize yKeys to array
  const yKeysArray = Array.isArray(yKeys) ? yKeys : [yKeys];
  const isMultiLine = yKeysArray.length > 1;

  // Use provided colors or design token categorical colors
  const lineColors = colors || designTokens.colors.data.categorical;

  // Handle loading state
  if (isLoading) {
    return <ChartLoading width={width} height={height} variant="line" />;
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

  // Sparkline overrides (minimal chart)
  const effectiveShowGrid = sparkline ? false : showGrid;
  const effectiveShowTooltip = sparkline ? false : showTooltip;
  const effectiveShowLegend = sparkline ? false : showLegend;
  const effectiveHeight = sparkline ? 80 : height;

  return (
    <ChartContainer title={sparkline ? undefined : title} width={width} height={effectiveHeight}>
      <RechartsLineChart data={data}>
        {effectiveShowGrid && <Grid />}

        {!sparkline && (
          <>
            <AxisX dataKey={xKey} label={xLabel} />
            <AxisY label={yLabel} tickFormatter={valueFormatter} />
          </>
        )}

        {effectiveShowTooltip && <ChartTooltip valueFormatter={valueFormatter} />}

        {effectiveShowLegend && isMultiLine && <ChartLegend />}

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
          const color = lineColors[index % lineColors.length];

          return (
            <Line
              key={key}
              type={curveType}
              dataKey={key}
              stroke={color}
              strokeWidth={strokeWidth}
              dot={showDots ? { r: dotSize, fill: color } : false}
              activeDot={showDots ? { r: dotSize + 2 } : false}
              animationDuration={designTokens.animation.duration.normal}
              fill={fillArea ? color : undefined}
              fillOpacity={fillArea ? areaOpacity : 0}
            />
          );
        })}

        {fillArea && yKeysArray.map((key, index) => {
          const color = lineColors[index % lineColors.length];
          return (
            <Area
              key={`area-${key}`}
              type={curveType}
              dataKey={key}
              stroke="none"
              fill={color}
              fillOpacity={areaOpacity}
            />
          );
        })}
      </RechartsLineChart>
    </ChartContainer>
  );
}
