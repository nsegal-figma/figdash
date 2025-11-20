/**
 * Axis Utilities
 * Smart tick calculation and formatting helpers
 */

/**
 * Calculate optimal number of ticks based on axis length
 * @param axisLength - Length of axis in pixels
 * @param orientation - Axis orientation ('horizontal' or 'vertical')
 * @returns Recommended tick count
 */
export function calculateOptimalTickCount(
  axisLength: number,
  orientation: 'horizontal' | 'vertical'
): number {
  // Minimum spacing between ticks (pixels)
  const minSpacing = orientation === 'horizontal' ? 80 : 40;

  // Calculate max ticks that fit
  const maxTicks = Math.floor(axisLength / minSpacing);

  // Clamp between 3 and 10 ticks
  return Math.max(3, Math.min(maxTicks, 10));
}

/**
 * Generate nice tick values (round numbers)
 * @param min - Minimum data value
 * @param max - Maximum data value
 * @param count - Desired tick count
 * @returns Array of nice tick values
 */
export function generateNiceTicks(min: number, max: number, count: number): number[] {
  if (min === max) {
    return [min];
  }

  // Handle reversed min/max
  const actualMin = Math.min(min, max);
  const actualMax = Math.max(min, max);
  const range = actualMax - actualMin;
  const roughStep = range / (count - 1);

  // Find nice step (power of 10, or 2/5 * power of 10)
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;

  let niceStep: number;
  if (normalized < 1.5) {
    niceStep = magnitude;
  } else if (normalized < 3) {
    niceStep = 2 * magnitude;
  } else if (normalized < 7) {
    niceStep = 5 * magnitude;
  } else {
    niceStep = 10 * magnitude;
  }

  // Round min down and max up to nice values
  const niceMin = Math.floor(actualMin / niceStep) * niceStep;
  const niceMax = Math.ceil(actualMax / niceStep) * niceStep;

  // Generate ticks
  const ticks: number[] = [];
  for (let value = niceMin; value <= niceMax; value += niceStep) {
    ticks.push(Number(value.toFixed(10))); // Fix floating point precision
  }

  return ticks;
}

/**
 * Determine if tick labels should be rotated
 * @param labels - Array of tick labels (formatted strings)
 * @param availableWidth - Available width for axis
 * @param tickCount - Number of ticks
 * @returns Recommended rotation angle (0, 45, or 90 degrees)
 */
export function getRecommendedTickRotation(
  labels: string[],
  availableWidth: number,
  tickCount: number
): number {
  if (tickCount === 0) return 0;

  // Calculate average label width (rough estimate: 7px per character)
  const avgLabelLength = labels.reduce((sum, label) => sum + label.length, 0) / labels.length;
  const estimatedLabelWidth = avgLabelLength * 7;

  // Calculate available space per tick
  const spacePerTick = availableWidth / tickCount;

  // Decision logic
  if (estimatedLabelWidth <= spacePerTick * 0.8) {
    return 0; // Horizontal (no rotation)
  } else if (estimatedLabelWidth <= spacePerTick * 1.5) {
    return 45; // Diagonal
  } else {
    return 90; // Vertical
  }
}
