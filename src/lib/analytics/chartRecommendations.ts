/**
 * Chart Recommendation Engine
 * Analyzes data characteristics and recommends appropriate chart types
 */

import type {
  ChartType,
  ChartRecommendation,
  DataCharacteristics,
  DistributionShape,
} from '../../types/chartTypes';
import { isChartSuitableForCardinality } from '../../types/chartTypes';

// ============ Ordinal Detection Patterns ============

const ORDINAL_PATTERNS = [
  // Satisfaction scales
  ['very dissatisfied', 'dissatisfied', 'neutral', 'satisfied', 'very satisfied'],
  ['very unsatisfied', 'unsatisfied', 'neutral', 'satisfied', 'very satisfied'],
  // Agreement scales
  ['strongly disagree', 'disagree', 'neutral', 'agree', 'strongly agree'],
  // Frequency scales
  ['never', 'rarely', 'sometimes', 'often', 'always'],
  // Quality scales
  ['poor', 'fair', 'good', 'very good', 'excellent'],
  // Likelihood scales
  ['very unlikely', 'unlikely', 'neutral', 'likely', 'very likely'],
  // Importance scales
  ['not important', 'slightly important', 'moderately important', 'important', 'very important'],
];

/**
 * Check if values represent an ordinal scale
 */
function detectOrdinalScale(values: string[]): boolean {
  const lowerValues = values.map((v) => v.toLowerCase().trim());

  for (const pattern of ORDINAL_PATTERNS) {
    const matches = pattern.filter((p) =>
      lowerValues.some((v) => v.includes(p))
    );
    if (matches.length >= 3) return true;
  }

  // Check for numeric patterns like "1", "2", "3", "4", "5"
  const numericValues = values.filter((v) => /^\d+$/.test(v.trim()));
  if (numericValues.length === values.length && values.length >= 3) {
    return true;
  }

  return false;
}

/**
 * Detect distribution shape from values
 */
function detectDistributionShape(values: number[]): DistributionShape {
  if (values.length < 3) return 'uniform';

  const total = values.reduce((a, b) => a + b, 0);
  const percentages = values.map((v) => (v / total) * 100);
  const avg = 100 / values.length;

  // Check for uniform distribution (all within 30% of average)
  const maxDeviation = Math.max(...percentages.map((p) => Math.abs(p - avg)));
  if (maxDeviation < avg * 0.3) return 'uniform';

  // Check for bimodal (two peaks)
  const sorted = [...percentages].sort((a, b) => b - a);
  if (sorted.length >= 4) {
    const top2Sum = sorted[0] + sorted[1];
    const restAvg = sorted.slice(2).reduce((a, b) => a + b, 0) / (sorted.length - 2);
    if (top2Sum > 50 && sorted[0] < 40 && sorted[1] > restAvg * 2) {
      return 'bimodal';
    }
  }

  // Check for skewed (top value dominates)
  if (sorted[0] > 40) return 'skewed';

  return 'normal';
}

/**
 * Analyze data characteristics for recommendation
 */
export function analyzeDataCharacteristics(
  data: { name: string; value: number }[],
  columnType: 'categorical' | 'numeric' | 'text',
  _columnName: string
): DataCharacteristics {
  const values = data.map((d) => d.value);
  const names = data.map((d) => d.name);
  const total = values.reduce((a, b) => a + b, 0);

  // Check for dominant value (>50%)
  const maxValue = Math.max(...values);
  const hasDominantValue = total > 0 && (maxValue / total) * 100 > 50;

  // Check if it's a scale (1-5, 1-10)
  const isNumericScale =
    columnType === 'numeric' ||
    names.every((n) => /^\d+$/.test(n.trim()));
  const numericNames = names.map((n) => parseInt(n, 10)).filter((n) => !isNaN(n));
  const isScale =
    isNumericScale &&
    numericNames.length === names.length &&
    Math.max(...numericNames) <= 10;

  // Check for ordinal patterns
  const isOrdinal = detectOrdinalScale(names);

  // Detect distribution shape
  const distribution = detectDistributionShape(values);

  return {
    type: columnType,
    cardinality: data.length,
    isScale,
    isOrdinal,
    hasDominantValue,
    distribution,
    sampleSize: total,
    maxValue: Math.max(...values),
    minValue: Math.min(...values),
  };
}

