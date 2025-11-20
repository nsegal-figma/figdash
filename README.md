# FigDash

Dynamic survey analytics platform with AI-powered insights and advanced visualizations.

## Features

### Core Capabilities
- **Dynamic Column Detection** - Automatically processes ANY CSV structure
- **AI-Powered Analysis** - Real OpenAI GPT-4 integration for text insights
- **Advanced Visualizations** - Horizontal bars, cross-tabs (stacked/grouped)
- **Smart Suggestions** - Statistical analysis suggests interesting relationships (Cramér's V)

### Visualization Tools
- 8 curated color palettes with light-to-dark gradients
- Per-chart filtering with chip UI
- Global sort control (high-to-low / low-to-high)
- Editable chart titles with persistence
- Hover tooltips showing percentages and counts
- Cross-tab builder for relationship analysis
- Improved legend layout for long labels

### Export Options
- Per-chart PNG export (chart only or with table)
- Full dashboard PDF export
- High-DPI output optimized for Figma Slides
- Custom titles reflected in exports

### AI & Analytics
- Real-time OpenAI integration for text analysis
- AI summaries pre-generated during upload
- Representative quote extraction
- Sentiment analysis with key themes
- Enhanced demo dataset with 100 varied responses

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

## Usage

1. **Upload** - Upload CSV file on the welcome page
2. **Dashboard** - View all visualizations with:
   - Sort control (high-to-low / low-to-high)
   - Color palette selector (8 options)
   - Per-chart filters
   - Editable titles (click to edit)
   - Export charts individually
   - Create cross-tabs (suggested or custom)
3. **Insights** - View AI-generated summaries and quotes

### Demo Data

Test with `demo-data/enterprise-ai-survey-varied.csv` (100 responses, good variance for testing features).

## Key Features in Detail

### Dynamic Column Detection
- Automatically detects column types (categorical, numeric, text)
- Generates appropriate visualizations for each type
- Works with ANY survey structure

### Cross-Tab Builder
- **Suggested Cross-Tabs**: Statistical analysis finds interesting relationships
- **Custom Cross-Tabs**: Select any two variables
- **Visualization Types**: Stacked bars or grouped bars
- **Filtering**: Cross-tabs respect per-chart filters

### Color Palettes
- Default, Ocean, Sunset, Forest, Berry, Purple Haze, Earth Tones, Cool Grays
- All palettes ordered light-to-dark for proper gradients
- Highest values = darkest colors

### Per-Chart Filtering
- Filter any categorical/numeric variable
- Multi-select chip UI
- Updates charts and data tables
- Global "Reset Filters" button

### AI Text Analysis
- Generates summaries in background during upload
- Extracts representative quotes (mix of positive, negative, substantive)
- Identifies key themes
- Sentiment analysis included

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** - Minimal shadcn-inspired design
- **Zustand** - State management
- **OpenAI API** - GPT-4 for text analysis
- **html2canvas** + **jsPDF** - Export capabilities
- **Framer Motion** - Smooth animations
- **PapaParse** - CSV parsing

## Repository

https://github.com/nsegal-figma/figdash

## License

MIT
