/**
 * EmphasisOverlay Component
 * Applies visual emphasis styles to highlighted bars
 */

import type { EmphasisStyle } from '../../types/storytelling';
import { useChartTheme } from '../../hooks/useChartTheme';

interface EmphasisOverlayProps {
  style: EmphasisStyle;
  intensity: number;
  color?: string;
  children: React.ReactNode;
  className?: string;
}

export function EmphasisOverlay({
  style,
  intensity,
  color,
  children,
  className = '',
}: EmphasisOverlayProps) {
  const { theme } = useChartTheme();

  const emphasisColor = color || theme.colors.textPrimary;

  const getEmphasisStyles = (): React.CSSProperties => {
    // Convert intensity (0-1) to hex opacity
    const opacityHex = Math.round(intensity * 80)
      .toString(16)
      .padStart(2, '0');
    const glowOpacityHex = Math.round(intensity * 60)
      .toString(16)
      .padStart(2, '0');

    switch (style) {
      case 'highlight':
        return {
          boxShadow: `0 0 0 2px ${emphasisColor}${opacityHex}`,
          borderRadius: 'inherit',
        };
      case 'glow':
        return {
          boxShadow: `0 0 ${8 + intensity * 12}px ${emphasisColor}${glowOpacityHex}`,
          borderRadius: 'inherit',
        };
      case 'border':
        return {
          outline: `${1 + Math.round(intensity)}px solid ${emphasisColor}`,
          outlineOffset: '1px',
          borderRadius: 'inherit',
        };
      case 'none':
      default:
        return {};
    }
  };

  if (style === 'none') {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`} style={getEmphasisStyles()}>
      {children}
    </div>
  );
}

/**
 * Get inline emphasis styles without wrapper
 * Use this when you need to apply styles directly to an element
 */
export function getEmphasisStyles(
  style: EmphasisStyle,
  intensity: number,
  emphasisColor: string
): React.CSSProperties {
  const opacityHex = Math.round(intensity * 80)
    .toString(16)
    .padStart(2, '0');
  const glowOpacityHex = Math.round(intensity * 60)
    .toString(16)
    .padStart(2, '0');

  switch (style) {
    case 'highlight':
      return {
        boxShadow: `0 0 0 2px ${emphasisColor}${opacityHex}`,
      };
    case 'glow':
      return {
        boxShadow: `0 0 ${8 + intensity * 12}px ${emphasisColor}${glowOpacityHex}`,
      };
    case 'border':
      return {
        outline: `${1 + Math.round(intensity)}px solid ${emphasisColor}`,
        outlineOffset: '1px',
      };
    case 'none':
    default:
      return {};
  }
}
