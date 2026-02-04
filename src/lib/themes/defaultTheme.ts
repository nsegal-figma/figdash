/**
 * Default Theme
 * Matches the current hardcoded styles for backwards compatibility
 */

import type { ChartTheme } from '../../types/chartTheme';

export const DEFAULT_THEME: ChartTheme = {
  id: 'default',
  name: 'Default',
  description: 'The default survey dashboard theme',
  isBuiltIn: true,
  createdAt: 0,
  updatedAt: 0,

  colors: {
    dataPaletteId: 'default', // References COLOR_PALETTES[0]
    background: '#FFFFFF',
    cardBackground: '#FFFFFF',
    textPrimary: '#111827', // gray-900
    textSecondary: '#374151', // gray-700
    textMuted: '#9CA3AF', // gray-400
    gridColor: '#E5E7EB', // gray-200
    axisColor: '#9CA3AF', // gray-400
    borderColor: '#E5E7EB', // gray-200
    valueLabelColor: '#FFFFFF',
  },

  typography: {
    fontFamily: 'inherit', // Uses app's default font
    titleSize: 'sm',
    titleWeight: 500,
    labelSize: 'sm',
    labelWeight: 400,
    valueSize: 'sm',
    valueWeight: 600,
    legendSize: 'xs',
    axisTickSize: 'xs',
  },

  layout: {
    barHeight: 40, // h-10 = 2.5rem = 40px
    barGap: 8, // mb-2 = 0.5rem = 8px
    labelWidth: 224, // w-56 = 14rem = 224px
    chartPadding: [0, 0, 0, 0],
    groupedChartHeight: 280,
    groupedBarWidth: 48, // w-12 = 3rem = 48px
    legendPosition: 'bottom',
    legendSwatchSize: 12, // h-3 w-3 = 0.75rem = 12px
  },

  shapes: {
    barBorderRadius: 'md', // rounded-r-md = 6px
    stackedBarRadius: 'ends-only',
    groupedBarRadius: 'md', // rounded-t-md
    barBorderWidth: 0,
    barBorderColor: '#FFFFFF',
    barStyle: 'gradient',
    gradientStartOpacity: 0.87, // dd = 221/255 = 0.867
    gradientEndOpacity: 1,
    containerRadius: 'lg',
    legendSwatchShape: 'rounded',
  },

  grid: {
    showHorizontalGrid: false,
    showVerticalGrid: false,
    gridStyle: 'dashed',
    gridOpacity: 0.5,
    showAxisLines: true,
    showAxisTicks: true,
    axisDivisions: 5, // 0, 25%, 50%, 75%, 100%
  },

  dataLabels: {
    showBarValues: true,
    valuePosition: 'inside',
    showStackedPercentages: true,
    minPercentageForLabel: 5,
    numberFormat: 'raw',
    percentageDecimals: 0,
  },

  effects: {
    containerShadow: 'none',
    hoverOpacity: 0.9,
    hoverCursor: true,
    animationDuration: 150,
    animationEasing: 'easeOut',
  },
};
