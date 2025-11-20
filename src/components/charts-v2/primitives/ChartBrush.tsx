/**
 * ChartBrush Component
 * Wrapper around Recharts Brush with design tokens
 * Enables data range selection
 */

import { Brush } from 'recharts';
import type { BrushProps } from 'recharts';
import { designTokens } from '@/lib/designTokens';

export interface ChartBrushProps extends Omit<BrushProps, 'stroke' | 'fill'> {
  /** Brush height in pixels */
  height?: number;
  /** Show text labels */
  showLabels?: boolean;
}

/**
 * ChartBrush - Data range selection component
 *
 * Enables users to select a range of data to zoom into
 *
 * Usage:
 * ```tsx
 * <LineChart data={data}>
 *   <Line dataKey="value" />
 *   <ChartBrush dataKey="date" height={40} />
 * </LineChart>
 * ```
 */
export function ChartBrush({
  height = 40,
  showLabels = true,
  ...props
}: ChartBrushProps) {
  return (
    <Brush
      {...props}
      height={height}
      stroke={designTokens.colors.data.categorical[0]}
      fill={designTokens.colors.neutral.background[100]}
      travellerWidth={10}
      tickFormatter={showLabels ? undefined : () => ''}
      style={{
        fontSize: designTokens.typography.fontSize.xs,
        fontFamily: designTokens.typography.fontFamily.primary,
      }}
    />
  );
}
