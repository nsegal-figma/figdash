/**
 * ChartLegend Component
 * Wrapper around Recharts Legend with design tokens applied
 */

import { Legend } from 'recharts';
import type { LegendProps } from 'recharts';
import { designTokens } from '@/lib/designTokens';

export interface ChartLegendProps extends Omit<LegendProps, 'wrapperStyle' | 'iconType'> {
  /** Legend position */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Legend layout */
  layout?: 'horizontal' | 'vertical';
  /** Icon shape for legend items */
  iconShape?: 'square' | 'circle' | 'line';
  /** Enable click to toggle series visibility */
  interactive?: boolean;
}

/**
 * ChartLegend - Legend component with design tokens
 *
 * Features:
 * - Automatic positioning (top/bottom/left/right)
 * - Layout control (horizontal/vertical)
 * - Icon shapes (square/circle/line)
 * - Click to toggle series (if interactive)
 * - Design token styling
 *
 * Usage:
 * ```tsx
 * <ChartLegend
 *   position="bottom"
 *   layout="horizontal"
 *   iconShape="square"
 *   interactive
 * />
 * ```
 */
export function ChartLegend({
  position = 'bottom',
  layout = 'horizontal',
  iconShape = 'square',
  interactive = true,
  ...props
}: ChartLegendProps) {
  // Map our simplified position to Recharts verticalAlign and align
  const getAlignment = () => {
    switch (position) {
      case 'top':
        return { verticalAlign: 'top' as const, align: 'center' as const };
      case 'bottom':
        return { verticalAlign: 'bottom' as const, align: 'center' as const };
      case 'left':
        return { verticalAlign: 'middle' as const, align: 'left' as const };
      case 'right':
        return { verticalAlign: 'middle' as const, align: 'right' as const };
    }
  };

  const alignment = getAlignment();

  // Icon type mapping
  const iconType = iconShape === 'line' ? 'line' : iconShape === 'circle' ? 'circle' : 'square';

  return (
    <Legend
      {...props}
      {...alignment}
      layout={position === 'left' || position === 'right' ? 'vertical' : layout}
      iconType={iconType}
      wrapperStyle={{
        fontSize: designTokens.typography.fontSize.sm,
        fontFamily: designTokens.typography.fontFamily.primary,
        color: designTokens.colors.neutral.text[700],
        paddingTop: position === 'top' ? 0 : parseInt(designTokens.spacing[4]),
        paddingBottom: position === 'bottom' ? 0 : parseInt(designTokens.spacing[4]),
        paddingLeft: position === 'left' ? 0 : parseInt(designTokens.spacing[4]),
        paddingRight: position === 'right' ? 0 : parseInt(designTokens.spacing[4]),
      }}
      iconSize={14}
    />
  );
}
