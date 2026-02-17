# FigDash

Dynamic survey analytics platform with AI-powered insights, advanced visualizations, and a comprehensive theming system.

## Features

### Core Capabilities
- **Dynamic Column Detection** - Automatically processes ANY CSV structure
- **AI-Powered Analysis** - Real OpenAI GPT-4 integration for text insights
- **Smart Chart Recommendations** - Analyzes data characteristics and recommends the best chart type
- **Visual Storytelling** - Automatic pattern detection with editable annotations

### Chart Types
- **Horizontal Bar** - Best for categories with long labels
- **Vertical Bar** - Classic bar chart using Recharts
- **Pie / Donut** - Part-to-whole visualizations with themed labels
- **Lollipop** - Clean ranking visualization with dots

### Theming System
- 8 curated color palettes with light-to-dark gradients
- Full theme editor with live preview
- Preset themes (Default, Minimal, Bold, etc.)
- Theme import/export for sharing
- All charts respect theme settings (fonts, colors, spacing, borders, animations)

### Visualization Tools
- Per-chart type selector with smart recommendations
- Per-chart filtering with chip UI
- Global sort control (high-to-low / low-to-high)
- Editable chart titles with persistence
- Hover tooltips showing percentages and counts
- Cross-tab builder for relationship analysis

### Export Options
- Per-chart PNG export (chart only or with table)
- SVG export for editable charts in Figma
- Clipboard copy for Figma Slides integration
- Full dashboard PDF export
- High-DPI output optimized for presentations

### AI & Analytics
- Real-time OpenAI integration for text analysis
- AI summaries pre-generated during upload
- Representative quote extraction with sentiment
- Statistical analysis (Cramer's V) for cross-tab suggestions

## Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

```bash
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your OpenAI API key to `.env`:
```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build

```bash
npm run build
```

### Tests

```bash
npm test
```

348 tests across 18 test files covering the design system, chart primitives, and chart components.

### Storybook

```bash
npm run storybook
```

Interactive component documentation for all chart types.

## Architecture

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19 |
| Language | TypeScript | 5.9 |
| Build | Vite | 7.x |
| State | Zustand | 5.x |
| Routing | React Router | 7.x |
| Charts | Recharts | 3.3 |
| Styling | Tailwind CSS | 3.4 |
| Animation | Framer Motion | 12.x |
| CSV | PapaParse | 5.5 |

### Source Structure

```
src/
  App.tsx                    # Router with lazy-loaded pages + page transitions
  pages/
    Upload.tsx               # CSV upload with drag-and-drop
    Dashboard.tsx            # Main visualization dashboard
    Insights.tsx             # AI-generated text analysis
  components/
    charts/                  # Themed chart components
      ChartRenderer.tsx      # Dynamic chart type switcher
      HorizontalBarChart.tsx # Horizontal bars with storytelling
      VerticalBarChart.tsx   # Recharts vertical bars
      ThemedPieChart.tsx     # Pie + donut charts
      LollipopChart.tsx      # Lollipop chart with dots
    charts-v2/               # Design system chart primitives
      BarChart/              # Base bar chart
      LineChart/             # Line + sparkline
      AreaChart/             # Area + stacked area
      PieChart/              # Base pie/donut
      primitives/            # Shared: axes, grid, tooltip, legend, etc.
    ChartTypeSelector.tsx    # Accessible chart type dropdown
    ThemeEditor/             # Theme editing panel
    storytelling/            # Annotation overlays
  hooks/
    useChartTheme.ts         # Theme consumption hook
    useReducedMotion.ts      # Accessibility: reduced motion
    useStorytelling.ts       # Pattern detection + annotations
    usePDFExport.ts          # Dashboard PDF export
    useSVGExport.ts          # SVG export for Figma
  lib/
    analytics/               # Data analysis engine
      advanced.ts            # Visualization generator
      chartRecommendations.ts # Smart chart type suggestions
    themes/                  # Theme system
      defaultTheme.ts        # Default theme definition
      presetThemes.ts        # Built-in theme presets
      themeUtils.ts          # CSS helpers
    designTokens/            # Design token system
    colorPalettes.ts         # 8 color palettes
    storytelling/            # Pattern detection algorithms
  stores/
    useSurveyStore.ts        # Survey data + UI state
    useThemeStore.ts         # Theme persistence
  types/
    chartTypes.ts            # Chart type registry + recommendations
    chartTheme.ts            # Theme type definitions
    storytelling.ts          # Storytelling types
```

### Key Patterns

**Chart Recommendation Engine**: Analyzes data characteristics (cardinality, ordinal patterns, distribution shape, dominant values) and recommends chart types with confidence scores.

**Theme System**: All visual properties (colors, fonts, spacing, borders, animations) are defined in a `ChartTheme` object, consumed via `useChartTheme()`, and editable at runtime.

**Code Splitting**: Pages are lazy-loaded with `React.lazy`. Vite splits vendor chunks (React, Recharts, Framer Motion, analytics) for optimal caching.

**Accessibility**: Keyboard navigation on all interactive elements, ARIA labels, focus management, `prefers-reduced-motion` support via `useReducedMotion` hook.

## Usage

1. **Upload** - Upload CSV file on the welcome page
2. **Dashboard** - View all visualizations with:
   - Chart type selector per question (with recommendations)
   - Sort control (high-to-low / low-to-high)
   - Color palette via theme editor
   - Per-chart filters
   - Editable titles (click to edit)
   - Storytelling mode for pattern annotations
   - Export charts (PNG, SVG, clipboard, PDF)
   - Create cross-tabs (suggested or custom)
3. **Insights** - View AI-generated summaries and quotes

### Demo Data

Test with `demo-data/enterprise-ai-survey-varied.csv` (100 responses, good variance for testing features).

## Repository

https://github.com/nsegal-figma/figdash

## License

MIT
