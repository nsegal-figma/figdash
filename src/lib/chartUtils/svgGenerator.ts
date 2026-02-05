/**
 * SVG Chart Generator
 * Generates editable SVG from chart data and theme configuration
 */

import type { ChartTheme } from '../../types/chartTheme';
import { FONT_SIZE_PX, BORDER_RADIUS_PX } from '../themes/themeUtils';

// ============ Types ============

export interface SVGChartData {
  name: string;
  value: number;
}

export interface SVGChartOptions {
  data: SVGChartData[];
  title: string;
  totalN: number;
  colors: string[];
  theme: ChartTheme;
  width?: number;
}

// ============ Constants ============

const DEFAULT_WIDTH = 1200;
const PADDING = 24;
const TITLE_AREA_HEIGHT = 70;
const LABEL_BAR_GAP = 16;

// System font stack for when fontFamily is 'inherit'
const SYSTEM_FONT_STACK =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// ============ Helper Functions ============

/**
 * Escape XML special characters in text
 */
function escapeXML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Get resolved font family (handle 'inherit')
 */
function getFontFamily(fontFamily: string): string {
  return fontFamily === 'inherit' ? SYSTEM_FONT_STACK : fontFamily;
}

/**
 * Create SVG path for a bar with right-side rounded corners
 */
function createBarPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): string {
  // Ensure radius doesn't exceed half the bar dimensions
  const r = Math.min(radius, width / 2, height / 2);

  if (r <= 0 || width <= 0) {
    // Simple rectangle if no radius or zero width
    return `M ${x},${y} H ${x + width} V ${y + height} H ${x} Z`;
  }

  // Path with right-side rounded corners only
  return [
    `M ${x},${y}`,
    `H ${x + width - r}`,
    `Q ${x + width},${y} ${x + width},${y + r}`,
    `V ${y + height - r}`,
    `Q ${x + width},${y + height} ${x + width - r},${y + height}`,
    `H ${x}`,
    `Z`,
  ].join(' ');
}

/**
 * Create SVG gradient definition
 */
function createGradientDef(
  id: string,
  color: string,
  startOpacity: number,
  endOpacity: number
): string {
  return `  <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="${color}" stop-opacity="${startOpacity}"/>
    <stop offset="100%" stop-color="${color}" stop-opacity="${endOpacity}"/>
  </linearGradient>`;
}

// ============ Main Generator ============

/**
 * Generate SVG string from chart data and theme
 */
