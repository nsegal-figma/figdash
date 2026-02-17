/**
 * Emphasis style utilities
 * Extracted from EmphasisOverlay to satisfy React Fast Refresh
 * (only React components should be exported from component files)
 */

import type { EmphasisStyle } from '../../types/storytelling';

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
