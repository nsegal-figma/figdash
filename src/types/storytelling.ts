/**
 * Storytelling Types
 * Type definitions for visual storytelling features
 */

// ============ Pattern Types ============

export type PatternType =
  | 'extreme_high'      // Highest value in distribution
  | 'extreme_low'       // Lowest value in distribution
  | 'dominance'         // Single value > 50% of total
  | 'close_race'        // Top values within 5% of each other
  | 'long_tail'         // Many small values after top few
  | 'big_gap'           // Significant gap between adjacent values
  | 'cross_tab_diff'    // Biggest difference between groups in cross-tab
  | 'uniform';          // Relatively even distribution

export interface PatternSupportingData {
  value?: number;
  percentage?: number;
  comparisonValue?: number;
  gap?: number;
  percentageDiff?: number;
}

export interface DetectedPattern {
  id: string;
  type: PatternType;
  /** Which bar(s) this pattern applies to (by name/label) */
  targetBars: string[];
  /** For cross-tabs: which segment column value */
  targetSegment?: string;
  /** Confidence score 0-1 */
  confidence: number;
  /** Importance/severity score 0-1 */
  importance: number;
  /** Raw data supporting the pattern */
  supportingData: PatternSupportingData;
  /** Auto-generated annotation text */
  suggestedAnnotation: string;
}

// ============ Annotation Types ============

export type AnnotationPosition = 'above' | 'right' | 'below' | 'inline';

export interface Annotation {
  id: string;
  /** Which pattern triggered this annotation (if auto-generated) */
  patternId?: string;
  /** Target bar label */
  targetBar: string;
  /** For cross-tabs: target segment */
  targetSegment?: string;
  /** Display text */
  text: string;
  /** Whether user has edited this annotation */
  isCustom: boolean;
  /** Position relative to bar */
  position: AnnotationPosition;
  /** Whether this annotation is visible */
  isVisible: boolean;
}

// ============ Visual Emphasis Types ============

export type EmphasisStyle = 'highlight' | 'glow' | 'border' | 'none';

export interface BarEmphasis {
  /** Target bar label */
  targetBar: string;
  /** For cross-tabs: target segment */
  targetSegment?: string;
  /** Type of visual emphasis */
  style: EmphasisStyle;
  /** Emphasis intensity 0-1 */
  intensity: number;
  /** Optional custom color override */
  color?: string;
}

// ============ Chart Storytelling Config ============

export interface ChartStorytellingConfig {
  /** Column name this config applies to */
  columnName: string;
  /** Detected patterns for this chart */
  patterns: DetectedPattern[];
  /** Active annotations */
  annotations: Annotation[];
  /** Visual emphasis settings */
  emphasis: BarEmphasis[];
  /** Last time patterns were analyzed */
  analyzedAt: number;
}

// ============ Cross-Tab Storytelling Config ============

export interface CrossTabStorytellingConfig {
  /** Unique cross-tab ID */
  crossTabId: string;
  /** Row column name */
  rowColumn: string;
  /** Segment column name */
  segmentColumn: string;
  /** Detected patterns */
  patterns: DetectedPattern[];
  /** Active annotations */
  annotations: Annotation[];
  /** Visual emphasis settings */
  emphasis: BarEmphasis[];
  /** Last analyzed timestamp */
  analyzedAt: number;
}

// ============ Global Storytelling Settings ============

export interface StorytellingSettings {
  /** Master toggle for storytelling mode */
  enabled: boolean;
  /** Auto-detect patterns on data load */
  autoDetect: boolean;
  /** Show annotations by default */
  showAnnotations: boolean;
  /** Show visual emphasis by default */
  showEmphasis: boolean;
  /** Minimum confidence threshold for showing patterns */
  confidenceThreshold: number;
  /** Default annotation position */
  defaultAnnotationPosition: AnnotationPosition;
  /** Default emphasis style */
  defaultEmphasisStyle: EmphasisStyle;
}

// ============ Pattern Detection Thresholds ============

export interface PatternThresholds {
  /** Percentage threshold for dominance detection (default: 50) */
  dominancePercentage: number;
  /** Percentage difference for close race detection (default: 5) */
  closeRaceMargin: number;
  /** Multiplier for big gap detection (default: 2.0 = 2x difference) */
  bigGapMultiplier: number;
  /** Percentage of total for long tail items (default: 5) */
  longTailThreshold: number;
  /** Minimum percentage difference for cross-tab differences (default: 20) */
  crossTabDiffThreshold: number;
}

// ============ Data Structures for Detection ============

export interface DataItem {
  name: string;
  value: number;
}

export interface CrossTabRow {
  label: string;
  segments: { name: string; value: number }[];
  total: number;
}
