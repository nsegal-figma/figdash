/**
 * Storytelling Module
 * Pattern detection and visual storytelling for survey data
 */

export { detectPatterns, getTopPatterns, DEFAULT_THRESHOLDS } from './patternDetection';
export { detectCrossTabPatterns, getTopCrossTabPatterns } from './crossTabPatterns';

// Re-export types for convenience
export type {
  PatternType,
  DetectedPattern,
  Annotation,
  AnnotationPosition,
  BarEmphasis,
  EmphasisStyle,
  ChartStorytellingConfig,
  CrossTabStorytellingConfig,
  StorytellingSettings,
  PatternThresholds,
  DataItem,
  CrossTabRow,
} from '../../types/storytelling';
