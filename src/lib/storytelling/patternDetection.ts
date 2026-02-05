/**
 * Pattern Detection Algorithms
 * Detects storytelling patterns in survey data distributions
 */

import type {
  DetectedPattern,
  PatternThresholds,
  DataItem,
} from '../../types/storytelling';

// Default thresholds
export const DEFAULT_THRESHOLDS: PatternThresholds = {
  dominancePercentage: 50,
  closeRaceMargin: 5,
  bigGapMultiplier: 2.0,
  longTailThreshold: 5,
  crossTabDiffThreshold: 20,
};

/**
 * Main pattern detection function for simple bar charts
 */
export function detectPatterns(
  data: DataItem[],
  columnName: string,
  totalN: number,
  thresholds: PatternThresholds = DEFAULT_THRESHOLDS
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  if (data.length === 0) return patterns;

  // Sort by value descending for analysis
  const sorted = [...data].sort((a, b) => b.value - a.value);

  // 1. Detect extremes (highest and lowest)
  patterns.push(...detectExtremes(sorted, columnName, totalN));

  // 2. Detect dominance (>50% threshold)
  const dominance = detectDominance(sorted, columnName, totalN, thresholds);
  if (dominance) patterns.push(dominance);

  // 3. Detect close race (top values within margin)
  const closeRace = detectCloseRace(sorted, columnName, totalN, thresholds);
  if (closeRace) patterns.push(closeRace);

  // 4. Detect long tail
  const longTail = detectLongTail(sorted, columnName, totalN, thresholds);
  if (longTail) patterns.push(longTail);

  // 5. Detect big gaps between adjacent values
  patterns.push(...detectBigGaps(sorted, columnName, totalN, thresholds));

  // 6. Detect uniform distribution
  const uniform = detectUniform(sorted, columnName, totalN);
  if (uniform) patterns.push(uniform);

  return patterns;
}

/**
 * Detect highest and lowest values
 */
function detectExtremes(
  sorted: DataItem[],
  columnName: string,
  totalN: number
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  if (sorted.length < 2) return patterns;

  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const highestPct = (highest.value / totalN) * 100;
  const lowestPct = (lowest.value / totalN) * 100;

  // Only flag if there's meaningful difference
  if (highest.value > lowest.value * 1.5 && lowest.value > 0) {
    const ratio = highest.value / lowest.value;
    patterns.push({
      id: `${columnName}-extreme-high`,
      type: 'extreme_high',
      targetBars: [highest.name],
      confidence: 0.95,
      importance: Math.min(highestPct / 50, 1), // Scale importance by percentage
      supportingData: {
        value: highest.value,
        percentage: highestPct,
      },
      suggestedAnnotation: ratio >= 2
        ? `Clear winner - ${ratio.toFixed(1)}x more than lowest option`
        : `Leading choice at ${highestPct.toFixed(0)}%`,
    });

    // Only show lowest if it's notably low (under 10%)
    if (lowestPct < 10) {
      patterns.push({
        id: `${columnName}-extreme-low`,
        type: 'extreme_low',
        targetBars: [lowest.name],
        confidence: 0.95,
        importance: 0.4, // Lower importance than high
        supportingData: {
          value: lowest.value,
          percentage: lowestPct,
        },
        suggestedAnnotation: `Rarely chosen - only ${lowestPct.toFixed(0)}% selected this`,
      });
    }
  }

  return patterns;
}

/**
 * Detect when single response dominates (>50%)
 */
function detectDominance(
  sorted: DataItem[],
  columnName: string,
  totalN: number,
  thresholds: PatternThresholds
): DetectedPattern | null {
  const top = sorted[0];
  const percentage = (top.value / totalN) * 100;

  if (percentage >= thresholds.dominancePercentage) {
    return {
      id: `${columnName}-dominance`,
      type: 'dominance',
      targetBars: [top.name],
      confidence: 0.9,
      importance: Math.min(percentage / 100, 1),
      supportingData: {
        value: top.value,
        percentage,
      },
      suggestedAnnotation: percentage >= 66
        ? `Strong majority - ${percentage.toFixed(0)}% chose this`
        : `Majority choice - over half selected this`,
    };
  }

  return null;
}

/**
 * Detect close race between top responses
 */
