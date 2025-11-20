/**
 * Color Utilities
 * Functions for generating color scales, checking accessibility,
 * and simulating color blindness
 */

import { getContrastRatio } from './colors';

/**
 * Parse hex color to RGB components
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex color: ${hex}`);

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Interpolate between two colors
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = c1.r + factor * (c2.r - c1.r);
  const g = c1.g + factor * (c2.g - c1.g);
  const b = c1.b + factor * (c2.b - c1.b);

  return rgbToHex(r, g, b);
}

/**
 * Generate sequential color scale (light to dark)
 * @param baseColor - Starting color (typically the brand color)
 * @param steps - Number of colors to generate (default: 10)
 * @returns Array of hex colors from light to dark
 */
export function generateSequentialScale(baseColor: string, steps = 10): string[] {
  const colors: string[] = [];
  const lightColor = '#FFFFFF';
  const darkColor = adjustBrightness(baseColor, -0.4);

  for (let i = 0; i < steps; i++) {
    const factor = i / (steps - 1);
    if (factor < 0.5) {
      // Interpolate from white to base color
      colors.push(interpolateColor(lightColor, baseColor, factor * 2));
    } else {
      // Interpolate from base color to dark
      colors.push(interpolateColor(baseColor, darkColor, (factor - 0.5) * 2));
    }
  }

  return colors;
}

/**
 * Generate diverging color scale (two-tone: negative to positive)
 * @param negativeColor - Color for negative values (e.g., red)
 * @param positiveColor - Color for positive values (e.g., green)
 * @param steps - Number of colors to generate (default: 9, must be odd)
 * @returns Array of hex colors from negative to neutral to positive
 */
export function generateDivergingScale(
  negativeColor: string,
  positiveColor: string,
  steps = 9
): string[] {
  if (steps % 2 === 0) {
    throw new Error('Steps must be odd number for diverging scale (needs center neutral color)');
  }

  const colors: string[] = [];
  const neutralColor = '#E5E7EB'; // Gray-200
  const midPoint = Math.floor(steps / 2);

  for (let i = 0; i < steps; i++) {
    if (i < midPoint) {
      // Negative side: interpolate from negative color to neutral
      const factor = i / midPoint;
      colors.push(interpolateColor(negativeColor, neutralColor, factor));
    } else if (i === midPoint) {
      // Center neutral
      colors.push(neutralColor);
    } else {
      // Positive side: interpolate from neutral to positive color
      const factor = (i - midPoint) / midPoint;
      colors.push(interpolateColor(neutralColor, positiveColor, factor));
    }
  }

  return colors;
}

/**
 * Generate categorical palette with maximum color distance
 * @param count - Number of distinct colors needed (2-12)
 * @returns Array of maximally distinct hex colors
 */
export function generateCategoricalPalette(count: number): string[] {
  if (count < 2 || count > 12) {
    throw new Error('Categorical palette must have 2-12 colors');
  }

  // Pre-defined palette optimized for distinctiveness and color-blind accessibility
  const basePalette = [
    '#3B82F6', // Blue
    '#059669', // Green
    '#D97706', // Orange
    '#8B5CF6', // Purple
    '#DB2777', // Pink
    '#0F766E', // Teal
    '#EA580C', // Deep Orange
    '#7C3AED', // Violet
    '#0891B2', // Cyan
    '#C026D3', // Fuchsia
    '#CA8A04', // Yellow
    '#DC2626', // Red
  ];

  return basePalette.slice(0, count);
}

/**
 * Adjust color brightness
 * @param color - Hex color
 * @param factor - Brightness adjustment (-1 to 1, negative = darker, positive = lighter)
 * @returns Adjusted hex color
 */
export function adjustBrightness(color: string, factor: number): string {
  const rgb = hexToRgb(color);

  const adjust = (value: number) => {
    if (factor > 0) {
      // Lighten: move toward 255
      return value + (255 - value) * factor;
    } else {
      // Darken: move toward 0
      return value + value * factor;
    }
  };

  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
}

/**
 * Simulate color blindness
 * @param color - Original hex color
 * @param type - Type of color blindness
 * @returns Simulated hex color as seen by color-blind person
 */