export function generateChartSVG(options: SVGChartOptions): string {
  const { data, title, totalN, colors, theme, width = DEFAULT_WIDTH } = options;

  // Extract theme values
  const LABEL_WIDTH = theme.layout.labelWidth;
  const BAR_HEIGHT = theme.layout.barHeight;
  const BAR_GAP = theme.layout.barGap;
  const barRadius = BORDER_RADIUS_PX[theme.shapes.barBorderRadius];

  // Calculate dimensions
  const chartAreaWidth = width - PADDING * 2 - LABEL_WIDTH - LABEL_BAR_GAP;
  const chartHeight = data.length * (BAR_HEIGHT + BAR_GAP) - BAR_GAP; // No gap after last bar
  const totalHeight = PADDING + TITLE_AREA_HEIGHT + chartHeight + PADDING;

  // Find max value for scaling
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  // Font settings
  const fontFamily = getFontFamily(theme.typography.fontFamily);
  const titleFontSize = FONT_SIZE_PX[theme.typography.titleSize];
  const labelFontSize = FONT_SIZE_PX[theme.typography.labelSize];
  const valueFontSize = FONT_SIZE_PX[theme.typography.valueSize];

  // Build SVG parts
  const parts: string[] = [];

  // SVG header
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}">`
  );

  // Gradient definitions (if using gradient style)
  if (theme.shapes.barStyle === 'gradient') {
    parts.push('<defs>');
    const uniqueColors = [...new Set(colors)];
    uniqueColors.forEach((color, i) => {
      parts.push(
        createGradientDef(
          `bar-gradient-${i}`,
          color,
          theme.shapes.gradientStartOpacity,
          theme.shapes.gradientEndOpacity
        )
      );
    });
    parts.push('</defs>');
  }

  // Background
  parts.push(
    `<rect width="100%" height="100%" fill="${theme.colors.cardBackground}"/>`
  );

  // Title
  parts.push(
    `<text x="${PADDING}" y="${PADDING + titleFontSize}" ` +
      `font-family="${escapeXML(fontFamily)}" ` +
      `font-size="${titleFontSize}" ` +
      `font-weight="${theme.typography.titleWeight}" ` +
      `fill="${theme.colors.textPrimary}">${escapeXML(title)}</text>`
  );

  // Subtitle (n=XXX)
  parts.push(
    `<text x="${PADDING}" y="${PADDING + titleFontSize + labelFontSize + 8}" ` +
      `font-family="${escapeXML(fontFamily)}" ` +
      `font-size="${labelFontSize}" ` +
      `fill="${theme.colors.textSecondary}">n=${totalN}</text>`
  );

  // Chart area group
  const chartStartY = PADDING + TITLE_AREA_HEIGHT;
  parts.push(`<g transform="translate(${PADDING}, ${chartStartY})">`);

  // Render each bar
  data.forEach((item, i) => {
    const y = i * (BAR_HEIGHT + BAR_GAP);
    const barWidth = Math.max((item.value / maxValue) * chartAreaWidth, 3); // Min 3px width
    const uniqueColorIndex = [...new Set(colors)].indexOf(colors[i]);

    // Determine fill (gradient or solid)
    const fillValue =
      theme.shapes.barStyle === 'gradient'
        ? `url(#bar-gradient-${uniqueColorIndex})`
        : colors[i];

    // Calculate display value
    const percentage = (item.value / totalN) * 100;
    let displayValue: string;
    if (theme.dataLabels.numberFormat === 'percentage') {
      displayValue = `${percentage.toFixed(theme.dataLabels.percentageDecimals)}%`;
    } else if (theme.dataLabels.numberFormat === 'abbreviated') {
      displayValue =
        item.value >= 1000
          ? `${(item.value / 1000).toFixed(1)}k`
          : String(item.value);
    } else {
      displayValue = String(item.value);
    }

    // Bar group
    parts.push(`  <g transform="translate(0, ${y})">`);

    // Label (right-aligned within label area)
    parts.push(
      `    <text x="${LABEL_WIDTH - LABEL_BAR_GAP}" y="${BAR_HEIGHT / 2 + labelFontSize / 3}" ` +
        `text-anchor="end" ` +
        `font-family="${escapeXML(fontFamily)}" ` +
        `font-size="${labelFontSize}" ` +
        `font-weight="${theme.typography.labelWeight}" ` +
        `fill="${theme.colors.textSecondary}">${escapeXML(item.name)}</text>`
    );

    // Bar path
    const barX = LABEL_WIDTH;
    const barPath = createBarPath(barX, 0, barWidth, BAR_HEIGHT, barRadius);

    // Add border if configured
    let barStyles = `fill="${fillValue}"`;
    if (theme.shapes.barBorderWidth > 0) {
      barStyles += ` stroke="${theme.shapes.barBorderColor}" stroke-width="${theme.shapes.barBorderWidth}"`;
    }

    parts.push(`    <path d="${barPath}" ${barStyles}/>`);

    // Value label (if enabled)
    if (theme.dataLabels.showBarValues) {
      let valueX: number;
      let valueColor: string;
      let textAnchor: string;

      if (
        theme.dataLabels.valuePosition === 'inside' &&
        barWidth > valueFontSize * 3
      ) {
        // Inside bar, right-aligned with padding
        valueX = barX + barWidth - 8;
        valueColor = theme.colors.valueLabelColor;
        textAnchor = 'end';
      } else {
        // Outside bar (or bar too narrow for inside)
        valueX = barX + barWidth + 8;
        valueColor = theme.colors.textPrimary;
        textAnchor = 'start';
      }

      parts.push(
        `    <text x="${valueX}" y="${BAR_HEIGHT / 2 + valueFontSize / 3}" ` +
          `text-anchor="${textAnchor}" ` +
          `font-family="${escapeXML(fontFamily)}" ` +
          `font-size="${valueFontSize}" ` +
          `font-weight="${theme.typography.valueWeight}" ` +
          `fill="${valueColor}">${displayValue}</text>`
      );
    }

    parts.push('  </g>');
  });

  // Close chart group and SVG
  parts.push('</g>');
  parts.push('</svg>');

  return parts.join('\n');
}

/**
 * Download SVG string as a file
 */
export function downloadSVG(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Copy SVG string to clipboard
 */
export async function copySVGToClipboard(svgString: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(svgString);
    return true;
  } catch (error) {
    console.error('Failed to copy SVG to clipboard:', error);
    return false;
  }
}