function detectCloseRace(
  sorted: DataItem[],
  columnName: string,
  totalN: number,
  thresholds: PatternThresholds
): DetectedPattern | null {
  if (sorted.length < 2) return null;

  const top = sorted[0];
  const second = sorted[1];
  const topPct = (top.value / totalN) * 100;
  const secondPct = (second.value / totalN) * 100;
  const diff = topPct - secondPct;

  if (diff <= thresholds.closeRaceMargin && topPct > 15) {
    return {
      id: `${columnName}-close-race`,
      type: 'close_race',
      targetBars: [top.name, second.name],
      confidence: 0.85,
      importance: 0.8,
      supportingData: {
        value: top.value,
        percentage: topPct,
        comparisonValue: second.value,
        percentageDiff: diff,
      },
      suggestedAnnotation: `Statistical tie with "${second.name}" - only ${diff.toFixed(1)}pp difference`,
    };
  }

  return null;
}

/**
 * Detect long tail distribution
 */
function detectLongTail(
  sorted: DataItem[],
  columnName: string,
  totalN: number,
  thresholds: PatternThresholds
): DetectedPattern | null {
  if (sorted.length < 4) return null;

  // Check if bottom half contains many small values
  const midpoint = Math.floor(sorted.length / 2);
  const tailItems = sorted.slice(midpoint);
  const tailTotal = tailItems.reduce((sum, item) => sum + item.value, 0);
  const tailPct = (tailTotal / totalN) * 100;

  // Long tail: bottom half has less than threshold% each on average
  const avgTailPct = tailPct / tailItems.length;

  if (avgTailPct < thresholds.longTailThreshold && tailItems.length >= 3) {
    return {
      id: `${columnName}-long-tail`,
      type: 'long_tail',
      targetBars: tailItems.map((item) => item.name),
      confidence: 0.75,
      importance: 0.5,
      supportingData: {
        percentage: tailPct,
      },
      suggestedAnnotation: `${tailItems.length} niche options combined = only ${tailPct.toFixed(0)}% of responses`,
    };
  }

  return null;
}

/**
 * Detect big gaps between adjacent values
 */
function detectBigGaps(
  sorted: DataItem[],
  columnName: string,
  _totalN: number,
  thresholds: PatternThresholds
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    // Big gap: current is at least 2x the next value
    if (next.value > 0 && current.value >= next.value * thresholds.bigGapMultiplier) {
      const gapRatio = current.value / next.value;

      patterns.push({
        id: `${columnName}-big-gap-${i}`,
        type: 'big_gap',
        targetBars: [current.name],
        confidence: Math.min(gapRatio / 3, 1),
        importance: Math.min(gapRatio / 4, 0.9),
        supportingData: {
          value: current.value,
          comparisonValue: next.value,
          gap: gapRatio,
        },
        suggestedAnnotation: `Significant drop-off - ${gapRatio.toFixed(1)}x more popular than runner-up`,
      });

      // Only report most significant gap
      break;
    }
  }

  return patterns;
}

/**
 * Detect relatively uniform distribution
 */
function detectUniform(
  sorted: DataItem[],
  columnName: string,
  totalN: number
): DetectedPattern | null {
  if (sorted.length < 3) return null;

  const percentages = sorted.map((item) => (item.value / totalN) * 100);
  const avgPct = 100 / sorted.length;

  // Check if all values are within 30% of average
  const maxDeviation = Math.max(...percentages.map((p) => Math.abs(p - avgPct)));

  if (maxDeviation < avgPct * 0.3) {
    return {
      id: `${columnName}-uniform`,
      type: 'uniform',
      targetBars: sorted.map((item) => item.name),
      confidence: 0.8,
      importance: 0.4,
      supportingData: {
        percentage: avgPct,
      },
      suggestedAnnotation: `No clear preference - responses split evenly across options`,
    };
  }

  return null;
}

/**
 * Get the most important patterns (limit for display)
 */
export function getTopPatterns(
  patterns: DetectedPattern[],
  limit: number = 3,
  confidenceThreshold: number = 0.6
): DetectedPattern[] {
  return patterns
    .filter((p) => p.confidence >= confidenceThreshold)
    .sort((a, b) => {
      // Prioritize by importance first, then confidence
      const scoreA = a.importance * 0.7 + a.confidence * 0.3;
      const scoreB = b.importance * 0.7 + b.confidence * 0.3;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}
