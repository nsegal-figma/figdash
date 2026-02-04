/**
 * Themes Module
 * Exports all theme-related utilities and constants
 */

export { DEFAULT_THEME } from './defaultTheme';

export {
  DARK_THEME,
  MINIMAL_THEME,
  PRESENTATION_THEME,
  PRINT_THEME,
  PRESET_THEMES,
  getPresetTheme,
} from './presetThemes';

export {
  FONT_SIZE_MAP,
  FONT_SIZE_PX,
  BORDER_RADIUS_MAP,
  BORDER_RADIUS_PX,
  SHADOW_MAP,
  GRID_STYLE_MAP,
  EASING_MAP,
  opacityToHex,
  getBarBackground,
  computeThemeStyles,
  cloneTheme,
  mergeTheme,
  isValidTheme,
  generateThemeId,
} from './themeUtils';
