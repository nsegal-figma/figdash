/**
 * ChartContainer Component
 * Responsive container for charts with error handling and theming
 */

import type { ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';
import { designTokens } from '@/lib/designTokens';

export interface ChartContainerProps {
  /** Chart content (Recharts chart component) */
  children: ReactNode;
  /** Container width (number in px or string percentage, default: "100%") */
  width?: number | string;
  /** Container height (number in px or string, default: 400) */
  height?: number | string;
  /** Aspect ratio to maintain (e.g., 16/9) */
  aspectRatio?: number;
  /** Minimum height in pixels */
  minHeight?: number;
  /** Maximum height in pixels */
  maxHeight?: number;
  /** Chart title */
  title?: string;
  /** Additional CSS class */
  className?: string;
  /** Enable print-friendly styles */
  printFriendly?: boolean;
}

/**
 * ChartContainer - Responsive container for charts
 *
 * Features:
 * - Automatic responsive sizing via ResponsiveContainer
 * - Optional title with design token styling
 * - Aspect ratio maintenance
 * - Min/max height constraints
 * - Print-friendly styles
 *
 * Usage:
 * ```tsx
 * <ChartContainer title="Response Distribution" height={400}>
 *   <BarChart data={data}>
 *     <AxisX dataKey="name" />
 *     <AxisY />
 *     <Bar dataKey="value" />
 *   </BarChart>
 * </ChartContainer>
 * ```
 */
export function ChartContainer({
  children,
  width = '100%',
  height = 400,
  aspectRatio,
  minHeight,
  maxHeight,
  title,
  className = '',
  printFriendly = true,
}: ChartContainerProps) {
  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    minHeight: minHeight ? `${minHeight}px` : undefined,
    maxHeight: maxHeight ? `${maxHeight}px` : undefined,
    aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
  };

  const printStyles = printFriendly
    ? {
        '@media print': {
          breakInside: 'avoid',
          pageBreakInside: 'avoid',
        },
      }
    : {};

  return (
    <div
      className={`chart-container ${className}`}
      style={{ ...containerStyle, ...printStyles }}
    >
      {title && (
        <h3
          style={{
            fontSize: designTokens.typography.fontSize.base,
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.neutral.text[900],
            marginBottom: designTokens.spacing[4],
            fontFamily: designTokens.typography.fontFamily.primary,
          }}
        >
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
