/**
 * Cross-Tab Pattern Detection
 * Detects storytelling patterns specific to cross-tabulation visualizations
 */

import type {
  DetectedPattern,
  PatternThresholds,
  CrossTabRow,
} from '../../types/storytelling';
import { DEFAULT_THRESHOLDS } from './patternDetection';

/**
 * Detect patterns in cross-tab data
 */
export function detectCrossTabPatterns(
  data: CrossTabRow[],
  rowColumn: string,
  segmentColumn: string,
  thresholds: PatternThresholds = DEFAULT_THRESHOLDS
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  if (data.length < 2) return patterns;

  // 1. Find biggest differences between groups for each segment
  patterns.push(...detectSegmentDifferences(data, rowColumn, segmentColumn, thresholds));

  // 2. Find segments where one group dramatically outperforms others
  patterns.push(...detectGroupDominance(data, rowColumn, segmentColumn));

  // 3. Find reversed patterns (where group A leads in one segment but trails in another)
  const reversals = detectPatternReversals(data, rowColumn, segmentColumn);
  if (reversals) patterns.push(reversals);

  return patterns;
}

/**
 * Find the biggest percentage differences between groups for each segment
 */
function detectSegmentDifferences(
  data: CrossTabRow[],
  _rowColumn: string,
  _segmentColumn: string,
  thresholds: PatternThresholds
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Get all segment names
  const segmentNames = data[0]?.segments.map((s) => s.name) || [];

  for (const segmentName of segmentNames) {
    // Calculate percentage for each row within this segment
    const rowPercentages = data.map((row) => {
      const segment = row.segments.find((s) => s.name === segmentName);
      const value = segment?.value || 0;
      const percentage = row.total > 0 ? (value / row.total) * 100 : 0;
      return { label: row.label, percentage, value };
    });

    // Sort by percentage to find max difference
    const sorted = [...rowPercentages].sort((a, b) => b.percentage - a.percentage);

    if (sorted.length >= 2) {
      const highest = sorted[0];
      const lowest = sorted[sorted.length - 1];
      const diff = highest.percentage - lowest.percentage;

      if (diff >= thresholds.crossTabDiffThreshold) {
        patterns.push({
          id: `crosstab-diff-${segmentName}`,
          type: 'cross_tab_diff',
          targetBars: [highest.label],
          targetSegment: segmentName,
          confidence: Math.min(diff / 50, 1),
          importance: Math.min(diff / 40, 1),
          supportingData: {
            percentage: highest.percentage,
            comparisonValue: lowest.percentage,
            percentageDiff: diff,
          },
          suggestedAnnotation: `"${segmentName}" stands out - ${highest.label} is ${diff.toFixed(0)}pp ahead of ${lowest.label}`,
        });
      }
    }
  }

  // Return only top 3 most significant differences
  return patterns.sort((a, b) => b.importance - a.importance).slice(0, 3);
}

/**
 * Detect when one group dominates a particular segment
 */
function detectGroupDominance(
  data: CrossTabRow[],
  _rowColumn: string,
  _segmentColumn: string
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  const segmentNames = data[0]?.segments.map((s) => s.name) || [];

  for (const segmentName of segmentNames) {
    // Get total across all rows for this segment
    let segmentTotal = 0;
    const rowValues: { label: string; value: number }[] = [];

    for (const row of data) {
      const segment = row.segments.find((s) => s.name === segmentName);
      const value = segment?.value || 0;
      segmentTotal += value;
      rowValues.push({ label: row.label, value });
    }

    // Check if any single row dominates this segment
    for (const rv of rowValues) {
      const shareOfSegment = segmentTotal > 0 ? (rv.value / segmentTotal) * 100 : 0;

      if (shareOfSegment >= 60 && data.length >= 3) {
        patterns.push({
          id: `crosstab-dominance-${segmentName}-${rv.label}`,
          type: 'dominance',
          targetBars: [rv.label],
          targetSegment: segmentName,
          confidence: 0.85,
          importance: shareOfSegment / 100,
          supportingData: {
            percentage: shareOfSegment,
          },
          suggestedAnnotation: `${rv.label} dominates "${segmentName}" - accounts for ${shareOfSegment.toFixed(0)}% of all responses`,
        });
      }
    }
  }

  return patterns.slice(0, 2);
}

/**
 * Detect pattern reversals (e.g., Group A leads in Segment 1 but trails in Segment 2)
 */
function detectPatternReversals(
  data: CrossTabRow[],
  _rowColumn: string,
  _segmentColumn: string
): DetectedPattern | null {
  if (data.length !== 2) return null; // Only works well with exactly 2 rows

  const segmentNames = data[0]?.segments.map((s) => s.name) || [];
  if (segmentNames.length < 2) return null;

  const row1 = data[0];
  const row2 = data[1];

  // Find segments where leadership flips
  for (let i = 0; i < segmentNames.length; i++) {
    for (let j = i + 1; j < segmentNames.length; j++) {
      const seg1 = segmentNames[i];
      const seg2 = segmentNames[j];

      const row1Seg1Pct =
        row1.total > 0
          ? ((row1.segments.find((s) => s.name === seg1)?.value || 0) / row1.total) * 100
          : 0;
      const row2Seg1Pct =
        row2.total > 0
          ? ((row2.segments.find((s) => s.name === seg1)?.value || 0) / row2.total) * 100
          : 0;
      const row1Seg2Pct =
        row1.total > 0
          ? ((row1.segments.find((s) => s.name === seg2)?.value || 0) / row1.total) * 100
          : 0;
      const row2Seg2Pct =
        row2.total > 0
          ? ((row2.segments.find((s) => s.name === seg2)?.value || 0) / row2.total) * 100
          : 0;

      // Check for reversal: row1 leads in seg1 but trails in seg2
      if (row1Seg1Pct > row2Seg1Pct + 10 && row2Seg2Pct > row1Seg2Pct + 10) {
        return {
          id: `crosstab-reversal-${seg1}-${seg2}`,
          type: 'cross_tab_diff',
          targetBars: [row1.label, row2.label],
          targetSegment: `${seg1} vs ${seg2}`,
          confidence: 0.8,
          importance: 0.9,
          supportingData: {
            percentageDiff: Math.abs(row1Seg1Pct - row2Seg1Pct),
          },
          suggestedAnnotation: `Interesting flip: ${row1.label} prefers "${seg1}" while ${row2.label} prefers "${seg2}"`,
        };
      }
    }
  }

  return null;
}

/**
 * Get most significant cross-tab insights
 */
export function getTopCrossTabPatterns(
  patterns: DetectedPattern[],
  limit: number = 2
): DetectedPattern[] {
  return patterns
    .sort((a, b) => b.importance - a.importance)
    .slice(0, limit);
}
