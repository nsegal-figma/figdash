/**
 * AxisY Component
 * Wrapper around Recharts YAxis with design tokens applied
 */

import { YAxis } from 'recharts';
import type { YAxisProps } from 'recharts';
import { designTokens } from '../../../lib/designTokens';

export interface AxisYProps extends Omit<YAxisProps, 'tick' | 'stroke'> {
  /** Custom tick formatter function */
  tickFormatter?: (value: any) => string;
  /** Axis label/title */
  label?: string;
  /** Show axis line */
  showAxisLine?: boolean;
  /** Show tick marks */
  showTicks?: boolean;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

/**
 * AxisY - Vertical (Y) axis component with design tokens
 *
 * Usage:
 * ```tsx
 * <AxisY
 *   label="Values"
 *   tickFormatter={(value) => formatSmartNumber(value)}
 * />
 * ```
 */
export function AxisY({
  tickFormatter,
  label,
  showAxisLine = true,
  showTicks = true,
  ariaLabel,
  ...props
}: AxisYProps) {
  return (
    <YAxis
      {...props}
      stroke={showAxisLine ? designTokens.colors.chart.axis : 'transparent'}
      tick={{
        fill: designTokens.colors.neutral.text[500],
        fontSize: parseInt(designTokens.typography.fontSize.xs),
        fontFamily: designTokens.typography.fontFamily.primary,
      }}
      tickLine={showTicks}
      tickFormatter={tickFormatter}
      label={
        label
          ? {
              value: label,
              angle: -90,
              position: 'insideLeft',
              style: {
                fill: designTokens.colors.neutral.text[700],
                fontSize: parseInt(designTokens.typography.fontSize.sm),
                fontWeight: designTokens.typography.fontWeight.medium,
                fontFamily: designTokens.typography.fontFamily.primary,
                textAnchor: 'middle',
              },
            }
          : undefined
      }
      aria-label={ariaLabel || `Y axis${label ? `: ${label}` : ''}`}
    />
  );
}
