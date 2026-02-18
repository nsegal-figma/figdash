/**
 * Chart Type Definitions
 * Types for multi-chart support and recommendation system
 */

// ============ Chart Categories ============

export type ChartCategory =
  | 'bar'
  | 'part-to-whole'
  | 'ranking'
  | 'distribution'
  | 'comparison'
  | 'proportional';

// ============ Chart Types ============

export type ChartType =
  | 'horizontal-bar'
  | 'vertical-bar'
  | 'pie'
  | 'donut'
  | 'lollipop'
  | 'histogram'
  | 'grouped-bar'
  | 'stacked-bar'
  | 'diverging-bar'
  | 'waffle'
  | 'treemap';

// ============ Data Characteristics ============

export type DistributionShape = 'uniform' | 'skewed' | 'bimodal' | 'normal';

export interface DataCharacteristics {
  /** Column data type */
  type: 'categorical' | 'numeric' | 'text';
  /** Number of unique values */
  cardinality: number;
  /** Is this a Likert/rating scale (1-5, 1-10) */
  isScale: boolean;
  /** Has natural ordering (e.g., satisfaction levels) */
  isOrdinal: boolean;
  /** One value accounts for >50% of responses */
  hasDominantValue: boolean;
  /** Distribution shape */
  distribution: DistributionShape;
  /** Total sample size */
  sampleSize: number;
  /** Max value in dataset */
  maxValue: number;
  /** Min value in dataset */
  minValue: number;
}

// ============ Recommendations ============

export interface ChartRecommendation {
  /** Chart type identifier */
  type: ChartType;
  /** Category this chart belongs to */
  category: ChartCategory;
  /** Confidence score 0-1 */
  confidence: number;
  /** Human-readable reason for recommendation */
  reason: string;
  /** Is this the default/primary recommendation */
  isDefault: boolean;
}

// ============ Chart Configuration ============

export interface ChartTypeConfig {
  /** Chart type identifier */
  type: ChartType;
  /** Category this chart belongs to */
  category: ChartCategory;
  /** Display label */
  label: string;
  /** Short description */
  description: string;
  /** Icon name (from lucide-react) */
  icon: string;
  /** Minimum categories required */
  minCategories?: number;
  /** Maximum categories recommended */
  maxCategories?: number;
  /** Requires numeric data */
  requiresNumeric?: boolean;
  /** Supports theme system */
  supportsTheme: boolean;
  /** Supports storytelling annotations */
  supportsAnnotations: boolean;
}

// ============ Chart Type Registry ============

export const CHART_TYPE_CONFIGS: Record<ChartType, ChartTypeConfig> = {
  'horizontal-bar': {
    type: 'horizontal-bar',
    category: 'bar',
    label: 'Horizontal Bar',
    description: 'Best for comparing categories with long labels',
    icon: 'BarChart3',
    maxCategories: 20,
    supportsTheme: true,
    supportsAnnotations: true,
  },
  'vertical-bar': {
    type: 'vertical-bar',
    category: 'bar',
    label: 'Vertical Bar',
    description: 'Classic bar chart for category comparison',
    icon: 'BarChart2',
    maxCategories: 12,
    supportsTheme: true,
    supportsAnnotations: false,
  },
  'pie': {
    type: 'pie',
    category: 'part-to-whole',
    label: 'Pie Chart',
    description: 'Shows parts of a whole, best with 2-6 categories',
    icon: 'PieChart',
    minCategories: 2,
    maxCategories: 6,
    supportsTheme: true,
    supportsAnnotations: false,
  },
  'donut': {
    type: 'donut',
    category: 'part-to-whole',
    label: 'Donut Chart',
    description: 'Like pie chart with space for center label',
    icon: 'Circle',
    minCategories: 2,
    maxCategories: 6,
    supportsTheme: true,
    supportsAnnotations: false,
  },
  'lollipop': {
    type: 'lollipop',
    category: 'ranking',
    label: 'Lollipop',
    description: 'Emphasizes individual values, good for rankings',
    icon: 'GitCommitHorizontal',
    maxCategories: 15,
    supportsTheme: true,
    supportsAnnotations: false,
  },
  'histogram': {
    type: 'histogram',
    category: 'distribution',
    label: 'Histogram',
    description: 'Shows distribution of scale/rating data',
    icon: 'BarChart',
    minCategories: 3,
    maxCategories: 10,
    supportsTheme: true,
    supportsAnnotations: false,
  },
  'grouped-bar': {
    type: 'grouped-bar',
    category: 'comparison',
    label: 'Grouped Bar',
    description: 'Compare multiple groups side by side',
    icon: 'BarChart4',
    supportsTheme: true,
    supportsAnnotations: false,
  },
  'stacked-bar': {
    type: 'stacked-bar',
    category: 'part-to-whole',
    label: 'Stacked Bar',
    description: 'Single bar showing proportional segments',
    icon: 'Layers',
    minCategories: 2,
    maxCategories: 8,
    supportsTheme: true,
    supportsAnnotations: false,
  },
  'diverging-bar': {
    type: 'diverging-bar',
    category: 'comparison',
    label: 'Diverging Bar',
    description: 'Best for Likert scales and sentiment data',
    icon: 'ArrowLeftRight',
    minCategories: 3,
    maxCategories: 7,
    supportsTheme: true,
    supportsAnnotations: false,
  },
  'waffle': {
    type: 'waffle',
    category: 'proportional',
    label: 'Waffle',
    description: 'Intuitive grid showing proportions out of 100',
    icon: 'Grid3x3',
    minCategories: 2,
    maxCategories: 6,
    supportsTheme: true,
    supportsAnnotations: false,
  },
  'treemap': {
    type: 'treemap',
    category: 'part-to-whole',
    label: 'Treemap',
    description: 'Nested rectangles sized by value, great for many categories',
    icon: 'LayoutGrid',
    minCategories: 3,
    maxCategories: 20,
    supportsTheme: true,
    supportsAnnotations: false,
  },
};

// ============ Category Labels ============

export const CHART_CATEGORY_LABELS: Record<ChartCategory, string> = {
  'bar': 'Bar Charts',
  'part-to-whole': 'Part-to-Whole',
  'ranking': 'Ranking',
  'distribution': 'Distribution',
  'comparison': 'Comparison',
  'proportional': 'Proportional',
};

// ============ Helper Functions ============

/**
 * Get all chart types in a category
 */
export function getChartTypesByCategory(category: ChartCategory): ChartType[] {
  return (Object.keys(CHART_TYPE_CONFIGS) as ChartType[]).filter(
    (type) => CHART_TYPE_CONFIGS[type].category === category
  );
}

/**
 * Get chart config by type
 */
export function getChartConfig(type: ChartType): ChartTypeConfig {
  return CHART_TYPE_CONFIGS[type];
}

/**
 * Check if a chart type is suitable for given cardinality
 */
export function isChartSuitableForCardinality(
  type: ChartType,
  cardinality: number
): boolean {
  const config = CHART_TYPE_CONFIGS[type];
  if (config.minCategories && cardinality < config.minCategories) return false;
  if (config.maxCategories && cardinality > config.maxCategories) return false;
  return true;
}
