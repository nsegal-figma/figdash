/**
 * Design Tokens - Visualization System
 * Single source of truth for all visual properties
 *
 * Usage:
 * import { designTokens } from '@/lib/designTokens';
 *
 * const barColor = designTokens.colors.data.categorical[0];
 * const fontSize = designTokens.typography.fontSize.sm;
 */

import type { DesignTokens } from './types';
import { colorTokens } from './colors';
import { typographyTokens } from './typography';
import { spacingTokens } from './spacing';
import { shadowTokens } from './shadows';
import { borderRadiusTokens } from './borderRadius';
import { animationTokens } from './animation';

/**
 * Complete Design Token System
 */
export const designTokens: DesignTokens = {
  colors: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  shadows: shadowTokens,
  borderRadius: borderRadiusTokens,
  animation: animationTokens,
};

// Re-export individual token sets for convenience
export { colorTokens } from './colors';
export { typographyTokens } from './typography';
export { spacingTokens } from './spacing';
export { shadowTokens } from './shadows';
export { borderRadiusTokens } from './borderRadius';
export { animationTokens } from './animation';

// Typography utility functions
export {
  formatNumberAbbreviated,
  formatNumber,
  formatPercentage,
  formatCurrency,
  formatDate,
  truncateText,
  getResponsiveFontSize,
  formatMonospaceNumber,
  formatCompactNumber,
  formatSmartNumber,
} from './typographyUtils';

// Spacing & layout utility functions
export {
  calculateChartMargins,
  calculateChartDimensions,
  getCurrentBreakpoint,
  meetsBreakpoint,
  getResponsiveChartHeight,
  calculateChartGrid,
  getSpacingPx,
  aspectRatios,
  calculateInnerDimensions,
  supportsFeature,
  getOptimalChartsPerRow,
  breakpoints,
} from './spacingUtils';
export type { ChartMargins, Breakpoint } from './spacingUtils';

// Re-export utility functions
export { getContrastRatio, meetsWCAG_AA } from './colors';
export {
  generateSequentialScale,
  generateDivergingScale,
  generateCategoricalPalette,
  adjustBrightness,
  simulateColorBlindness,
  checkColorBlindAccessibility,
  autoAdjustContrast,
  generateDarkModeVariant,
  generateDarkModePalette,
} from './colorUtils';

// Re-export types
export type * from './types';
