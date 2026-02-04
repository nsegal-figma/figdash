# FigDash - Product Requirements Document

**Version:** 1.0
**Last Updated:** November 21, 2025
**Status:** Current Implementation Documentation

---

## Executive Summary

**FigDash** is a purpose-built survey analytics platform that transforms raw CSV survey data into comprehensive, interactive dashboards with AI-powered insights. The platform enables users to upload survey responses, clean data intelligently, visualize results with customizable charts, and extract actionable insights—all within an intuitive, web-based interface. FigDash is optimized for integration with Figma Slides and professional design workflows.

---

## 1. CORE PRODUCT OVERVIEW

### 1.1 What is FigDash?

FigDash is a dynamic survey analytics platform designed to democratize data analysis. It transforms survey datasets into professional, interactive visualizations without requiring technical expertise or database setup. The platform combines intelligent data processing, statistical analysis, and AI-powered insights into a seamless user experience.

**Key Philosophy:** Clean, simple, focused on survey data visualization—no unnecessary complexity.

### 1.2 Core Value Proposition

- **Instant Dashboards**: Upload CSV → automatic visualization of all survey questions
- **Smart Cleaning**: Detects and cleans structural issues, duplicates, speeders, and quality problems
- **AI-Powered Insights**: Automatic discovery of patterns, correlations, and anomalies in data
- **Design-Friendly Exports**: Copy charts directly to clipboard, export as PNG/PDF, Figma-optimized
- **No Coding Required**: Intuitive UI designed for product managers, researchers, designers
- **Real-Time Analysis**: OpenAI GPT-4 integration for text analysis and executive summaries

---

## 2. DATA TYPES & SURVEY SUPPORT

### 2.1 Supported Data Types

FigDash automatically detects and handles four column types:

1. **Categorical Data** - Multiple choice, yes/no, scales
   - Displayed as horizontal bar charts
   - Supports filtering and cross-tabulation
   - Examples: "Product Satisfaction", "Role Type", "Experience Level"

2. **Numeric Data** - Integers, decimals, scores
   - Correlation analysis with other numeric columns
   - Outlier detection and anomaly analysis
   - Examples: "NPS Score", "Pricing ($)", "Years at Company"

3. **Text Data** - Open-ended responses
   - AI-summarized on the Insights page
   - Sentiment analysis (positive/negative/neutral)
   - Representative quote extraction
   - Key theme identification

4. **Date Data** - Timestamps, dates (auto-detected for time-series analysis)

### 2.2 CSV Format Requirements

- **Encoding**: UTF-8 recommended
- **Headers**: First row should contain column names
- **Max Size**: 10MB
- **Flexibility**: FigDash can handle:
  - Multiple header rows (with cleaning)
  - Metadata columns (automatically removed)
  - Structural inconsistencies
  - Surveys from common platforms (Qualtrics, SurveyMonkey, Google Forms)

### 2.3 Data Volume Support

- **Tested**: 100-1000+ responses
- **Recommended**: 30+ responses per question for reliable statistics
- **Performance**: Handles real-time calculations for up to 5000+ rows

---

## 3. USER JOURNEY & WORKFLOWS

### 3.1 The Complete User Journey

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Upload    │ --> │   Cleaning   │ --> │  Dashboard  │ --> │  Insights    │
│    Page     │     │    Steps     │     │   Display   │     │   & Export   │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
```

### 3.2 Step 1: Upload & File Selection

**URL**: `/`

**What Users Do:**
1. Land on the welcome page with hero messaging
2. Drag-and-drop or click to select CSV file
3. Receive immediate feedback on file size and format validity
4. See file info card with name, size, and remove option

**Behind the Scenes:**
- PapaParse processes raw CSV into memory
- System detects data issues:
  - Multiple header rows
  - Metadata columns (detected by pattern matching)
  - Structural problems
- Progress indicator shows which step user is on (via Stepper component)

**Key Messaging:**
"Upload your survey data in CSV format to generate comprehensive analytics and insights."

---

### 3.3 Step 2: Data Cleaning (Three-Step Process)

#### Cleaning Step 1: Structural Cleaning

**When Triggered**: Only if structural issues detected (multiple headers or metadata columns)

**Progress Indicator**: Shows "Step 1 of 3: Structural Cleaning"

**What Users See:**
- Visual comparison of "Before" vs "After"
- Header row selector dropdown
- 24+ metadata columns detected
- Quick actions: "Remove All" or "Keep All" metadata
- Individual column toggles in Advanced Options
- Row selection checkboxes

**Metadata Columns Detected:**
- Survey platform columns: Start Date, End Date, IP Address, Status, Progress
- Response IDs: Response ID, Response Type, Recipient
- Location data: Location Latitude, Location Longitude
- Technical: Duration, Finished, Recorded Date
- Platform-specific: nx, red_completed, q_terminateflag, screened

**User Controls:**
- Select which row contains column headers
- Toggle individual rows to skip
- Remove all/keep all metadata columns
- Preview cleaned data
- Back/Skip/Clean buttons

#### Cleaning Step 2: Quality Cleaning - Mode Selection

**When Triggered**: After structural cleaning (or immediately if no structural issues)

**Progress Indicator**: Shows "Step 2 of 3: Quality Cleaning"

**Two Cleaning Modes Offered:**

**Auto Clean Mode:**
Fully automated detection and fixing of quality issues:
- Duplicate responses (>95% similarity)
- Speeders (responses completed <30% of median time)
- Straight-liners (repeated same answer across Likert scales)
- Outliers (statistical anomalies using IQR or z-score)
- Missing data handling (multiple strategies)
- Text cleanup (whitespace, URLs, gibberish detection)

**Manual Review Mode:**
Granular control over cleaning thresholds:
- Enable/disable each issue type
- Adjust sensitivity thresholds
- Choose missing data strategies (remove, impute mean/median/mode, leave)
- Configure text cleaning rules
- AI Recommendations button (OpenAI suggests optimal thresholds)
- Template system (save/load cleaning configurations)

**Additional Features:**
- Recent templates quick access
- "Skip" option to bypass quality cleaning
- Back button to return to structural cleaning

#### Cleaning Step 3: Review & Continue

**When Triggered**: After quality cleaning completes (or skipped)

**Progress Indicator**: Shows "Step 3 of 3: Review"

**What Users See:**
- Cleaning Report with statistics:
  - Original rows vs Final rows
  - Rows removed count
  - Values imputed count
- Visualizations (toggleable):
  - Issues detected by type (bar chart)
  - Before/after comparison
  - Missing data heatmap
  - Speeder distribution
- Data preview (first 10 rows)
- Download report button (Markdown/JSON)

**User Options:**
- Back to adjust quality cleaning
- Re-clean structural issues
- Continue to Dashboard

---

### 3.4 Step 3: Dashboard - Interactive Visualization & Analysis

**URL**: `/dashboard`

**Dashboard Layout:**

```
┌─ Header ─────────────────────────────────────────────┐
│  [Survey Name] | n=450 responses                     │
│  [Reset Filters] [Sort] [Colors] [Export PDF]       │
└──────────────────────────────────────────────────────┘