/**
 * Generate chart recommendations based on data characteristics
 */
export function recommendChartTypes(
  characteristics: DataCharacteristics
): ChartRecommendation[] {
  const recommendations: ChartRecommendation[] = [];
  const { cardinality, isScale, isOrdinal, hasDominantValue } = characteristics;

  // Rule 1: Part-to-whole charts for small cardinality
  if (cardinality >= 2 && cardinality <= 5) {
    if (hasDominantValue) {
      recommendations.push({
        type: 'pie',
        category: 'part-to-whole',
        confidence: 0.9,
        reason: `Great for showing dominant category (${cardinality} items)`,
        isDefault: true,
      });
      recommendations.push({
        type: 'donut',
        category: 'part-to-whole',
        confidence: 0.85,
        reason: 'Similar to pie with center space for labels',
        isDefault: false,
      });
    } else {
      recommendations.push({
        type: 'donut',
        category: 'part-to-whole',
        confidence: 0.85,
        reason: `Clean visualization for ${cardinality} categories`,
        isDefault: false,
      });
      recommendations.push({
        type: 'pie',
        category: 'part-to-whole',
        confidence: 0.8,
        reason: 'Classic part-to-whole visualization',
        isDefault: false,
      });
    }
  }

  // Rule 2: Horizontal bar is default for medium cardinality
  if (cardinality >= 3 && cardinality <= 12) {
    const isDefaultBar = cardinality > 5 || isScale || isOrdinal;
    recommendations.push({
      type: 'horizontal-bar',
      category: 'bar',
      confidence: isDefaultBar ? 0.95 : 0.85,
      reason: cardinality > 8
        ? 'Best for comparing many categories'
        : 'Good for category comparison',
      isDefault: isDefaultBar,
    });
  }

  // Rule 3: Large cardinality - horizontal bar is best
  if (cardinality > 12) {
    recommendations.push({
      type: 'horizontal-bar',
      category: 'bar',
      confidence: 0.95,
      reason: `Handles ${cardinality} categories well`,
      isDefault: true,
    });
  }

  // Rule 4: Small cardinality vertical bar
  if (cardinality >= 2 && cardinality <= 8) {
    recommendations.push({
      type: 'vertical-bar',
      category: 'bar',
      confidence: cardinality <= 5 ? 0.8 : 0.7,
      reason: 'Classic bar chart layout',
      isDefault: false,
    });
  }

  // Rule 5: Lollipop for rankings/ordered data
  if (isOrdinal || (cardinality >= 5 && cardinality <= 12)) {
    recommendations.push({
      type: 'lollipop',
      category: 'ranking',
      confidence: isOrdinal ? 0.8 : 0.65,
      reason: isOrdinal
        ? 'Good for ordered/ranked data'
        : 'Clean alternative to bar chart',
      isDefault: false,
    });
  }

  // Rule 6: Diverging bar for ordinal/Likert scales (3-7 categories)
  if (isOrdinal && cardinality >= 3 && cardinality <= 7) {
    recommendations.push({
      type: 'diverging-bar',
      category: 'comparison',
      confidence: 0.85,
      reason: 'Best for Likert/sentiment scales — shows positive vs negative',
      isDefault: false,
    });
  }

  // Rule 7: Histogram for scale/rating data (3-10 categories)
  if (isScale && cardinality >= 3 && cardinality <= 10) {
    recommendations.push({
      type: 'histogram',
      category: 'distribution',
      confidence: 0.80,
      reason: 'Shows rating distribution clearly',
      isDefault: false,
    });
  }

  // Rule 8: Waffle for balanced small cardinality (2-5)
  if (cardinality >= 2 && cardinality <= 5 && !hasDominantValue) {
    recommendations.push({
      type: 'waffle',
      category: 'proportional',
      confidence: 0.70,
      reason: `Intuitive "out of 100" view for ${cardinality} categories`,
      isDefault: false,
    });
  }

  // Rule 9: Treemap for high cardinality (8-20)
  if (cardinality >= 8 && cardinality <= 20) {
    recommendations.push({
      type: 'treemap',
      category: 'part-to-whole',
      confidence: 0.75,
      reason: `Handles ${cardinality} categories better than pie`,
      isDefault: false,
    });
  }

  // Rule 10: Stacked bar for small-to-medium cardinality (2-6)
  if (cardinality >= 2 && cardinality <= 6) {
    recommendations.push({
      type: 'stacked-bar',
      category: 'part-to-whole',
      confidence: 0.65,
      reason: 'At-a-glance proportion view',
      isDefault: false,
    });
  }

  // Always include horizontal bar as fallback
  if (!recommendations.some((r) => r.type === 'horizontal-bar')) {
    recommendations.push({
      type: 'horizontal-bar',
      category: 'bar',
      confidence: 0.7,
      reason: 'Reliable default for any data',
      isDefault: recommendations.length === 0,
    });
  }

  // Sort by confidence and ensure one default
  recommendations.sort((a, b) => b.confidence - a.confidence);

  // Make sure exactly one is marked as default
  const hasDefault = recommendations.some((r) => r.isDefault);
  if (!hasDefault && recommendations.length > 0) {
    recommendations[0].isDefault = true;
  }

  // Filter out unsuitable charts based on cardinality
  return recommendations.filter((r) =>
    isChartSuitableForCardinality(r.type, cardinality)
  );
}