export function simulateColorBlindness(
  color: string,
  type: 'protanopia' | 'deuteranopia' | 'tritanopia'
): string {
  const rgb = hexToRgb(color);
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  // Transformation matrices for color blindness simulation
  // Based on Brettel et al. (1997) and Viénot et al. (1999)

  if (type === 'protanopia') {
    // Red-blind (lack of L-cones)
    const newR = 0.567 * r + 0.433 * g;
    const newG = 0.558 * r + 0.442 * g;
    const newB = 0.242 * g + 0.758 * b;
    r = newR;
    g = newG;
    b = newB;
  } else if (type === 'deuteranopia') {
    // Green-blind (lack of M-cones)
    const newR = 0.625 * r + 0.375 * g;
    const newG = 0.700 * r + 0.300 * g;
    const newB = 0.300 * g + 0.700 * b;
    r = newR;
    g = newG;
    b = newB;
  } else if (type === 'tritanopia') {
    // Blue-blind (lack of S-cones)
    const newR = 0.950 * r + 0.050 * g;
    const newG = 0.433 * g + 0.567 * b;
    const newB = 0.475 * g + 0.525 * b;
    r = newR;
    g = newG;
    b = newB;
  }

  return rgbToHex(r * 255, g * 255, b * 255);
}

/**
 * Check if categorical colors are distinguishable for color-blind users
 * @param colors - Array of hex colors
 * @returns Object with distinguishability assessment for each type
 */
export function checkColorBlindAccessibility(colors: string[]): {
  protanopia: boolean;
  deuteranopia: boolean;
  tritanopia: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  const checkType = (type: 'protanopia' | 'deuteranopia' | 'tritanopia'): boolean => {
    const simulated = colors.map(c => simulateColorBlindness(c, type));

    // Check if any simulated colors are too similar
    for (let i = 0; i < simulated.length; i++) {
      for (let j = i + 1; j < simulated.length; j++) {
        const distance = colorDistance(simulated[i], simulated[j]);
        if (distance < 30) { // Threshold for distinguishability
          issues.push(`Colors ${i + 1} and ${j + 1} may be indistinguishable for ${type} users`);
          return false;
        }
      }
    }
    return true;
  };

  return {
    protanopia: checkType('protanopia'),
    deuteranopia: checkType('deuteranopia'),
    tritanopia: checkType('tritanopia'),
    issues,
  };
}

/**
 * Calculate color distance (perceptual difference)
 * Uses simple Euclidean distance in RGB space
 */
function colorDistance(color1: string, color2: string): number {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;

  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Auto-adjust color to meet WCAG AA contrast requirements
 * @param foreground - Foreground color
 * @param background - Background color
 * @param target - Target contrast ratio (default: 4.5 for AA normal text)
 * @returns Adjusted foreground color meeting contrast requirements
 */
export function autoAdjustContrast(
  foreground: string,
  background: string,
  target = 4.5
): string {
  const adjusted = foreground;
  let ratio = getContrastRatio(adjusted, background);

  if (ratio >= target) {
    return adjusted; // Already meets target
  }

  // Try darkening first
  let darkened = adjusted;
  for (let i = 0; i < 20; i++) {
    darkened = adjustBrightness(darkened, -0.05);
    ratio = getContrastRatio(darkened, background);
    if (ratio >= target) {
      return darkened;
    }
  }

  // If darkening didn't work, try lightening
  let lightened = foreground;
  for (let i = 0; i < 20; i++) {
    lightened = adjustBrightness(lightened, 0.05);
    ratio = getContrastRatio(lightened, background);
    if (ratio >= target) {
      return lightened;
    }
  }

  // Fallback: return darkest or lightest depending on background
  const bgLuminance = hexToRgb(background);
  const avgBg = (bgLuminance.r + bgLuminance.g + bgLuminance.b) / 3;
  return avgBg > 128 ? '#000000' : '#FFFFFF';
}

/**
 * Generate dark mode variant of a color
 * Adjusts brightness and saturation for dark backgrounds
 * @param color - Light mode color
 * @returns Dark mode variant
 */
export function generateDarkModeVariant(color: string): string {
  // For dark mode, lighten colors to maintain contrast on dark backgrounds
  const lightened = adjustBrightness(color, 0.3);

  // Ensure it meets WCAG AA on dark gray background
  const darkBg = '#1F2937'; // gray-800
  return autoAdjustContrast(lightened, darkBg, 4.5);
}

/**
 * Generate complete dark mode palette
 * @param lightColors - Light mode color palette
 * @returns Dark mode color palette with same structure
 */
export function generateDarkModePalette(lightColors: string[]): string[] {
  return lightColors.map(generateDarkModeVariant);
}

// Re-export contrast utilities from colors.ts for convenience
export { getContrastRatio, meetsWCAG_AA } from './colors';
