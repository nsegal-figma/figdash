/**
 * Spacing & Layout Utilities
 * Functions for calculating chart margins, responsive sizing, and layouts
 * All based on 8px spacing system
 */

import { spacingTokens } from './spacing';

/**
 * Standard breakpoints for responsive design
 */
export const breakpoints = {
  sm: 640,   // Small devices (mobile landscape)
  md: 768,   // Tablets
  lg: 1024,  // Laptops
  xl: 1280,  // Desktops
  '2xl': 1536, // Large desktops
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Chart margin configuration
 */
export interface ChartMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Calculate responsive chart margins based on container size
 * @param containerWidth - Width of container in pixels
 * @param containerHeight - Height of container in pixels
 * @param hasXAxis - Whether chart has X axis labels (requires bottom margin)
 * @param hasYAxis - Whether chart has Y axis labels (requires left margin)
 * @returns Margin object with top/right/bottom/left in pixels
 */
export function calculateChartMargins(
  containerWidth: number,
  containerHeight: number,
  hasXAxis = true,
  hasYAxis = true
): ChartMargins {
  // Base margins in 8px units
  const baseUnit = 8;

  // Scale margins based on container size
  const scale = Math.min(containerWidth, containerHeight) / 400; // 400px reference
  const clampedScale = Math.max(0.75, Math.min(scale, 1.5));

  // Round to nearest 8px multiple for consistency
  const roundTo8px = (value: number) => Math.round(value / baseUnit) * baseUnit;

  return {
    top: roundTo8px(baseUnit * 2.5 * clampedScale),      // 20px base
    right: roundTo8px(baseUnit * 2.5 * clampedScale),    // 20px base
    bottom: hasXAxis ? roundTo8px(baseUnit * 5 * clampedScale) : roundTo8px(baseUnit * 2 * clampedScale), // 40px with axis, 16px without
    left: hasYAxis ? roundTo8px(baseUnit * 6 * clampedScale) : roundTo8px(baseUnit * 2 * clampedScale),   // 48px with axis, 16px without
  };
}

/**
 * Calculate chart dimensions maintaining aspect ratio
 * @param containerWidth - Available container width
 * @param containerHeight - Available container height
 * @param aspectRatio - Desired aspect ratio (width/height, e.g., 16/9)
 * @returns Object with width and height that fits container while maintaining aspect ratio
 */
export function calculateChartDimensions(
  containerWidth: number,
  containerHeight: number,
  aspectRatio: number
): { width: number; height: number } {
  const containerRatio = containerWidth / containerHeight;

  if (containerRatio > aspectRatio) {
    // Container is wider than desired aspect ratio - constrain by height
    return {
      width: Math.round(containerHeight * aspectRatio),
      height: containerHeight,
    };
  } else {
    // Container is taller than desired aspect ratio - constrain by width
    return {
      width: containerWidth,
      height: Math.round(containerWidth / aspectRatio),
    };
  }
}

/**
 * Get current breakpoint based on container width
 * @param width - Container width in pixels
 * @returns Breakpoint name ('sm', 'md', 'lg', 'xl', '2xl')
 */
export function getCurrentBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  return 'sm';
}

/**
 * Check if container meets minimum breakpoint
 * @param width - Container width in pixels
 * @param breakpoint - Minimum breakpoint to check
 * @returns True if width >= breakpoint
 */
export function meetsBreakpoint(width: number, breakpoint: Breakpoint): boolean {
  return width >= breakpoints[breakpoint];
}

/**
 * Calculate responsive chart height
 * @param containerWidth - Container width
 * @param breakpoint - Current breakpoint (optional, calculated if not provided)
 * @returns Recommended chart height in pixels
 */
export function getResponsiveChartHeight(
  containerWidth: number,
  breakpoint?: Breakpoint
): number {
  const bp = breakpoint || getCurrentBreakpoint(containerWidth);

  // Height recommendations based on breakpoint
  const heightMap: Record<Breakpoint, number> = {
    sm: 250,   // Mobile landscape
    md: 300,   // Tablets
    lg: 350,   // Laptops
    xl: 400,   // Desktops
    '2xl': 450, // Large desktops
  };

  return heightMap[bp];
}

/**
 * Calculate grid layout for multiple charts
 * @param chartCount - Number of charts to display
 * @param containerWidth - Available container width
 * @returns Grid configuration (columns, rows, chart dimensions)
 */
