# Chart System Migration Guide

This document explains how to work with the FigDash chart system: adding new chart types, customizing themes, and integrating the recommendation engine.

## Adding a New Chart Type

### 1. Register the Type

Add your chart type to `src/types/chartTypes.ts`:

```typescript
// Add to ChartType union
export type ChartType =
  | 'horizontal-bar'
  | 'vertical-bar'
  // ... existing types
  | 'your-new-type';  // Add here

// Add to CHART_TYPE_CONFIGS registry
'your-new-type': {
  type: 'your-new-type',
  category: 'bar',  // or 'part-to-whole', 'ranking', 'distribution', 'comparison'
  label: 'Your New Chart',
  description: 'When to use this chart',
  icon: 'BarChart3',  // lucide-react icon name
  minCategories: 2,
  maxCategories: 12,
  supportsTheme: true,
  supportsAnnotations: false,
}
```

### 2. Create the Component

Create `src/components/charts/YourNewChart.tsx`:

```typescript
import type { ChartTheme } from '../../types/chartTheme';
import type { StorytellingProps } from './ChartRenderer';

export interface YourNewChartProps {
  data: { name: string; value: number }[];
  totalN: number;
  colors: string[];
  theme: ChartTheme;       // Use for colors, layout, effects
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;  // Use for CSS values
  columnName?: string;
  storytelling?: StorytellingProps;  // Optional storytelling support
}

export function YourNewChart({ data, totalN, colors, theme, styles }: YourNewChartProps) {
  return (
    <div style={{ fontFamily: styles.fontFamily }}>
      {/* Your chart implementation */}
    </div>
  );
}
```

### 3. Register in ChartRenderer

Add a case to `src/components/charts/ChartRenderer.tsx`:

```typescript
import { YourNewChart } from './YourNewChart';

// In the switch statement:
case 'your-new-type':
  return (
    <YourNewChart
      data={data}
      totalN={totalN}
      colors={colors}
      theme={theme}
      styles={styles}
      columnName={columnName}
      storytelling={storytellingProps}
    />
  );
```

### 4. Add to Implemented Types

In `src/components/ChartTypeSelector.tsx`, add to `IMPLEMENTED_TYPES`:

```typescript
const IMPLEMENTED_TYPES: ChartType[] = [
  'horizontal-bar', 'vertical-bar', 'pie', 'donut', 'lollipop',
  'your-new-type',  // Add here
];
```

### 5. Add Recommendation Rules (Optional)

In `src/lib/analytics/chartRecommendations.ts`, add rules to `recommendChartTypes()`:

```typescript
if (/* your condition */) {
  recommendations.push({
    type: 'your-new-type',
    category: 'bar',
    confidence: 0.85,
    reason: 'Good for this data pattern',
    isDefault: false,
  });
}
```

### 6. Export from Index

Add to `src/components/charts/index.ts`.

## Theme System

### Consuming Themes

```typescript
import { useChartTheme } from '../hooks/useChartTheme';

function MyComponent() {
  const { theme, styles, colorPalette } = useChartTheme();

  return (
    <div style={{
      fontFamily: styles.fontFamily,
      fontSize: styles.labelFontSize,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: styles.containerBorderRadius,
    }}>
      {/* Content */}
    </div>
  );
}
```

### Theme Properties

| Property | Type | Description |
|----------|------|-------------|
| `theme.colors.textPrimary` | string | Primary text color |
| `theme.colors.textSecondary` | string | Secondary text color |
| `theme.colors.textMuted` | string | Muted/caption text |
| `theme.colors.background` | string | Page background |
| `theme.colors.cardBackground` | string | Card/panel background |
| `theme.colors.borderColor` | string | Border color |
| `theme.layout.barHeight` | number | Height of horizontal bars |
| `theme.layout.barGap` | number | Gap between bars |
| `theme.typography.fontFamily` | string | Font family |
| `theme.effects.animationDuration` | number | Animation duration (ms) |
| `theme.effects.hoverOpacity` | number | Hover effect opacity |

### Computed Styles

`styles` provides CSS-ready values computed from the theme:
- `styles.fontFamily` - Resolved font family string
- `styles.labelFontSize` - Label font size in rem
- `styles.axisTickFontSize` - Axis tick font size in rem
- `styles.containerBorderRadius` - Border radius as CSS value
- `styles.containerShadow` - Box shadow as CSS value

## Recommendation Engine

The recommendation engine in `src/lib/analytics/chartRecommendations.ts` analyzes:

- **Cardinality**: Number of unique values
- **Ordinal patterns**: Detects Likert scales, satisfaction scales, frequency scales
- **Distribution shape**: Uniform, skewed, bimodal, normal
- **Dominant values**: Whether one value dominates (>50%)
- **Data type**: Categorical, numeric, or text

### Usage

```typescript
import { analyzeDataCharacteristics, recommendChartTypes, getDefaultChartType } from '../lib/analytics/chartRecommendations';

const characteristics = analyzeDataCharacteristics(data, 'categorical', 'satisfaction');
const recommendations = recommendChartTypes(characteristics);
const defaultType = getDefaultChartType(recommendations);
```

## Accessibility

### Required for New Components

1. **`aria-label`** on interactive elements
2. **Keyboard navigation** (Enter/Space to activate, Escape to close, Arrow keys for lists)
3. **Focus styles** via `focus:outline-none focus:ring-2 focus:ring-offset-1`
4. **Reduced motion** support:

```typescript
import { useReducedMotion } from '../hooks/useReducedMotion';

const prefersReducedMotion = useReducedMotion();
// Use to disable or simplify animations
```

## Architecture Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Chart library | Recharts 3.3 (stay) | React 19 compatibility — Visx and Tremor don't support it |
| State management | Zustand | Lightweight, TypeScript-first, good for isolated stores |
| Theme approach | Runtime JS themes | Enables live editing, export/import, and theme switching |
| Code splitting | React.lazy + Vite manual chunks | Keeps initial load fast, caches vendor separately |
| Animation | Framer Motion | Already in project, good declarative API, reduced-motion support |
