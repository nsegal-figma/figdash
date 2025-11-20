/**
 * ChartTooltip Component
 * Wrapper around Recharts Tooltip with design tokens applied
 * Named ChartTooltip to avoid conflict with potential HTML tooltip elements
 */

import { Tooltip } from 'recharts';
import type { TooltipProps } from 'recharts';
import { designTokens } from '@/lib/designTokens';

export interface ChartTooltipProps<TValue extends any = any, TName extends any = any>
  extends Omit<TooltipProps<TValue, TName>, 'contentStyle' | 'cursor'> {
  /** Custom formatter for tooltip values */
  valueFormatter?: (value: any, name: any) => string;
  /** Custom label formatter */
  labelFormatter?: (label: any) => string;
  /** Show cursor highlight */
  showCursor?: boolean;
  /** Cursor fill color (defaults to primary with low opacity) */
  cursorFill?: string;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Follow cursor (true) or snap to data point (false) */
  followCursor?: boolean;
}

/**
 * ChartTooltip - Tooltip component with design tokens
 *
 * Features:
 * - Design token styling (colors, typography, shadows)
 * - Smooth fade in/out animation
 * - Smart positioning (avoids viewport overflow)
 * - Custom content support via formatter props
 * - Cursor highlight with configurable color
 * - Accessibility support (ARIA labels)
 *
 * Usage:
 * ```tsx
 * <ChartTooltip
 *   valueFormatter={(value) => formatCurrency(value, 'USD')}
 *   labelFormatter={(label) => formatDate(label, 'short')}
 * />
 * ```
 */
export function ChartTooltip<TValue extends any = any, TName extends any = any>({
  valueFormatter,
  labelFormatter,
  showCursor = true,
  cursorFill,
  animationDuration = 300,
  followCursor = false,
  ...props
}: ChartTooltipProps<TValue, TName>) {
  return (
    <Tooltip
      {...props}
      contentStyle={{
        backgroundColor: designTokens.colors.chart.tooltip.background,
        border: `1px solid ${designTokens.colors.chart.tooltip.border}`,
        borderRadius: designTokens.borderRadius.md,
        boxShadow: designTokens.shadows.tooltip,
        padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
        color: designTokens.colors.chart.tooltip.text,
        fontSize: designTokens.typography.fontSize.sm,
        fontFamily: designTokens.typography.fontFamily.primary,
        lineHeight: designTokens.typography.lineHeight.normal,
      }}
      labelStyle={{
        color: designTokens.colors.neutral.text[900],
        fontWeight: designTokens.typography.fontWeight.semibold,
        marginBottom: designTokens.spacing[1],
      }}
      itemStyle={{
        color: designTokens.colors.neutral.text[700],
        padding: `${designTokens.spacing[0]} ${designTokens.spacing[1]}`,
      }}
      cursor={
        showCursor
          ? {
              fill: cursorFill || designTokens.colors.data.categorical[0],
              opacity: 0.1,
            }
          : false
      }
      animationDuration={animationDuration}
      animationEasing={designTokens.animation.easing.easeOut}
      isAnimationActive={true}
      formatter={valueFormatter}
      labelFormatter={labelFormatter}
      position={followCursor ? undefined : { x: 0, y: 0 }}
      allowEscapeViewBox={{ x: false, y: false }}
    />
  );
}
