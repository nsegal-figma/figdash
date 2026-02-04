/**
 * Theme Utility Functions
 * CSS mappings and helper functions for applying themes
 */

import type {
  FontSize,
  BorderRadius,
  Shadow,
  GridStyle,
  AnimationEasing,
  ChartTheme,
  BarStyle,
} from '../../types/chartTheme';

// ============ Font Size Mappings ============
export const FONT_SIZE_MAP: Record<FontSize, string> = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
};

export const FONT_SIZE_PX: Record<FontSize, number> = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
};

// ============ Border Radius Mappings ============
export const BORDER_RADIUS_MAP: Record<BorderRadius, string> = {
  none: '0',
  sm: '0.125rem', // 2px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
};

export const BORDER_RADIUS_PX: Record<BorderRadius, number> = {
  none: 0,
  sm: 2,
  md: 6,
  lg: 8,
  xl: 12,
};

// ============ Shadow Mappings ============
export const SHADOW_MAP: Record<Shadow, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
};

// ============ Grid Style Mappings ============
export const GRID_STYLE_MAP: Record<GridStyle, string> = {
  solid: 'solid',
  dashed: 'dashed',
  dotted: 'dotted',
};

// ============ Animation Easing Mappings ============
export const EASING_MAP: Record<AnimationEasing, string> = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

// ============ Helper Functions ============

/**
 * Convert opacity (0-1) to hex alpha value
 */
export function opacityToHex(opacity: number): string {
  const alpha = Math.round(Math.max(0, Math.min(1, opacity)) * 255);
  return alpha.toString(16).padStart(2, '0');
}

/**
 * Generate bar background style (solid or gradient)
 */
export function getBarBackground(
  color: string,
  barStyle: BarStyle,
  gradientStartOpacity: number,
  gradientEndOpacity: number
): string {
  if (barStyle === 'solid') {
    return color;
  }

  const startHex = opacityToHex(gradientStartOpacity);
  const endHex = opacityToHex(gradientEndOpacity);

  return `linear-gradient(90deg, ${color}${startHex}, ${color}${endHex})`;
}

/**
 * Generate computed styles from theme
 */
export function computeThemeStyles(theme: ChartTheme) {
  return {
    // Typography
    fontFamily: theme.typography.fontFamily,
    titleFontSize: FONT_SIZE_MAP[theme.typography.titleSize],
    labelFontSize: FONT_SIZE_MAP[theme.typography.labelSize],
    valueFontSize: FONT_SIZE_MAP[theme.typography.valueSize],
    legendFontSize: FONT_SIZE_MAP[theme.typography.legendSize],
    axisTickFontSize: FONT_SIZE_MAP[theme.typography.axisTickSize],

    // Border radius
    barBorderRadius: BORDER_RADIUS_MAP[theme.shapes.barBorderRadius],
    barBorderRadiusPx: BORDER_RADIUS_PX[theme.shapes.barBorderRadius],
    containerBorderRadius: BORDER_RADIUS_MAP[theme.shapes.containerRadius],
    groupedBarBorderRadius: BORDER_RADIUS_MAP[theme.shapes.groupedBarRadius],

    // Shadows
    containerShadow: SHADOW_MAP[theme.effects.containerShadow],

    // Grid
    gridBorderStyle: GRID_STYLE_MAP[theme.grid.gridStyle],

    // Animation
    animationEasing: EASING_MAP[theme.effects.animationEasing],
    animationTransition: `all ${theme.effects.animationDuration}ms ${EASING_MAP[theme.effects.animationEasing]}`,

    // Helper function for bar gradients
    getBarGradient: (color: string) =>
      getBarBackground(
        color,
        theme.shapes.barStyle,
        theme.shapes.gradientStartOpacity,
        theme.shapes.gradientEndOpacity
      ),
  };
}

/**
 * Deep clone a theme object
 */
export function cloneTheme(theme: ChartTheme): ChartTheme {
  return JSON.parse(JSON.stringify(theme));
}

/**
 * Merge partial theme updates with existing theme
 */
export function mergeTheme(
  base: ChartTheme,
  updates: Partial<ChartTheme>
): ChartTheme {
  return {
    ...base,
    ...updates,
    colors: { ...base.colors, ...updates.colors },
    typography: { ...base.typography, ...updates.typography },
    layout: { ...base.layout, ...updates.layout },
    shapes: { ...base.shapes, ...updates.shapes },
    grid: { ...base.grid, ...updates.grid },
    dataLabels: { ...base.dataLabels, ...updates.dataLabels },
    effects: { ...base.effects, ...updates.effects },
    updatedAt: Date.now(),
  };
}

/**
 * Validate a theme object has all required fields
 */
export function isValidTheme(obj: unknown): obj is ChartTheme {
  if (!obj || typeof obj !== 'object') return false;

  const theme = obj as Record<string, unknown>;

  return (
    typeof theme.id === 'string' &&
    typeof theme.name === 'string' &&
    theme.colors !== undefined &&
    theme.typography !== undefined &&
    theme.layout !== undefined &&
    theme.shapes !== undefined &&
    theme.grid !== undefined &&
    theme.dataLabels !== undefined &&
    theme.effects !== undefined
  );
}

/**
 * Generate a unique theme ID
 */
export function generateThemeId(): string {
  return `theme-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