export function calculateChartGrid(
  chartCount: number,
  containerWidth: number
): {
  columns: number;
  rows: number;
  chartWidth: number;
  chartHeight: number;
  gap: number;
} {
  const breakpoint = getCurrentBreakpoint(containerWidth);

  // Determine grid columns based on breakpoint and count
  let columns: number;
  if (breakpoint === 'sm') {
    columns = 1; // Single column on mobile
  } else if (breakpoint === 'md') {
    columns = Math.min(chartCount, 2); // Up to 2 columns on tablets
  } else {
    columns = Math.min(chartCount, 3); // Up to 3 columns on desktop
  }

  const rows = Math.ceil(chartCount / columns);

  // Gap between charts (in pixels)
  const gapMap: Record<Breakpoint, number> = {
    sm: 16,  // 2 * 8px
    md: 24,  // 3 * 8px
    lg: 32,  // 4 * 8px
    xl: 32,  // 4 * 8px
    '2xl': 32, // 4 * 8px
  };
  const gap = gapMap[breakpoint];

  // Calculate chart dimensions
  const totalGapWidth = (columns - 1) * gap;
  const chartWidth = Math.floor((containerWidth - totalGapWidth) / columns);
  const chartHeight = getResponsiveChartHeight(chartWidth, breakpoint);

  return {
    columns,
    rows,
    chartWidth,
    chartHeight,
    gap,
  };
}

/**
 * Get spacing value in pixels from spacing token
 * @param token - Spacing token key (0-20)
 * @returns Spacing in pixels
 */
export function getSpacingPx(token: keyof typeof spacingTokens): number {
  const value = spacingTokens[token];
  if (value === '0') return 0;

  // Convert rem to pixels (assumes 16px = 1rem)
  const rem = parseFloat(value);
  return rem * 16;
}

/**
 * Common aspect ratios for charts
 */
export const aspectRatios = {
  '16:9': 16 / 9,   // Widescreen (1.778)
  '4:3': 4 / 3,     // Classic (1.333)
  '3:2': 3 / 2,     // Standard photo (1.5)
  '1:1': 1,         // Square
  '2:1': 2,         // Ultra-wide
  golden: 1.618,    // Golden ratio
} as const;

/**
 * Calculate inner chart dimensions (excluding margins)
 * @param totalWidth - Total chart width including margins
 * @param totalHeight - Total chart height including margins
 * @param margins - Margin configuration
 * @returns Inner dimensions for chart rendering area
 */
export function calculateInnerDimensions(
  totalWidth: number,
  totalHeight: number,
  margins: ChartMargins
): { width: number; height: number } {
  return {
    width: Math.max(0, totalWidth - margins.left - margins.right),
    height: Math.max(0, totalHeight - margins.top - margins.bottom),
  };
}

/**
 * Check if container supports specific feature based on size
 * @param containerWidth - Container width in pixels
 * @param feature - Feature to check ('legend', 'tooltip', 'annotations', 'title')
 * @returns True if container is large enough for feature
 */
export function supportsFeature(
  containerWidth: number,
  feature: 'legend' | 'tooltip' | 'annotations' | 'title'
): boolean {
  const minimumWidths = {
    legend: 400,       // Need 400px for legend display
    tooltip: 200,      // Need 200px for tooltip
    annotations: 500,  // Need 500px for annotation labels
    title: 300,        // Need 300px for chart title
  };

  return containerWidth >= minimumWidths[feature];
}

/**
 * Calculate optimal chart count per row for dashboard
 * @param containerWidth - Dashboard container width
 * @param preferredChartWidth - Preferred individual chart width (default: 400)
 * @returns Number of charts that fit per row
 */
export function getOptimalChartsPerRow(
  containerWidth: number,
  preferredChartWidth = 400
): number {
  const breakpoint = getCurrentBreakpoint(containerWidth);

  // Mobile: Always 1
  if (breakpoint === 'sm') return 1;

  // Calculate based on preferred width + gaps
  const gap = 24; // 3 * 8px
  const maxCharts = Math.floor((containerWidth + gap) / (preferredChartWidth + gap));

  // Clamp between 1 and 4
  return Math.max(1, Math.min(maxCharts, 4));
}
