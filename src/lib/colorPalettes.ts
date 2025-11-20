export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'default',
    name: 'Default',
    colors: ['#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12'],
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: ['#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46'],
  },
  {
    id: 'berry',
    name: 'Berry',
    colors: ['#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9f1239'],
  },
  {
    id: 'purple',
    name: 'Purple Haze',
    colors: ['#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'],
  },
  {
    id: 'earth',
    name: 'Earth Tones',
    colors: ['#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e'],
  },
  {
    id: 'cool',
    name: 'Cool Grays',
    colors: ['#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b'],
  },
];

export const DEFAULT_PALETTE = COLOR_PALETTES[0];

/**
 * Get a color from the palette by index (with wrapping)
 */
export function getColorFromPalette(palette: ColorPalette, index: number): string {
  return palette.colors[index % palette.colors.length];
}

/**
 * Generate a full color array for a given count using a palette
 */
export function generateColorsFromPalette(palette: ColorPalette, count: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(getColorFromPalette(palette, i));
  }
  return colors;
}

/**
 * Generate gradient colors for data items based on their values
 * Colors go from lightest (lowest value) to darkest (highest value)
 * Regardless of sort order, highest values ALWAYS get darkest colors
 */
export function generateGradientColors(
  palette: ColorPalette,
  dataItems: Array<{ value: number }>,
  _sortOrder: 'asc' | 'desc'
): string[] {
  const colors = palette.colors;

  // Find min and max values to normalize
  const values = dataItems.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;

  // Map each value to a color based on its magnitude (not position)
  return dataItems.map((item) => {
    if (range === 0) {
      // All values are the same, use middle color
      return colors[Math.floor(colors.length / 2)];
    }

    // Normalize value to 0-1 range
    const normalized = (item.value - minValue) / range;

    // Map to color index: 0 (lowest) = lightest, 1 (highest) = darkest
    const colorIndex = Math.floor(normalized * (colors.length - 1));

    return colors[colorIndex];
  });
}
