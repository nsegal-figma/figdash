/**
 * Chart Theme Type Definitions
 * Comprehensive theming configuration for survey charts
 */

// ============ Size Tokens ============
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type FontWeight = 400 | 500 | 600 | 700;
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type Shadow = 'none' | 'sm' | 'md' | 'lg';

// ============ Color Settings ============
export interface ChartThemeColors {
  /** Data palette ID (references existing COLOR_PALETTES) */
  dataPaletteId: string;
  /** Chart background */
  background: string;
  /** Card/container background */
  cardBackground: string;
  /** Primary text color (titles) */
  textPrimary: string;
  /** Secondary text color (labels, captions) */
  textSecondary: string;
  /** Muted text color (axis ticks) */
  textMuted: string;
  /** Grid lines color */
  gridColor: string;
  /** Axis lines color */
  axisColor: string;
  /** Border color for containers */
  borderColor: string;
  /** Value label text color (on bars) */
  valueLabelColor: string;
}

// ============ Typography Settings ============
export interface ChartThemeTypography {
  /** Font family for all chart text */
  fontFamily: string;
  /** Title font size (question titles) */
  titleSize: FontSize;
  /** Title font weight */
  titleWeight: FontWeight;
  /** Label font size (axis labels, bar labels) */
  labelSize: FontSize;
  /** Label font weight */
  labelWeight: FontWeight;
  /** Value font size (numbers on bars) */
  valueSize: FontSize;
  /** Value font weight */
  valueWeight: FontWeight;
  /** Legend font size */
  legendSize: FontSize;
  /** Axis tick font size */
  axisTickSize: FontSize;
}

// ============ Layout & Spacing Settings ============
export type LegendPosition = 'top' | 'bottom' | 'left' | 'right' | 'none';

export interface ChartThemeLayout {
  /** Horizontal bar height in pixels */
  barHeight: number;
  /** Gap between bars in pixels */
  barGap: number;
  /** Label column width in pixels (for horizontal bars) */
  labelWidth: number;
  /** Chart padding [top, right, bottom, left] */
  chartPadding: [number, number, number, number];
  /** Grouped chart height in pixels */
  groupedChartHeight: number;
  /** Grouped bar width in pixels */
  groupedBarWidth: number;
  /** Legend position */
  legendPosition: LegendPosition;
  /** Legend swatch size in pixels */
  legendSwatchSize: number;
}

// ============ Shape & Border Settings ============
export type StackedBarRadiusStyle = 'none' | 'ends-only' | 'all';
export type BarStyle = 'solid' | 'gradient';
export type LegendSwatchShape = 'square' | 'circle' | 'rounded';

export interface ChartThemeShapes {
  /** Bar border radius (horizontal bars, right side) */
  barBorderRadius: BorderRadius;
  /** Stacked bar border radius style */
  stackedBarRadius: StackedBarRadiusStyle;
  /** Grouped bar border radius (top corners) */
  groupedBarRadius: BorderRadius;
  /** Bar border width (0 = no border) */
  barBorderWidth: number;
  /** Bar border color (if borderWidth > 0) */
  barBorderColor: string;
  /** Bar fill style */
  barStyle: BarStyle;
  /** Gradient opacity for start (0-1) */
  gradientStartOpacity: number;
  /** Gradient opacity for end (0-1) */
  gradientEndOpacity: number;
  /** Container border radius */
  containerRadius: BorderRadius;
  /** Legend swatch shape */
  legendSwatchShape: LegendSwatchShape;
}

// ============ Grid & Axis Settings ============
export type GridStyle = 'solid' | 'dashed' | 'dotted';
export type AxisDivisions = 4 | 5 | 10;

export interface ChartThemeGrid {
  /** Show horizontal grid lines */
  showHorizontalGrid: boolean;
  /** Show vertical grid lines */
  showVerticalGrid: boolean;
  /** Grid line style */
  gridStyle: GridStyle;
  /** Grid line opacity (0-1) */
  gridOpacity: number;
  /** Show axis lines */
  showAxisLines: boolean;
  /** Show axis ticks/labels */
  showAxisTicks: boolean;
  /** Number of axis divisions for scale */
  axisDivisions: AxisDivisions;
}

// ============ Data Label Settings ============
export type ValuePosition = 'inside' | 'outside' | 'end';
export type NumberFormat = 'raw' | 'abbreviated' | 'percentage';
export type DecimalPlaces = 0 | 1 | 2;

export interface ChartThemeDataLabels {
  /** Show value labels on horizontal bars */
  showBarValues: boolean;
  /** Position of value labels */
  valuePosition: ValuePosition;
  /** Show percentage labels on stacked bars */
  showStackedPercentages: boolean;
  /** Minimum bar percentage to show label (stacked) */
  minPercentageForLabel: number;
  /** Number format for values */
  numberFormat: NumberFormat;
  /** Decimal places for percentages */
  percentageDecimals: DecimalPlaces;
}

// ============ Effects & Animation Settings ============
export type AnimationEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

export interface ChartThemeEffects {
  /** Shadow on chart containers */
  containerShadow: Shadow;
  /** Hover opacity change (0-1) */
  hoverOpacity: number;
  /** Enable hover cursor pointer */
  hoverCursor: boolean;
  /** Animation duration in ms (0 = no animation) */
  animationDuration: number;
  /** Animation easing function */
  animationEasing: AnimationEasing;
}

// ============ Complete Theme ============
export interface ChartTheme {
  /** Unique theme identifier */
  id: string;
  /** Display name for the theme */
  name: string;
  /** Theme description */
  description?: string;
  /** Is this a built-in theme (cannot be deleted) */
  isBuiltIn: boolean;
  /** Creation timestamp */
  createdAt: number;
  /** Last modified timestamp */
  updatedAt: number;

  // Theme sections
  colors: ChartThemeColors;
  typography: ChartThemeTypography;
  layout: ChartThemeLayout;
  shapes: ChartThemeShapes;
  grid: ChartThemeGrid;
  dataLabels: ChartThemeDataLabels;
  effects: ChartThemeEffects;
}

// ============ Saved Theme (for persistence) ============
export interface SavedTheme {
  id: string;
  name: string;
  description?: string;
  theme: ChartTheme;
  createdAt: number;
  updatedAt: number;
}
