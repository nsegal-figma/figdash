/**
 * ChartLoading Component
 * Loading skeleton for charts with pulse animation
 */

import { motion } from 'framer-motion';
import { designTokens } from '@/lib/designTokens';

export interface ChartLoadingProps {
  /** Width of skeleton */
  width?: number | string;
  /** Height of skeleton */
  height?: number | string;
  /** Chart type for skeleton shape */
  variant?: 'bar' | 'line' | 'pie' | 'generic';
}

/**
 * ChartLoading - Loading skeleton with pulse animation
 *
 * Usage:
 * ```tsx
 * {isLoading ? (
 *   <ChartLoading variant="bar" height={400} />
 * ) : (
 *   <BarChart data={data}>...</BarChart>
 * )}
 * ```
 */
export function ChartLoading({
  width = '100%',
  height = 400,
  variant = 'generic',
}: ChartLoadingProps) {
  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: designTokens.colors.neutral.background[50],
    borderRadius: designTokens.borderRadius.lg,
  };

  return (
    <div
      style={containerStyle}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading chart data"
    >
      <motion.div
        style={{
          width: '80%',
          height: '80%',
          backgroundColor: designTokens.colors.neutral.background[200],
          borderRadius: designTokens.borderRadius.md,
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div
          style={{
            padding: designTokens.spacing[8],
            textAlign: 'center',
            color: designTokens.colors.neutral.text[400],
            fontSize: designTokens.typography.fontSize.sm,
            fontFamily: designTokens.typography.fontFamily.primary,
          }}
        >
          Loading chart...
        </div>
      </motion.div>
    </div>
  );
}
