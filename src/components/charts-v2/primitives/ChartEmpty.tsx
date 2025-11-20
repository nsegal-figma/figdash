/**
 * ChartEmpty Component
 * Empty state for charts with no data
 */

import { BarChart3, AlertCircle, Filter } from 'lucide-react';
import { designTokens } from '@/lib/designTokens';

export interface ChartEmptyProps {
  /** Width of empty state */
  width?: number | string;
  /** Height of empty state */
  height?: number | string;
  /** Empty state variant */
  variant?: 'no-data' | 'error' | 'filtered';
  /** Custom message */
  message?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * ChartEmpty - Empty state with icon and message
 *
 * Usage:
 * ```tsx
 * {data.length === 0 ? (
 *   <ChartEmpty
 *     variant="no-data"
 *     message="No survey responses yet"
 *   />
 * ) : (
 *   <BarChart data={data}>...</BarChart>
 * )}
 * ```
 */
export function ChartEmpty({
  width = '100%',
  height = 400,
  variant = 'no-data',
  message,
  action,
}: ChartEmptyProps) {
  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: designTokens.colors.neutral.background[50],
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing[8],
  };

  const getIcon = () => {
    const iconProps = {
      size: 48,
      color: designTokens.colors.neutral.text[300],
      strokeWidth: 1.5,
    };

    switch (variant) {
      case 'error':
        return <AlertCircle {...iconProps} color={designTokens.colors.semantic.error} />;
      case 'filtered':
        return <Filter {...iconProps} />;
      case 'no-data':
      default:
        return <BarChart3 {...iconProps} />;
    }
  };

  const getDefaultMessage = () => {
    switch (variant) {
      case 'error':
        return 'Unable to load chart data';
      case 'filtered':
        return 'No data matches current filters';
      case 'no-data':
      default:
        return 'No data available';
    }
  };

  return (
    <div style={containerStyle} role="status" aria-label={message || getDefaultMessage()}>
      {getIcon()}
      <p
        style={{
          marginTop: designTokens.spacing[4],
          color: designTokens.colors.neutral.text[600],
          fontSize: designTokens.typography.fontSize.base,
          fontFamily: designTokens.typography.fontFamily.primary,
          fontWeight: designTokens.typography.fontWeight.medium,
          textAlign: 'center',
        }}
      >
        {message || getDefaultMessage()}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop: designTokens.spacing[4],
            padding: `${designTokens.spacing[2]} ${designTokens.spacing[4]}`,
            backgroundColor: designTokens.colors.data.categorical[0],
            color: '#FFFFFF',
            border: 'none',
            borderRadius: designTokens.borderRadius.md,
            fontSize: designTokens.typography.fontSize.sm,
            fontFamily: designTokens.typography.fontFamily.primary,
            fontWeight: designTokens.typography.fontWeight.medium,
            cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
