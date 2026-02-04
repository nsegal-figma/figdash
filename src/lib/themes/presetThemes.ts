/**
 * Preset Themes
 * Built-in themes that users can use as starting points
 */

import type { ChartTheme } from '../../types/chartTheme';
import { DEFAULT_THEME } from './defaultTheme';

/**
 * Dark Theme
 * Dark backgrounds, light text, optimized for dark mode
 */
export const DARK_THEME: ChartTheme = {
  ...DEFAULT_THEME,
  id: 'dark',
  name: 'Dark',
  description: 'Dark mode with light text and adjusted colors',

  colors: {
    dataPaletteId: 'ocean',
    background: '#111827', // gray-900
    cardBackground: '#1F2937', // gray-800
    textPrimary: '#F9FAFB', // gray-50
    textSecondary: '#E5E7EB', // gray-200
    textMuted: '#9CA3AF', // gray-400
    gridColor: '#374151', // gray-700
    axisColor: '#6B7280', // gray-500
    borderColor: '#374151', // gray-700
    valueLabelColor: '#FFFFFF',
  },

  shapes: {
    ...DEFAULT_THEME.shapes,
    barStyle: 'solid',
    containerRadius: 'lg',
  },

  effects: {
    ...DEFAULT_THEME.effects,
    containerShadow: 'lg',
  },
};

/**
 * Minimal Theme
 * Clean, reduced visual noise, subtle colors
 */
export const MINIMAL_THEME: ChartTheme = {
  ...DEFAULT_THEME,
  id: 'minimal',
  name: 'Minimal',
  description: 'Clean design with reduced visual elements',

  colors: {
    dataPaletteId: 'cool',
    background: '#FFFFFF',
    cardBackground: '#FFFFFF',
    textPrimary: '#374151', // gray-700
    textSecondary: '#6B7280', // gray-500
    textMuted: '#9CA3AF', // gray-400
    gridColor: '#F3F4F6', // gray-100
    axisColor: '#D1D5DB', // gray-300
    borderColor: '#F3F4F6', // gray-100
    valueLabelColor: '#FFFFFF',
  },

  typography: {
    ...DEFAULT_THEME.typography,
    titleWeight: 400,
    valueWeight: 500,
  },

  layout: {
    ...DEFAULT_THEME.layout,
    barHeight: 32,
    barGap: 6,
  },

  shapes: {
    ...DEFAULT_THEME.shapes,
    barBorderRadius: 'sm',
    stackedBarRadius: 'none',
    groupedBarRadius: 'sm',
    barStyle: 'solid',
    containerRadius: 'md',
    legendSwatchShape: 'circle',
  },

  grid: {
    ...DEFAULT_THEME.grid,
    showAxisLines: false,
    showAxisTicks: false,
  },

  effects: {
    ...DEFAULT_THEME.effects,
    containerShadow: 'none',
    hoverOpacity: 0.8,
  },
};

/**
 * Presentation Theme
 * Larger fonts, bolder colors, optimized for projectors/screens
 */
export const PRESENTATION_THEME: ChartTheme = {
  ...DEFAULT_THEME,
  id: 'presentation',
  name: 'Presentation',
  description: 'Bold and large, optimized for presentations',

  colors: {
    dataPaletteId: 'default',
    background: '#FFFFFF',
    cardBackground: '#FFFFFF',
    textPrimary: '#111827', // gray-900
    textSecondary: '#1F2937', // gray-800
    textMuted: '#6B7280', // gray-500
    gridColor: '#E5E7EB', // gray-200
    axisColor: '#6B7280', // gray-500
    borderColor: '#D1D5DB', // gray-300
    valueLabelColor: '#FFFFFF',
  },

  typography: {
    ...DEFAULT_THEME.typography,
    fontFamily: 'inherit',
    titleSize: 'lg',
    titleWeight: 600,
    labelSize: 'base',
    labelWeight: 500,
    valueSize: 'base',
    valueWeight: 700,
    legendSize: 'sm',
    axisTickSize: 'sm',
  },

  layout: {
    ...DEFAULT_THEME.layout,
    barHeight: 48,
    barGap: 12,
    labelWidth: 280,
    groupedChartHeight: 320,
    groupedBarWidth: 56,
    legendSwatchSize: 16,
  },

  shapes: {
    ...DEFAULT_THEME.shapes,
    barBorderRadius: 'lg',
    groupedBarRadius: 'lg',
    barStyle: 'gradient',
    containerRadius: 'xl',
  },

  effects: {
    ...DEFAULT_THEME.effects,
    containerShadow: 'md',
    animationDuration: 200,
  },
};

/**
 * Print Theme
 * High contrast, no gradients/effects, optimized for PDF/print
 */
export const PRINT_THEME: ChartTheme = {
  ...DEFAULT_THEME,
  id: 'print',
  name: 'Print',
  description: 'High contrast, optimized for printing and PDF export',

  colors: {
    dataPaletteId: 'cool',
    background: '#FFFFFF',
    cardBackground: '#FFFFFF',
    textPrimary: '#000000',
    textSecondary: '#1F2937', // gray-800
    textMuted: '#4B5563', // gray-600
    gridColor: '#D1D5DB', // gray-300
    axisColor: '#4B5563', // gray-600
    borderColor: '#9CA3AF', // gray-400
    valueLabelColor: '#FFFFFF',
  },

  typography: {
    ...DEFAULT_THEME.typography,
    titleWeight: 600,
    labelWeight: 500,
    valueWeight: 700,
  },

  shapes: {
    ...DEFAULT_THEME.shapes,
    barBorderRadius: 'none',
    stackedBarRadius: 'none',
    groupedBarRadius: 'none',
    barStyle: 'solid',
    barBorderWidth: 1,
    barBorderColor: '#374151',
    containerRadius: 'sm',
    legendSwatchShape: 'square',
  },

  grid: {
    ...DEFAULT_THEME.grid,
    showHorizontalGrid: true,
    showVerticalGrid: true,
    gridStyle: 'solid',
    gridOpacity: 0.3,
  },

  effects: {
    ...DEFAULT_THEME.effects,
    containerShadow: 'none',
    hoverOpacity: 1, // No hover effect for print
    hoverCursor: false,
    animationDuration: 0, // No animation for print
  },
};

/**
 * All preset themes
 */
export const PRESET_THEMES: ChartTheme[] = [
  DEFAULT_THEME,
  DARK_THEME,
  MINIMAL_THEME,
  PRESENTATION_THEME,
  PRINT_THEME,
];

/**
 * Get a preset theme by ID
 */
export function getPresetTheme(id: string): ChartTheme | undefined {
  return PRESET_THEMES.find((theme) => theme.id === id);
}
