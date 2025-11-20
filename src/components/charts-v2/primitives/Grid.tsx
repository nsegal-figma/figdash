/**
 * Grid Component
 * Wrapper around Recharts CartesianGrid with design tokens applied
 */

import { CartesianGrid } from 'recharts';
import type { CartesianGridProps } from 'recharts';
import { designTokens } from '@/lib/designTokens';

export interface GridProps extends Omit<CartesianGridProps, 'stroke' | 'strokeDasharray'> {
  /** Grid line style */
  variant?: 'solid' | 'dashed' | 'dotted';
  /** Grid opacity (0-1) */
  opacity?: number;
  /** Show horizontal grid lines */
  showHorizontal?: boolean;
  /** Show vertical grid lines */
  showVertical?: boolean;
  /** Background fill color */
  backgroundFill?: string;
  /** Use subtle styling (lighter grid) */
  subtle?: boolean;
}

/**
 * Grid - Chart background grid component with design tokens
 *
 * Usage:
 * ```tsx
 * <Grid variant="dashed" opacity={0.5} />
 * <Grid showHorizontal showVertical={false} /> // Horizontal lines only
 * <Grid subtle /> // Very light grid
 * ```
 */
export function Grid({
  variant = 'dashed',
  opacity = 1,
  showHorizontal = true,
  showVertical = true,
  backgroundFill,
  subtle = false,
  ...props
}: GridProps) {
  const strokeColor = subtle
    ? designTokens.colors.neutral.border[100]
    : designTokens.colors.chart.grid;

  const strokeDasharray = {
    solid: undefined,
    dashed: '3 3',
    dotted: '1 3',
  }[variant];

  return (
    <>
      {backgroundFill && (
        <rect
          x={0}
          y={0}
          width="100%"
          height="100%"
          fill={backgroundFill}
          opacity={opacity * 0.3}
        />
      )}
      <CartesianGrid
        {...props}
        stroke={strokeColor}
        strokeDasharray={strokeDasharray}
        strokeOpacity={opacity}
        horizontal={showHorizontal}
        vertical={showVertical}
      />
    </>
  );
}

/**
 * GridRows - Horizontal grid lines only
 */
export function GridRows(props: Omit<GridProps, 'showHorizontal' | 'showVertical'>) {
  return <Grid {...props} showHorizontal showVertical={false} />;
}

/**
 * GridColumns - Vertical grid lines only
 */
export function GridColumns(props: Omit<GridProps, 'showHorizontal' | 'showVertical'>) {
  return <Grid {...props} showHorizontal={false} showVertical />;
}