┌─ Key Findings Card (AI-Powered) ─────────────────────┐
│  Executive Summary (2-3 paragraphs)                  │
│  Key Takeaways (3-5 bullet points)                   │
│  Surprising Findings                                 │
│  Recommendations                                     │
│  Statistical Insights (expandable)                   │
└──────────────────────────────────────────────────────┘

┌─ Cross-Tab Builder ──────────────────────────────────┐
│  [+ Create Custom Cross-Tab]                         │
│  Suggested Cross-Tabs (based on Cramér's V)         │
│  ┌─ Cross-Tab 1 ──────────────────────────────────┐ │
│  │ ROW VARIABLE: Question 1                       │ │
│  │ SEGMENT VARIABLE: Question 2                   │ │
│  │ [Stacked/Grouped Bar Visualization]            │ │
│  │ [Legend - one per row]                         │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘

┌─ Survey Questions (Auto-Generated) ──────────────────┐
│  For each categorical/numeric column:                │
│                                                      │
│  [Question Title (editable)]  n=425                 │
│  [Copy] [Export] [Filter]                           │
│                                                      │
│  [Horizontal Bar Chart with Gradient Colors]        │
│  [Data Table: Response | Count | %]                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Core Features:**

1. **Automatic Visualizations**
   - Horizontal bar charts for every categorical/numeric column
   - Gradient colors (lightest to darkest based on values)
   - Accessibility-compliant color schemes
   - Sorted by value (configurable)

2. **Global Controls**
   - **Sort**: High-to-Low or Low-to-High (affects all charts)
   - **Colors**: 8 curated palettes
   - **Reset Filters**: Clear all active filters
   - **Export PDF**: Download full dashboard

3. **Per-Chart Features**
   - **Editable Titles**: Click to customize question text
   - **Copy Button**: Copy chart to clipboard for Figma
   - **Export Button**: Download as PNG
   - **Filter Button**: Multi-select response values
   - **Data Table**: Response details below each chart

4. **Cross-Tab Builder**
   - **Suggested Cross-Tabs**: Based on statistical significance (Cramér's V)
   - **Custom Cross-Tabs**: Select any two variables
   - **Visualization Types**: Stacked (100% composition) or Grouped (side-by-side)
   - **Smart Ordering**: Satisfaction scales sorted correctly
   - **Empty Filtering**: Hides categories with no data

5. **Key Findings (AI-Powered)**
   - Executive summary (narrative overview)
   - Key takeaways (actionable bullets)
   - Surprising findings (counterintuitive insights)
   - Recommendations (next steps)
   - Statistical patterns (confidence scored)

---

### 3.5 Step 4: Insights Page - Text Analysis & AI Summaries

**URL**: `/insights`

**Purpose**: Deep dive into open-ended text responses with AI analysis

**Page Layout:**

```
┌─ Header ─────────────────────────────────────────────┐
│  Text Insights                                       │
│  AI-generated summaries from [Survey Name]          │
└──────────────────────────────────────────────────────┘

┌─ Overall Sentiment ──────────────────────────────────┐
│  😊 Positive | 425 responses                         │
└──────────────────────────────────────────────────────┘

┌─ Per Text Column ────────────────────────────────────┐
│  [Question Title]                                    │
│                                                      │
│  ┌─ AI Summary ──────────────────────────────────┐  │
│  │ [2-3 paragraph summary]                       │  │
│  │ Key Themes: [tag1] [tag2] [tag3]             │  │
│  │ Key Insights:                                 │  │
│  │ • [Insight 1]                                │  │
│  │ • [Insight 2]                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─ Representative Quotes ───────────────────────┐  │
│  │ "Quote representing positive sentiment..."    │  │
│  │ "Quote representing negative sentiment..."    │  │
│  │ "Quote representing substantive feedback..."  │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Features:**
- Overall sentiment aggregation
- AI summaries per text column
- Key themes extraction
- Representative quote selection
- Background generation (no waiting)

---

## 4. KEY CAPABILITIES IN DETAIL

### 4.1 CSV Upload & Parsing

**Technology**: PapaParse v5.5.3

**Capabilities**:
- UTF-8 and common encodings supported
- Robust parsing of malformed CSV
- Custom header transformation (fixes spaced acronyms: "M C P" → "MCP")
- Skips empty lines automatically
- Auto-detects data types: numeric, categorical, text, date

**Intelligent Handling**:
- Cleans column names (removes extra spaces in acronyms)
- Detects and suggests removal of metadata columns
- Identifies multiple header rows
- Validates data integrity before processing

**Size Limits**:
- Max 10MB per upload
- Tested with surveys up to 5000+ rows
- In-browser processing (no server required)

---

### 4.2 Structural Data Cleaning

**Detection Patterns**:

When users upload files, FigDash automatically detects:

1. **Multiple Header Rows**
   - Qualtrics and other platforms add extra rows
   - JSON metadata rows
   - User selects which row contains actual headers

2. **Metadata Columns** (27 patterns detected):
   ```
   Start Date, End Date, Start Time, End Time
   Status, IP Address, Progress, Duration
   Finished, Recorded Date, Response ID, Response Type
   Recipient Last Name, Recipient First Name, Recipient Email
   External Data Reference
   Location Latitude, Location Longitude, Latitude, Longitude
   Distribution Channel, User Language, Language
   nx, red_completed, red_screened, red_quota
   Q_TerminateFlag, Change, Screened, _recordId
   Row, Row Number
   ```

3. **Data Structure Issues**:
   - Rows with excessive empty cells
   - Inconsistent formatting
   - Unusual character encodings

**User Interface**:
- Visual side-by-side comparison (Before/After toggle)
- Checkbox interface in preview table
- Header row selector dropdown (prominent)
- Bulk actions: Remove All / Keep All metadata
- Individual column toggles in Advanced Options
- Real-time preview of cleaning results

**Default Behavior**:
- Auto-selects all detected metadata columns
- Suggests appropriate header row (usually row 2 for Qualtrics)
- Pre-checks problematic rows for removal

---

### 4.3 Quality Data Cleaning (Auto & Manual Modes)

#### Auto Cleaning (Recommended)

Automatically detects and handles these quality issues:

**1. Duplicate Detection**
- **Algorithm**: Row similarity comparison
- **Threshold**: 95% similarity (configurable)
- **Strategy**: Keep first, last, or most-complete response
- **Detection Method**:
  - Respondent ID comparison (if available)
  - Fuzzy matching across all fields
- **Report**: Shows duplicate groups and similarity scores

**2. Speeder Detection**
- **Algorithm**: Completion time analysis
- **Default Method**: Median-multiple (< 30% of median)
- **Alternative Methods**:
  - Absolute threshold (e.g., < 60 seconds)
  - Percentile-based (bottom 5%)
- **Detection Requirements**: Duration/time column in metadata
- **Report**: Shows completion time, threshold, and percentile

**3. Straight-Liner Detection**
- **Algorithm**: Variance analysis across Likert scales
- **Threshold**: Variance < 0.5 (very low)
- **Minimum Questions**: 5 Likert items required
- **Auto-Detection**: Looks for satisfaction, rating, agreement columns
- **Report**: Shows variance score and affected columns

**4. Outlier Detection**
- **Methods**:
  - IQR (Interquartile Range) - 1.5x multiplier
  - Z-Score - 3σ threshold
- **Actions**:
  - Flag (keep but mark)
  - Remove (delete rows)
  - Cap (winsorize to 5th/95th percentiles)
- **Detection**: Applied to numeric columns only
- **Report**: Shows outlier values and z-scores

**5. Missing Data Handling**
- **Threshold**: 50% missing = flag column
- **Strategies**:
  - Leave as-is (default)
  - Remove rows with missing values
  - Impute with mean (numeric)
  - Impute with median (numeric)
  - Impute with mode (categorical)
  - Flag but keep
- **Report**: Shows missing count and percentage per column

**6. Text Cleaning**
- **Operations**:
  - Trim whitespace
  - Remove URLs (optional)
  - Remove special characters (optional)
  - Detect gibberish (patterns)
- **Gibberish Detection**:
  - Too short (< 2 chars)
  - Repeated characters (e.g., "aaaaa")
  - Keyboard mashing (e.g., "asdfasdf")
  - No vowels in English text
  - Unusual consonant-to-vowel ratio
- **Report**: Shows text issues found and cleaned count

#### Manual Cleaning

Provides granular controls through expandable panels:

**Issue Type Panels**:
1. Duplicates - Choose keep strategy
2. Speeders - Adjust detection method and threshold
3. Straight-liners - Variance slider (strict to lenient)
4. Outliers - Method and action selectors
5. Missing Data - Strategy dropdown per issue
6. Text Issues - Checkbox options for each rule

**Advanced Features**:
- **AI Recommendations**: Click button to get OpenAI-suggested thresholds
  - Analyzes survey characteristics
  - Suggests optimal settings with reasoning
  - One-click apply or manual review
- **Template Manager**:
  - Save current settings as named template
  - Load previously saved templates
  - Export/import templates as JSON
  - Usage tracking (shows times used)
  - Recent templates quick access

**Preview**:
- "Show Preview" button to see before/after
- Cleaning summary box showing planned actions
- Back/Skip/Apply buttons

#### Cleaning Report

**Generated After Cleaning** (Auto or Manual):

**Summary Statistics**:
- Original rows / Final rows
- Rows removed / Values imputed
- Columns modified

**Issues Detected** (expandable sections):
- Duplicate groups with row numbers
- Speeders with completion times
- Straight-liners with variance scores
- Outliers with z-scores
- Missing data percentages
- Text quality issues

**Visualizations** (toggleable):
- Issues by type (horizontal bar chart)
- Before/after row count (bar chart)
- Missing data heatmap (percentage bars)
- Speeder distribution (top 10)

**Actions Applied**:
- List of all cleaning operations
- Rows affected per operation
- Execution time and mode used

**Export**:
- Download report as Markdown
- Download report as JSON
- Timestamp and metadata included

---

### 4.4 Visualization System

#### Chart Types Generated

**Horizontal Bar Charts** (primary visualization):
- Clean, professional design
- Gradient colors aligned to palette
- Sorted by value (configurable)
- Responsive sizing (full-width)
- Hover tooltips with count and percentage
- Accessibility-compliant colors (skips 2 lightest shades)

**Chart Anatomy**:
```
Label (left aligned)    [████████████████] 145 (67%)
                        ↑
                        Gradient bar with value
```

**Axis & Labels**:
- Automatic axis scaling (0%, 25%, 50%, 75%, 100%)
- Percentage calculations
- Count display on bars (if space permits)
- Question label on left (right-aligned)

**Cross-Tabulation Visualizations**:

**Stacked Bars**:
- 100% stacked showing composition
- Each segment proportional to percentage
- Colors correspond to legend
- Percentages shown on segments (if >5%)
- Axis at top shows scale

**Grouped Bars**:
- Vertical bars side-by-side
- Height represents percentage
- All segments always shown (transparent if 0)
- Percentage labels above each bar
- Consistent spacing and alignment
- Legend shows one item per row

**Visual Enhancements**:
- Satisfaction scales sorted logically (Extremely → Somewhat → Neither → Dissatisfied)
- "Other" category always last
- Empty categories hidden
- Proper bar alignment and spacing

#### Color System

**8 Curated Palettes**:
1. **Default**: Blue gradient (#93c5fd to #1e40af)
2. **Ocean**: Cyan gradient
3. **Sunset**: Orange/red gradient
4. **Forest**: Green gradient
5. **Berry**: Pink/magenta gradient
6. **Purple Haze**: Purple gradient
7. **Earth Tones**: Brown/amber gradient
8. **Cool Grays**: Gray gradient

**Color Application Rules**:
- Gradient maps to data values (not position)
- Highest value = darkest color
- Lowest value = medium color (not lightest, for accessibility)
- Skips 2 lightest shades to ensure WCAG AA compliance
- Dynamic generation based on data range

**Accessibility**:
- All colors tested for contrast ratio
- Text on dark bars is white
- Borders ensure clear separation
- Hover states enhance visibility

#### Filtering System

**Per-Chart Filtering**:
- Multi-select chip UI
- Shows all available response values
- Click to toggle inclusion/exclusion
- Real-time chart and data table update
- Visual badge shows filter count
- Affects cross-tabs if variables involved

**Global Reset**:
- Single button clears all active filters
- Restores all charts to full dataset
- Useful for starting fresh analysis

**Filter Behavior**:
- Filters are additive (AND logic)
- Applied before chart generation
- Updates n= count in chart header
- Preserved until user clears or resets

---

### 4.5 AI-Powered Features

#### Real-Time OpenAI Integration

**Model**: GPT-4o-mini
**Configuration**:
- Temperature: 0.7 (creative but consistent)
- Max tokens: 800-1000
- System prompt: Expert analyst persona
- Fallback: Statistical defaults if API fails

**Use Cases**:

**1. Text Summarization**
- **Input**: Array of text responses for a column
- **Output**:
  - 2-3 paragraph summary
  - 3-5 key themes (tagged)
  - 3-4 key insights (bullets)
- **Timing**: Pre-generated during upload (background task)
- **Fallback**: "Summary unavailable" if API fails

**2. Executive Summary Generation**
- **Input**:
  - Survey metadata (name, row count, column count)
  - Top 7 statistical insights with confidence scores
- **Output**:
  - Narrative overview (2-3 paragraphs)
  - Key takeaways (3-5 action-oriented bullets)
  - Surprising findings (2-3 counterintuitive insights)
  - Recommendations (3-4 specific actions)
- **Prompt Focus**: "Concise, actionable, insight-focused"
- **Fallback**: Uses insight descriptions as takeaways

**3. Cleaning Threshold Recommendations**
- **Input**:
  - Survey characteristics (row count, column count)
  - Duration statistics (median, range, percentiles)
  - Likert scale question count
  - Missing data patterns
- **Output**:
  - Recommended speeder threshold (with reasoning)
  - Recommended straight-liner variance (with reasoning)
  - Recommended outlier method and action (with reasoning)
  - Recommended missing data strategy (with reasoning)
  - Overall summary paragraph
- **UI**: Purple card with "Apply All" button
- **Fallback**: Conservative defaults if API fails

#### Statistical Insight Discovery

**No AI/LLM - Pure Statistics**:

**Anomaly Detection**:
- Identifies skewed distributions (>50% one category)
- Large gaps between top categories (>2x difference)
- Unusual value concentrations
- Confidence: 0.85-0.9

**Correlation Detection**:
- Pearson correlation for numeric variable pairs
- Flags strong correlations (|r| > 0.5)
- Direction: positive or negative
- Strength: weak, moderate, strong
- Confidence: Absolute value of correlation coefficient

**Segment Detection**:
- Compares numeric outcomes across categorical segments
- Flags differences >0.5 on numeric scales
- Shows percentage difference and mean values
- Identifies segments worth investigating

**Insight Ranking**:
- Score = (importance × 0.6) + (confidence × 0.4)
- Top 7 insights displayed
- Sorted by score (descending)

---

### 4.6 Data Export & Integration

#### Export Options

**1. PNG Export (Per-Chart)**
- Resolution: 2x scale (high-DPI)
- Options:
  - Chart only
  - Chart + Data Table
- Format: PNG with white background
- Filename: `{Question Title}.png`
- Technology: html2canvas

**2. PDF Export (Full Dashboard)**
- Captures entire dashboard
- Includes:
  - Header with survey name
  - Key Findings card
  - Cross-tabs
  - All survey question charts
  - All data tables
- Filename: `{Survey Name}-dashboard.pdf`
- Technology: jsPDF + html2canvas
- Page breaks handled automatically

**3. Clipboard Copy (Figma Integration)**
- Copies chart as image to clipboard
- Direct paste in Figma Slides
- Uses Clipboard API
- Visual feedback: "Copied!" confirmation
- Optimized for design workflows

**4. Cleaning Report Download**
- Markdown format (human-readable)
- JSON format (machine-readable)
- Includes all statistics and findings
- Filename: `{Survey Name}-cleaning-report.{md|json}`

---

## 5. TECHNICAL ARCHITECTURE

### 5.1 Technology Stack

**Frontend Framework**:
- **React**: 19.1.1
- **TypeScript**: Type-safe development
- **Vite**: Build tool and dev server
- **React Router**: v7.9.5 (routing)

**State Management**:
- **Zustand**: v5.0.8 (lightweight, no boilerplate)
- Single store pattern
- Persistent state with localStorage for settings

**Data Processing**:
- **PapaParse**: v5.5.3 (CSV parsing)
- **Sentiment**: v5.0.2 (text sentiment analysis)

**Visualization**:
- **Recharts**: v3.3.0 (chart library)
- **html2canvas**: v1.4.1 (DOM to image)
- **jsPDF**: v3.0.4 (PDF generation)
- Custom horizontal bar components

**UI & Styling**:
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: v0.552.0 (icon library)
- **Framer Motion**: v12.23.24 (animations)

**AI Integration**:
- **OpenAI SDK**: v6.9.1 (GPT-4 API)
- Browser-side API calls
- API key from environment variables

**Development & Quality**:
- **Vitest**: Unit testing
- **ESLint**: Code linting
- **TypeScript**: Strict mode enabled

### 5.2 Data Flow Architecture

```
User Upload CSV
    ↓
[PapaParse] → Raw Data (string[][])
    ↓
[detectDataIssues] → Structural Issues Report
    ↓
[DataCleaning Component] ← User interaction
    ↓
[applyDataCleaning] → Cleaned Raw Data
    ↓
[processSurveyFile] → SurveyData Object
    ↓
[Auto/Manual Cleaning] → Quality Cleaning
    ↓
[runAutoCleaning] → Cleaned SurveyData + Report
    ↓
[useSurveyStore.setSurveyData] → Global State
    ↓
┌─────────────────────┬──────────────────────┐
│                     │                      │
[generateAllVisualizations]  [discoverInsights]  [generateAISummaries]
│                     │                      │
Chart Data            Statistical Insights   AI Analysis
│                     │                      │
└─────────────────────┴──────────────────────┘
                      ↓
              [Dashboard & Insights]
```

### 5.3 State Management (Zustand)

**SurveyStore Structure**:
```typescript
interface SurveyStore {
  // Core Data
  surveyData: SurveyData | null;
  originalData: SurveyData | null; // Before quality cleaning
  isLoading: boolean;
  error: string | null;

  // Cleaning State
  cleaningReport: CleaningReport | null;
  cleaningSettings: CleaningSettings | null;
  cleaningMode: 'auto' | 'manual' | null;
  isCleaningInProgress: boolean;

  // Visualization Settings
  selectedPalette: ColorPalette;
  sortOrder: 'asc' | 'desc';
  filters: Map<string, string[]>; // columnName → selected values
  customTitles: Map<string, string>; // columnName → custom title

  // AI Features
  aiSummaries: Map<string, AISummaryResponse>;
  isGeneratingAI: boolean;
  insights: Insight[];
  executiveSummary: ExecutiveSummary | null;
  isGeneratingInsights: boolean;

  // Integrations
  figmaToken: string | null; // Stored in localStorage
}
```

**Key Actions**:
- `setSurveyData()` - Update main dataset
- `setOriginalData()` - Store pre-cleaning version
- `revertToOriginal()` - Undo cleaning
- `setCleaningReport()` - Store cleaning results
- `setFilter()` - Apply per-chart filter
- `clearAllFilters()` - Reset all filters
- `setCustomTitle()` - Save edited chart title
- `clearSurvey()` - Reset all state (new upload)

### 5.4 Key File Structure

```
src/
├── components/           # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── DataCleaning.tsx        # Structural cleaning UI
│   ├── CleaningModeSelector.tsx # Auto vs Manual choice
│   ├── ManualCleaningPanel.tsx  # Manual controls
│   ├── CleaningReportDisplay.tsx # Results view
│   ├── CleaningStepper.tsx      # 3-step progress
│   ├── CleaningReportCharts.tsx # Visualizations in report
│   ├── TemplateManager.tsx      # Save/load settings
│   ├── FileInfo.tsx             # Minimal file display
│   ├── CrossTabBuilder.tsx      # Relationship explorer
│   ├── KeyFindings.tsx          # AI insights display
│   └── ...
│
├── pages/
│   ├── Upload.tsx         # Upload + 3-step cleaning
│   ├── Dashboard.tsx      # Main visualization
│   └── Insights.tsx       # Text analysis
│
├── stores/
│   └── useSurveyStore.ts  # Zustand global state
│
├── lib/
│   ├── ai/
│   │   ├── openai.ts
│   │   ├── insightDiscovery.ts
│   │   ├── executiveSummary.ts
│   │   └── cleaningRecommendations.ts
│   ├── analytics/
│   │   ├── advanced.ts
│   │   ├── crossTabSuggestions.ts
│   │   └── statistics.ts
│   └── colorPalettes.ts
│
├── utils/
│   ├── csvParser.ts              # CSV processing
│   ├── dataCleaningOperations.ts # Detection algorithms
│   ├── autoCleaningEngine.ts     # Orchestration
│   ├── reportGenerator.ts        # Report creation
│   └── cleaningTemplates.ts      # Template management
│
├── hooks/
│   ├── useChartImageExport.ts
│   ├── usePDFExport.ts
│   └── useClipboardCopy.ts
│
├── types/
│   ├── survey.ts    # SurveyData, Column, etc.
│   └── cleaning.ts  # Cleaning types & config
│
└── App.tsx (React Router)
```

---

## 6. USER INTERFACE & UX PATTERNS

### 6.1 Design Principles

1. **Minimal Color Usage**
   - Black/white/gray primary palette
   - Color only for data visualization
   - No colored UI elements (buttons, borders)
   - Clean, professional aesthetic

2. **Progressive Disclosure**
   - Essential controls visible
   - Advanced options behind toggles
   - Expandable sections for detail
   - Clear visual hierarchy

3. **Contextual Help**
   - Tooltips on hover
   - Info icons with explanations
   - Inline guidance text
   - Example values shown

4. **Consistent Navigation**
   - Back buttons on all steps
   - Forward buttons with arrow icons
   - Progress indicator (stepper)
   - Breadcrumb-style flow

5. **Responsive Feedback**
   - Loading spinners for async operations
   - Success confirmations (checkmarks)
   - Error messages (clear, actionable)
   - Real-time preview updates

### 6.2 Component Patterns

**Card-Based Layout**:
- All major sections in Card components
- Consistent padding (24px)
- Border and shadow for depth
- White background with gray borders

**Button Variants**:
- **Primary**: Black background, white text (main actions)
- **Secondary**: White background, gray border (alternative actions)
- **Ghost**: No background, gray text (tertiary actions)
- **Danger**: Red background (destructive actions - not currently used)

**Form Controls**:
- Dropdowns: Gray border, focus ring on interaction
- Checkboxes: Standard with gray border
- Sliders: For continuous thresholds
- Toggle switches: For enable/disable

**Data Tables**:
- Alternating row colors (subtle)
- Hover highlights
- Sortable columns (where applicable)
- Responsive overflow (horizontal scroll)

**Modals & Overlays**:
- Template Manager: Full-screen overlay
- Confirmation dialogs: Centered modal
- Tooltips: Positioned near trigger element
- Dark background overlay (50% opacity)

---

## 7. KEY WORKFLOWS IN DETAIL

### 7.1 Complete Cleaning Workflow Example

**Scenario**: User uploads a 500-row Qualtrics survey with quality issues

**Step-by-Step**:

1. **Upload** (5 seconds)
   - User drops CSV file
   - File validated (824KB, under 10MB limit)
   - PapaParse processes 500 rows × 150 columns
   - Detection finds:
     - 4 header rows (should skip rows 1, 3, 4, 5; keep row 2)
     - 24 metadata columns detected

2. **Structural Cleaning** (30 seconds)
   - Stepper shows "Step 1 of 3"
   - FileInfo displays: "agents_mcp_data.csv, 824KB"
   - DataCleaning UI renders:
     - "24 metadata columns detected"
     - Header row dropdown set to "Row 2"
     - Checkboxes for rows 1, 3, 4, 5 (auto-checked)
     - Preview shows before (6 rows) vs after (clean headers + data)
   - User clicks "Remove All" metadata
   - User verifies in preview
   - User clicks "Clean" button
   - Processing: 2 seconds
   - Result: 500 rows × 126 columns (24 removed)

3. **Quality Cleaning Mode Selection** (10 seconds)
   - Stepper shows "Step 2 of 3"
   - CleaningModeSelector renders
   - Options: Auto Clean vs Manual Review
   - User clicks "Auto Clean"

4. **Auto Cleaning Execution** (8 seconds)
   - Detection algorithms run:
     - Duplicates: 3 duplicate groups found (6 rows)
     - Speeders: 12 responses under 45s threshold
     - Straight-liners: 5 responses with variance < 0.5
     - Outliers: 8 values flagged
     - Missing data: 2 columns >50% missing
     - Text issues: 15 responses with gibberish
   - Actions applied:
     - Removed 23 rows (duplicates + speeders + straight-liners)
     - Flagged 8 outliers (not removed)
     - Left missing data as-is
     - Cleaned 15 text values
   - Result: 477 rows × 126 columns
   - Cleaning report generated

5. **Review** (20 seconds)
   - Stepper shows "Step 3 of 3"
   - CleaningReportDisplay renders:
     - Stats: 500 → 477 rows (23 removed)
     - Charts show issue distribution
     - Expandable sections for details
   - Data preview shows first 10 cleaned rows
   - User reviews report
   - User clicks "Continue to Dashboard"

6. **Dashboard Renders** (3 seconds)
   - Background AI tasks start:
     - Generating summaries for 8 text columns
     - Discovering statistical insights
     - Creating executive summary
   - Charts render immediately (126 questions)
   - Key Findings shows "Analyzing..." spinner
   - User can explore charts while AI processes

7. **AI Completes** (45 seconds total)
   - Text summaries finish (8 columns × 5s each)
   - Statistical insights discovered (7 patterns)
   - Executive summary generated
   - Key Findings card updates with full content
   - User sees insights and recommendations

**Total Time**: ~2 minutes from upload to insights

---

### 7.2 Export Workflow Examples

#### Example 1: Create Figma Slide Deck

**User Goal**: Present survey findings in Figma Slides

**Workflow**:
1. User navigates to Dashboard
2. Customizes chart titles (clicks to edit)
3. Applies filters to focus on key segments
4. Selects color palette (e.g., "Ocean" for professional look)
5. For each chart to include:
   - Clicks [Copy] button
   - Button shows "Copied!" confirmation
   - Switches to Figma
   - Pastes chart (Cmd+V)
   - Chart appears as high-res image
   - Repeats for 8-10 key charts
6. Arranges charts in Figma Slides
7. Adds titles and annotations
8. Presentation complete

**Time**: ~10 minutes for 10 charts

#### Example 2: Export Full Report

**User Goal**: Share comprehensive findings with team

**Workflow**:
1. User navigates to Dashboard
2. Reviews all charts and insights
3. Clicks [Export PDF] button in header
4. System generates PDF:
   - Header with survey name and n=
   - Key Findings (executive summary)
   - All charts with data tables
   - Preserves custom titles and filters
5. Browser downloads PDF (5-10 seconds)
6. User emails PDF to team
7. Team reviews findings offline

**Time**: ~2 minutes

#### Example 3: Individual Chart for Report

**User Goal**: Include one chart in PowerPoint

**Workflow**:
1. User finds specific chart
2. Clicks [Export] → "Chart + Data Table"
3. PNG downloads (2 seconds)
4. User opens PowerPoint
5. Inserts image from file
6. Chart with data table now in slide

**Time**: ~30 seconds per chart

---

## 8. PRODUCT GOALS & SUCCESS METRICS

### 8.1 Primary Goals

1. **Enable Non-Technical Users to Analyze Survey Data**
   - No SQL, Python, or statistical knowledge required
   - Intuitive 3-step workflow
   - Clear error messages and guidance
   - **Target**: 80% of users complete upload to dashboard without help

2. **Reduce Time from Data to Insights**
   - Upload → Dashboard in <2 minutes
   - Pre-generated AI summaries during upload
   - Automatic cross-tab suggestions
   - **Target**: 5x faster than traditional BI tools

3. **Maintain Data Quality**
   - Intelligent detection of data issues
   - Multiple cleaning strategies (auto/manual)
   - Transparent reporting of changes
   - **Target**: 90%+ accuracy in issue detection

4. **Integrate with Design Workflows**
   - Copy-to-clipboard for Figma
   - Professional export options
   - Customizable chart titles
   - **Target**: 60% of users export to Figma

5. **Scale to Different Survey Sizes**
   - Small surveys: 10-50 responses
   - Medium surveys: 50-500 responses
   - Large surveys: 500-5000+ responses
   - **Target**: <5s dashboard load for 1000 rows

### 8.2 Success Metrics

**User Engagement**:
- Time to first visualization: <2 minutes
- Dashboard exploration depth: >5 charts viewed per session
- Export usage: >50% of users export at least one chart
- Text insights accessed: >60% of sessions with text columns
- Return usage: >40% of users upload multiple surveys

**Data Quality**:
- Issues detected: >80% of problematic datasets flagged
- False positive rate: <10% (users skip suggested cleaning)
- Manual adjustments: <25% of users need to customize cleaning
- Data loss from cleaning: <5% of rows removed on average

**AI Features**:
- AI summaries generated: 100% of text columns (with API key)
- Executive summary engagement: >70% expand to view
- AI recommendation usage: >30% of manual cleaning sessions
- Insight comprehension: Clear understanding (user feedback TBD)

**Technical Performance**:
- Dashboard load time: <3 seconds (500 rows)
- Chart interaction responsiveness: <100ms
- Export generation time: <5 seconds (PNG), <15 seconds (PDF)
- API availability: >99% (OpenAI SLA dependent)
- Browser compatibility: Chrome, Safari, Firefox, Edge

---

## 9. FEATURE CAPABILITIES MATRIX

| Feature | Description | Status | Complexity |
|---------|-------------|--------|-----------|
| CSV Upload | Drag-drop or file picker | ✅ Live | Low |
| Structural Cleaning | Remove metadata rows/columns | ✅ Live | Medium |
| Duplicate Detection | Similarity-based matching | ✅ Live | High |
| Speeder Detection | Time-based analysis | ✅ Live | Medium |
| Straight-Liner Detection | Variance analysis | ✅ Live | Medium |
| Outlier Detection | IQR & Z-score methods | ✅ Live | Medium |
| Missing Data Handling | Multiple imputation strategies | ✅ Live | Medium |
| Text Cleaning | Gibberish detection | ✅ Live | Medium |
| Auto Cleaning Mode | One-click quality fixes | ✅ Live | High |
| Manual Cleaning Mode | Granular threshold controls | ✅ Live | High |
| Cleaning Templates | Save/load configurations | ✅ Live | Medium |
| AI Threshold Recommendations | OpenAI suggests settings | ✅ Live | Medium |
| Cleaning Report | Detailed statistics + charts | ✅ Live | High |
| Horizontal Bar Charts | Auto-generated for all questions | ✅ Live | Medium |
| Gradient Color Palettes | 8 curated options | ✅ Live | Low |
| Chart Filtering | Multi-select per question | ✅ Live | Medium |
| Editable Titles | Click-to-edit chart names | ✅ Live | Low |
| Cross-Tab Builder | Relationship explorer | ✅ Live | High |
| Cross-Tab Suggestions | Cramér's V analysis | ✅ Live | Medium |
| AI Text Summaries | GPT-4 summarization | ✅ Live | Medium |
| Executive Summary | Narrative + recommendations | ✅ Live | Medium |
| Statistical Insights | Anomaly/correlation detection | ✅ Live | High |
| Sentiment Analysis | Positive/negative/neutral | ✅ Live | Low |
| PNG Export | Per-chart download | ✅ Live | Medium |
| PDF Export | Full dashboard | ✅ Live | High |
| Clipboard Copy | Figma integration | ✅ Live | Medium |
| Sort Control | Global asc/desc toggle | ✅ Live | Low |
| Reset Filters | Clear all active filters | ✅ Live | Low |

---

## 10. CONSTRAINTS & LIMITATIONS

### 10.1 Technical Constraints

- **Browser-Based Processing**: All analysis happens client-side (no server backend)
  - **Implication**: Large files (>10MB) may cause performance issues
  - **Benefit**: No data ever leaves user's machine (privacy)

- **File Size Limit**: 10MB maximum upload
  - **Reason**: Browser memory constraints
  - **Workaround**: Users can pre-filter large datasets

- **API Dependency**: OpenAI integration requires valid API key
  - **Fallback**: Statistical defaults if API unavailable
  - **Cost**: User pays for OpenAI usage (minimal)

- **No Data Persistence**: All data cleared on page refresh
  - **Design Choice**: Privacy-first approach
  - **Implication**: Users must re-upload for new sessions

- **Single User**: No collaboration features
  - **Current**: Individual analysis only
  - **Future**: Team sharing (roadmap)

### 10.2 Data Constraints

- **Column Limit**: Effectively unlimited (tested to 150+ columns)
- **Row Limit**: 5000+ rows supported (performance degrades gracefully beyond)
- **Text Analysis**: Requires >3 character responses to process
- **Sentiment Analysis**: English language optimized (other languages may be inaccurate)
- **Date Detection**: Automatic but may misclassify some formats

### 10.3 Feature Constraints

- **Cross-Tab Limit**: Meaningful with <20 unique values per variable
  - **Reason**: Too many categories = unreadable visualization

- **Palette Limit**: 8 curated palettes
  - **Extensible**: Can add more via config

- **Export Resolution**: PNG at 2x scale
  - **Suitable for**: 1080p+ displays, print at 150 DPI

- **AI Token Limits**: GPT-4o-mini has max 1000 tokens per response
  - **Implication**: Very long text may be truncated in summaries

### 10.4 Browser Compatibility

**Fully Supported**:
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

**Limited Support**:
- Mobile browsers (UI not optimized for small screens)
- IE11 (not supported - uses modern JS features)

---

## 11. ROADMAP & FUTURE ENHANCEMENTS

### 11.1 Phase 1 Enhancements (Months 1-3)

**Advanced Filtering**:
- [ ] Date range filtering
- [ ] Numeric range sliders
- [ ] AND/OR filter logic
- [ ] Filter presets (save filter combinations)

**Visualization Improvements**:
- [ ] Pie charts
- [ ] Line charts (time series)
- [ ] Scatter plots (numeric relationships)
- [ ] Heatmaps (correlation matrices)
- [ ] Custom chart builder

**Export Enhancements**:
- [ ] Export filtered data as CSV
- [ ] Custom PDF templates
- [ ] PowerPoint export
- [ ] Batch export (all charts at once)

### 11.2 Phase 2 Enhancements (Months 4-6)

**Collaboration**:
- [ ] Share dashboard via link
- [ ] Team workspaces
- [ ] Comments on charts
- [ ] Version history

**Data Management**:
- [ ] Database persistence (optional)
- [ ] Multi-file comparison
- [ ] Merge multiple surveys
- [ ] Longitudinal analysis (wave-over-wave)

**Advanced Analytics**:
- [ ] Regression analysis
- [ ] Chi-square tests
- [ ] Statistical significance indicators
- [ ] Confidence intervals
- [ ] Custom segment creation

### 11.3 Phase 3 Enhancements (Months 7-12)

**Platform Integration**:
- [ ] Direct Qualtrics API integration
- [ ] SurveyMonkey connector
- [ ] Google Forms connector
- [ ] Typeform connector

**Enterprise Features**:
- [ ] SSO authentication
- [ ] Role-based access control
- [ ] Audit logging
- [ ] White-label customization
- [ ] API for programmatic access

**Advanced AI**:
- [ ] Custom AI models (fine-tuned)
- [ ] Multilingual support
- [ ] Predictive analytics
- [ ] Automated report narratives
- [ ] Anomaly detection alerts

---

## 12. COMPETITIVE ANALYSIS

### 12.1 How FigDash Compares

| Feature | FigDash | Qualtrics | Tableau | Google Forms |
|---------|---------|-----------|---------|--------------|
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Data Cleaning** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| **AI Insights** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐ |
| **Figma Integration** | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐ |
| **Customization** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Price** | Free | $$$$ | $$$ | Free |
| **Setup Time** | <2 min | Hours | Hours | Minutes |

**Key Differentiators**:
1. **Cleaning-First Approach**: Only tool with comprehensive quality cleaning
2. **Designer-Friendly**: Clipboard copy optimized for Figma workflows
3. **Zero Setup**: No account, database, or configuration needed
4. **Privacy-First**: No data stored on servers
5. **AI-Native**: OpenAI integration throughout (not bolt-on)

---

## 13. RISK ASSESSMENT

### 13.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OpenAI API downtime | Medium | High | Graceful fallback to statistical defaults |
| Browser memory limits | Low | Medium | File size limit (10MB) + warning messages |
| CSV parsing errors | Low | High | Robust error handling + clear messages |
| Export failures | Low | Medium | Retry logic + browser compatibility checks |
| Performance degradation | Medium | Medium | Lazy loading + pagination for large datasets |

### 13.2 Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Users skip cleaning | Medium | Medium | Clear messaging on importance + preview |
| Overwhelming UI | Low | High | Progressive disclosure + tooltips |
| Incorrect insights | Low | Critical | Statistical validation + confidence scores |
| Limited customization | Medium | Low | Template system + manual controls |
| No collaboration | High | Medium | Roadmap item for Phase 2 |

### 13.3 Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OpenAI costs | High | Low | Users provide own API keys |
| Limited market | Medium | High | Expand to other use cases (roadmap) |
| Competitive pressure | Medium | Medium | Focus on unique strengths (cleaning, Figma) |

---

## 14. APPENDIX A: DEFAULT CLEANING SETTINGS

```typescript
DEFAULT_CLEANING_SETTINGS = {
  mode: 'auto',
  preserveOriginal: true,

  duplicates: {
    enabled: true,
    compareByRespondentId: true,
    similarityThreshold: 0.95,
    keepStrategy: 'most-complete',
  },

  speeders: {
    enabled: true,
    method: 'median-multiple',
    medianMultiple: 0.3, // < 30% of median
  },

  straightLiners: {
    enabled: true,
    varianceThreshold: 0.5,
    minimumQuestions: 5,
  },

  outliers: {
    enabled: true,
    method: 'iqr',
    iqrMultiple: 1.5,
    action: 'flag', // Don't remove by default
  },

  missingData: {
    enabled: true,
    strategy: 'leave', // Don't modify by default
    threshold: 50, // Only flag if >50% missing
  },

  textCleaning: {
    enabled: true,
    trimWhitespace: true,
    removeUrls: false,
    removeSpecialChars: false,
    detectGibberish: true,
    minimumLength: 2,
    maximumRepeatedChars: 3,
  },
}
```

---

## 15. APPENDIX B: GLOSSARY

| Term | Definition |
|------|-----------|
| **Speeder** | Respondent who completes survey unusually fast (potential quality issue) |
| **Straight-Liner** | Respondent who gives identical answer to many Likert scale questions (low attention) |
| **Metadata Column** | Survey platform administrative column (not actual survey data) |
| **Cramér's V** | Statistical measure of association between categorical variables (0-1 scale) |
| **IQR** | Interquartile Range; method for detecting outliers in numeric data |
| **Similarity Score** | Percentage match between two rows (used for duplicate detection) |
| **Variance** | Statistical measure of spread/diversity in responses |
| **Likert Scale** | Rating scale (e.g., "Strongly Disagree" to "Strongly Agree") |
| **Cross-Tab** | Table showing relationship between two variables (rows × columns) |
| **Gibberish** | Text that doesn't form coherent words/language |
| **Winsorize** | Statistical technique to cap outliers at percentiles |
| **Imputation** | Filling in missing values with statistical estimates |
| **Pearson Correlation** | Measure of linear relationship between numeric variables (-1 to +1) |

---

## 16. CONCLUSION

FigDash transforms survey analytics from a technical, time-consuming process into an intuitive, visual experience. By combining intelligent data cleaning, automatic visualization generation, and AI-powered insights, FigDash enables product managers, researchers, and designers to make data-driven decisions quickly.

The platform's design philosophy emphasizes simplicity without sacrificing power—users can upload a CSV and get actionable insights in minutes, while advanced users can customize cleaning rules, explore statistical relationships, and save templates for repeated workflows.

With seamless integration into design workflows (Figma clipboard integration) and professional export options, FigDash bridges the gap between raw data and presentation-ready insights.

**Key Achievements**:
- ✅ 3-step cleaning workflow (Structural → Quality → Review)
- ✅ 6 quality detection algorithms with auto/manual modes
- ✅ AI-powered insights and recommendations
- ✅ Cross-tab relationship explorer
- ✅ Template system for reusable configurations
- ✅ Comprehensive export options (PNG, PDF, Clipboard)
- ✅ Full-width, accessible design
- ✅ Privacy-first (no server storage)

---

**Document Status**: Complete and Current
**Next Review**: As new features are added
**Maintained By**: Product Team
