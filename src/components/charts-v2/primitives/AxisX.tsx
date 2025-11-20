/**
 * AxisX Component
 * Wrapper around Recharts XAxis with design tokens applied
 */

import { XAxis } from 'recharts';
import type { XAxisProps } from 'recharts';
import { designTokens } from '../../../lib/designTokens';

export interface AxisXProps extends Omit<XAxisProps, 'tick' | 'stroke'> {
  /** Custom tick formatter function */
  tickFormatter?: (value: any) => string;
  /** Axis label/title */
  label?: string;
  /** Rotate tick labels (degrees) */
  tickRotation?: number;
  /** Show axis line */
  showAxisLine?: boolean;
  /** Show tick marks */
  showTicks?: boolean;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

/**
 * AxisX - Horizontal (X) axis component with design tokens
 *
 * Usage:
 * ```tsx
 * <AxisX
 *   dataKey="name"
 *   label="Categories"
 *   tickFormatter={(value) => formatSmartNumber(value)}
 * />
 * ```
 */
export function AxisX({
  tickFormatter,
  label,
  tickRotation = 0,
  showAxisLine = true,
  showTicks = true,
  ariaLabel,
  ...props
}: AxisXProps) {
  return (
    <XAxis
      {...props}
      stroke={showAxisLine ? designTokens.colors.chart.axis : 'transparent'}
      tick={{
        fill: designTokens.colors.neutral.text[500],
        fontSize: parseInt(designTokens.typography.fontSize.xs),
        fontFamily: designTokens.typography.fontFamily.primary,
        textAnchor: tickRotation !== 0 ? 'end' : 'middle',
      } as any}
      angle={tickRotation}
      tickLine={showTicks}
      tickFormatter={tickFormatter}
      label={
        label
          ? {
              value: label,
              position: 'insideBottom',
              offset: -10,
              style: {
                fill: designTokens.colors.neutral.text[700],
                fontSize: parseInt(designTokens.typography.fontSize.sm),
                fontWeight: designTokens.typography.fontWeight.medium,
                fontFamily: designTokens.typography.fontFamily.primary,
              },
            }
          : undefined
      }
      aria-label={ariaLabel || `X axis${label ? `: ${label}` : ''}`}
    />
  );
}
