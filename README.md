# Survey Analytics Dashboard

A modern, beautiful survey analytics dashboard that accepts CSV uploads, performs comprehensive data analysis, and visualizes results with interactive charts. Built with React, TypeScript, and Tailwind CSS following Figma design principles.

## Features

✨ **CSV Upload** - Drag-and-drop or click to upload survey data
📊 **Comprehensive Analytics** - Descriptive and inferential statistics
💬 **Sentiment Analysis** - Automatic sentiment detection for text responses
📈 **Beautiful Visualizations** - Interactive bar, pie, line, and scatter charts
🎨 **Modern UI** - Clean design following Figma aesthetics
📱 **Responsive** - Works on desktop and tablet devices

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Routing**: React Router
- **CSV Parsing**: PapaParse
- **Sentiment Analysis**: Sentiment library

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository or navigate to the project directory:

```bash
cd survey-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### 1. Upload Your Data

- Navigate to the home page
- Drag and drop your CSV file or click to browse
- Supported file size: up to 10MB
- The app will automatically detect column types (text, number, categorical, date)

### 2. View Dashboard

- See summary statistics (total responses, questions, field types)
- Explore interactive visualizations for categorical and numeric data
- View frequency distributions and statistical measures

### 3. Analyze Insights

- Automatic sentiment analysis for text responses
- Word frequency analysis and common themes
- Response length statistics
- Positive and negative keyword extraction

## CSV Format Requirements

Your CSV file should:
- Have a header row with column names
- Use comma (`,`) as the delimiter
- Be UTF-8 encoded
- Contain at least one data row

Example:

```csv
Name,Age,Satisfaction,Feedback
John,25,5,Great experience!
Jane,30,4,Good overall
```

## Project Structure

```
survey-dashboard/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── charts/       # Chart components (Bar, Pie, Line, Scatter)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── FileUpload.tsx
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── Upload.tsx
│   │   ├── Dashboard.tsx
│   │   └── Insights.tsx
│   ├── lib/              # Utilities and libraries
│   │   └── analytics/    # Analytics engine
│   │       ├── statistics.ts
│   │       ├── advanced.ts
│   │       └── textAnalytics.ts
│   ├── stores/           # State management
│   │   └── useSurveyStore.ts
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Helper functions
│   └── App.tsx           # Main app component
├── public/               # Static assets
├── package.json
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Analytics Features

### Basic Statistics
- Count, mean, median, mode
- Standard deviation and variance
- Min, max, and range
- Quartiles and IQR

### Advanced Analytics
- Pearson and Spearman correlation
- T-tests for group comparisons
- Confidence intervals
- Chi-square tests

### Text Analytics
- Sentiment analysis (positive/negative/neutral)
- Word frequency analysis
- Common theme extraction
- Keyword identification
- Response length statistics

## Design System

The dashboard uses a clean, modern design system inspired by Figma:

**Colors:**
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)

**Typography:**
- Font: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
- Smooth antialiasing and kerning

**Components:**
- Rounded corners (8px for buttons, 12px for cards)
- Subtle shadows for elevation
- Smooth transitions and animations
- Consistent spacing scale

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- API integration with survey platforms (Qualtrics, SurveyMonkey)
- Export functionality (PDF, Excel)
- Advanced visualizations (heatmaps, sankey diagrams)
- Custom dashboard builder
- Data filtering and segmentation
- Multi-language support
- Backend for data persistence

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