/**
 * Recommend chart types for cross-tab visualizations
 */
export function recommendCrossTabChart(
  rowCount: number,
  _segmentCount: number,
  comparisonMode: 'absolute' | 'proportion' = 'absolute'
): ChartRecommendation[] {
  const recommendations: ChartRecommendation[] = [];

  if (rowCount === 2) {
    // Two groups - grouped bar is clearest
    recommendations.push({
      type: 'grouped-bar',
      category: 'comparison',
      confidence: 0.9,
      reason: 'Best for comparing 2 groups side by side',
      isDefault: true,
    });
    recommendations.push({
      type: 'stacked-bar',
      category: 'comparison',
      confidence: 0.75,
      reason: 'Shows composition within each segment',
      isDefault: false,
    });
  } else {
    // 3+ groups - stacked is usually clearer
    recommendations.push({
      type: 'stacked-bar',
      category: 'comparison',
      confidence: 0.85,
      reason: `Better for comparing ${rowCount} groups`,
      isDefault: true,
    });
    recommendations.push({
      type: 'grouped-bar',
      category: 'comparison',
      confidence: 0.7,
      reason: 'Direct value comparison between groups',
      isDefault: false,
    });
  }

  // For proportion comparison, recommend stacked
  if (comparisonMode === 'proportion') {
    const stackedRec = recommendations.find((r) => r.type === 'stacked-bar');
    if (stackedRec) {
      stackedRec.confidence = 0.95;
      stackedRec.reason = 'Ideal for comparing proportions';
      stackedRec.isDefault = true;
      // Mark grouped as non-default
      const groupedRec = recommendations.find((r) => r.type === 'grouped-bar');
      if (groupedRec) groupedRec.isDefault = false;
    }
  }

  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get the default recommended chart type
 */
export function getDefaultChartType(
  recommendations: ChartRecommendation[]
): ChartType {
  const defaultRec = recommendations.find((r) => r.isDefault);
  return defaultRec?.type || 'horizontal-bar';
}

/**
 * Get confidence label for display
 */
export function getConfidenceLabel(confidence: number): string | null {
  if (confidence >= 0.85) return 'Recommended';
  if (confidence >= 0.7) return 'Good option';
  return null;
}
