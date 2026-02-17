import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HorizontalBarChart } from './HorizontalBarChart';
import { VerticalBarChart } from './VerticalBarChart';
import { ThemedPieChart, DonutChart } from './ThemedPieChart';
import { LollipopChart } from './LollipopChart';
import { ChartRenderer } from './ChartRenderer';
import { DEFAULT_THEME } from '../../lib/themes/defaultTheme';
import { computeThemeStyles } from '../../lib/themes';
import { COLOR_PALETTES, generateGradientColors } from '../../lib/colorPalettes';
import type { ChartType } from '../../types/chartTypes';

// ============ Shared Theme & Styles ============

const theme = DEFAULT_THEME;
const styles = computeThemeStyles(theme);

// ============ Sample Survey Data Sets ============

const satisfactionData = [
  { name: 'Very Satisfied', value: 187 },
  { name: 'Satisfied', value: 254 },
  { name: 'Neutral', value: 112 },
  { name: 'Dissatisfied', value: 68 },
  { name: 'Very Dissatisfied', value: 29 },
];
const satisfactionTotalN = 650;

const ageGroupData = [
  { name: '18-24', value: 142 },
  { name: '25-34', value: 278 },
  { name: '35-44', value: 215 },
  { name: '45-54', value: 164 },
  { name: '55-64', value: 98 },
  { name: '65+', value: 53 },
];
const ageGroupTotalN = 950;

const featurePreferenceData = [
  { name: 'Dashboard Analytics', value: 312 },
  { name: 'Real-time Alerts', value: 276 },
  { name: 'Custom Reports', value: 241 },
  { name: 'Team Collaboration', value: 198 },
  { name: 'API Integrations', value: 167 },
  { name: 'Mobile App', value: 143 },
  { name: 'Data Export', value: 119 },
];
const featurePreferenceTotalN = 800;

const departmentData = [
  { name: 'Engineering', value: 145 },
  { name: 'Marketing', value: 98 },
  { name: 'Sales', value: 112 },
  { name: 'Support', value: 76 },
  { name: 'Design', value: 54 },
];
const departmentTotalN = 485;

const npsData = [
  { name: 'Promoters (9-10)', value: 312 },
  { name: 'Passives (7-8)', value: 198 },
  { name: 'Detractors (0-6)', value: 140 },
];
const npsTotalN = 650;

// ============ Color Helpers ============

const defaultPalette = COLOR_PALETTES[0]; // Default blue palette
const sunsetPalette = COLOR_PALETTES[2]; // Sunset (orange)
const forestPalette = COLOR_PALETTES[3]; // Forest (green)
const berryPalette = COLOR_PALETTES[4]; // Berry (pink)
const purplePalette = COLOR_PALETTES[5]; // Purple Haze

function colorsFor(data: Array<{ value: number }>, palette = defaultPalette) {
  return generateGradientColors(palette, data, 'desc');
}

// ============================================================
// HorizontalBarChart Stories
// ============================================================

const horizontalBarMeta = {
  title: 'Charts/Themed/HorizontalBarChart',
  component: HorizontalBarChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HorizontalBarChart>;

export default horizontalBarMeta;
type HorizontalBarStory = StoryObj<typeof horizontalBarMeta>;
// Looser type for render-only stories that don't use args
type RenderStory = { render: () => React.ReactElement };

export const SatisfactionRatings: HorizontalBarStory = {
  args: {
    data: satisfactionData,
    totalN: satisfactionTotalN,
    columnName: 'satisfaction',
    colors: colorsFor(satisfactionData),
    theme,
    styles,
    enableStorytelling: false,
  },
};

export const FeaturePreferences: HorizontalBarStory = {
  args: {
    data: featurePreferenceData,
    totalN: featurePreferenceTotalN,
    columnName: 'feature_preference',
    colors: colorsFor(featurePreferenceData, purplePalette),
    theme,
    styles,
    enableStorytelling: false,
  },
};

export const WithPercentageLabels: HorizontalBarStory = {
  args: {
    data: satisfactionData,
    totalN: satisfactionTotalN,
    columnName: 'satisfaction_pct',
    colors: colorsFor(satisfactionData, forestPalette),
    theme: {
      ...theme,
      dataLabels: {
        ...theme.dataLabels,
        numberFormat: 'percentage',
        percentageDecimals: 1 as const,
      },
    },
    styles: computeThemeStyles({
      ...theme,
      dataLabels: {
        ...theme.dataLabels,
        numberFormat: 'percentage',
        percentageDecimals: 1 as const,
      },
    }),
    enableStorytelling: false,
  },
};

export const WithOutsideValues: HorizontalBarStory = {
  args: {
    data: departmentData,
    totalN: departmentTotalN,
    columnName: 'department',
    colors: colorsFor(departmentData, sunsetPalette),
    theme: {
      ...theme,
      dataLabels: {
        ...theme.dataLabels,
        valuePosition: 'outside',
      },
    },
    styles: computeThemeStyles({
      ...theme,
      dataLabels: {
        ...theme.dataLabels,
        valuePosition: 'outside',
      },
    }),
    enableStorytelling: false,
  },
};

export const WithGridLines: HorizontalBarStory = {
  args: {
    data: satisfactionData,
    totalN: satisfactionTotalN,
    columnName: 'satisfaction_grid',
    colors: colorsFor(satisfactionData),
    theme: {
      ...theme,
      grid: {
        ...theme.grid,
        showVerticalGrid: true,
        gridStyle: 'dashed',
        gridOpacity: 0.4,
      },
    },
    styles: computeThemeStyles({
      ...theme,
      grid: {
        ...theme.grid,
        showVerticalGrid: true,
        gridStyle: 'dashed',
        gridOpacity: 0.4,
      },
    }),
    enableStorytelling: false,
  },
};

export const WithStorytelling: HorizontalBarStory = {
  args: {
    data: satisfactionData,
    totalN: satisfactionTotalN,
    columnName: 'satisfaction_storytelling',
    colors: colorsFor(satisfactionData),
    theme,
    styles,
    enableStorytelling: true,
  },
};

// ============================================================
// VerticalBarChart Stories
// ============================================================

// VerticalBarChart, Pie, Donut, Lollipop, and Renderer stories
// use render-only format (RenderStory) since they render different components
// than the default meta component (HorizontalBarChart).

// For CSF: only one default export is allowed per file, so VerticalBarChart
// stories are exported as named stories under the same default.
// To keep them browsable in Storybook under a separate entry, we use a
// render function wrapper approach.

export const VerticalAgeGroups: RenderStory = {
  render: () => (
    <VerticalBarChart
      data={ageGroupData}
      totalN={ageGroupTotalN}
      colors={colorsFor(ageGroupData, sunsetPalette)}
      theme={theme}
      styles={styles}
      height={350}
      columnName="age_group"
    />
  ),
};

export const VerticalDepartmentSurvey: RenderStory = {
  render: () => (
    <VerticalBarChart
      data={departmentData}
      totalN={departmentTotalN}
      colors={colorsFor(departmentData, forestPalette)}
      theme={theme}
      styles={styles}
      height={320}
      columnName="department"
    />
  ),
};

export const VerticalWithGridLines: RenderStory = {
  render: () => {
    const gridTheme = {
      ...theme,
      grid: {
        ...theme.grid,
        showHorizontalGrid: true,
        gridStyle: 'dashed' as const,
        gridOpacity: 0.4,
      },
    };
    return (
      <VerticalBarChart
        data={featurePreferenceData.slice(0, 5)}
        totalN={featurePreferenceTotalN}
        colors={colorsFor(featurePreferenceData.slice(0, 5), berryPalette)}
        theme={gridTheme}
        styles={computeThemeStyles(gridTheme)}
        height={380}
        showGrid
        columnName="features"
      />
    );
  },
};

export const VerticalTallChart: RenderStory = {
  render: () => (
    <VerticalBarChart
      data={satisfactionData}
      totalN={satisfactionTotalN}
      colors={colorsFor(satisfactionData, purplePalette)}
      theme={theme}
      styles={styles}
      height={450}
      columnName="satisfaction_tall"
    />
  ),
};

// ============================================================
// ThemedPieChart Stories
// ============================================================

export const PieSatisfactionDistribution: RenderStory = {
  render: () => (
    <ThemedPieChart
      data={satisfactionData}
      totalN={satisfactionTotalN}
      colors={colorsFor(satisfactionData, berryPalette)}
      theme={theme}
      styles={styles}
      height={400}
      showLegend
      showLabels
      columnName="satisfaction_pie"
    />
  ),
};

export const PieNPSBreakdown: RenderStory = {
  render: () => (
    <ThemedPieChart
      data={npsData}
      totalN={npsTotalN}
      colors={['#10b981', '#f59e0b', '#ef4444']}
      theme={theme}
      styles={styles}
      height={380}
      showLegend
      showLabels
      columnName="nps_pie"
    />
  ),
};

export const PieWithoutLabels: RenderStory = {
  render: () => (
    <ThemedPieChart
      data={departmentData}
      totalN={departmentTotalN}
      colors={colorsFor(departmentData, purplePalette)}
      theme={theme}
      styles={styles}
      height={350}
      showLegend
      showLabels={false}
      columnName="department_pie"
    />
  ),
};

export const PieSmallDataset: RenderStory = {
  render: () => {
    const binaryData = [
      { name: 'Yes', value: 412 },
      { name: 'No', value: 188 },
    ];
    return (
      <ThemedPieChart
        data={binaryData}
        totalN={600}
        colors={['#3b82f6', '#e5e7eb']}
        theme={theme}
        styles={styles}
        height={350}
        showLegend
        showLabels
        columnName="yes_no_pie"
      />
    );
  },
};

// ============================================================
// DonutChart Stories
// ============================================================

export const DonutWithCenterLabel: RenderStory = {
  render: () => (
    <DonutChart
      data={npsData}
      totalN={npsTotalN}
      colors={['#10b981', '#f59e0b', '#ef4444']}
      theme={theme}
      styles={styles}
      height={400}
      showLegend
      showLabels
      centerValue={`n=${npsTotalN}`}
      centerLabel="responses"
      columnName="nps_donut"
    />
  ),
};

export const DonutSatisfactionScore: RenderStory = {
  render: () => {
    // Calculate weighted satisfaction score
    const weights: Record<string, number> = {
      'Very Satisfied': 5,
      'Satisfied': 4,
      'Neutral': 3,
      'Dissatisfied': 2,
      'Very Dissatisfied': 1,
    };
    const weightedSum = satisfactionData.reduce(
      (sum, item) => sum + item.value * (weights[item.name] || 3),
      0
    );
    const avgScore = (weightedSum / satisfactionTotalN).toFixed(1);

    return (
      <DonutChart
        data={satisfactionData}
        totalN={satisfactionTotalN}
        colors={colorsFor(satisfactionData, forestPalette)}
        theme={theme}
        styles={styles}
        height={420}
        showLegend
        showLabels
        centerValue={avgScore}
        centerLabel="avg score"
        columnName="satisfaction_donut"
      />
    );
  },
};

export const DonutDepartmentBreakdown: RenderStory = {
  render: () => (
    <DonutChart
      data={departmentData}
      totalN={departmentTotalN}
      colors={colorsFor(departmentData, sunsetPalette)}
      theme={theme}
      styles={styles}
      height={400}
      showLegend
      showLabels
      centerValue={String(departmentTotalN)}
      centerLabel="employees"
      columnName="department_donut"
    />
  ),
};

export const DonutMinimal: RenderStory = {
  render: () => (
    <DonutChart
      data={npsData}
      totalN={npsTotalN}
      colors={['#6366f1', '#a5b4fc', '#e0e7ff']}
      theme={theme}
      styles={styles}
      height={350}
      showLegend={false}
      showLabels={false}
      centerValue="48%"
      centerLabel="NPS Score"
      columnName="nps_minimal"
    />
  ),
};

// ============================================================
// LollipopChart Stories
// ============================================================

export const LollipopFeatureRanking: RenderStory = {
  render: () => (
    <LollipopChart
      data={featurePreferenceData}
      totalN={featurePreferenceTotalN}
      colors={colorsFor(featurePreferenceData, purplePalette)}
      theme={theme}
      styles={styles}
      columnName="feature_lollipop"
    />
  ),
};

export const LollipopSatisfaction: RenderStory = {
  render: () => (
    <LollipopChart
      data={satisfactionData}
      totalN={satisfactionTotalN}
      colors={colorsFor(satisfactionData, forestPalette)}
      theme={theme}
      styles={styles}
      columnName="satisfaction_lollipop"
    />
  ),
};

export const LollipopWithGridAndPercentages: RenderStory = {
  render: () => {
    const lollipopTheme = {
      ...theme,
      grid: {
        ...theme.grid,
        showVerticalGrid: true,
        gridStyle: 'dotted' as const,
        gridOpacity: 0.3,
      },
      dataLabels: {
        ...theme.dataLabels,
        numberFormat: 'percentage' as const,
        percentageDecimals: 1 as const,
      },
    };
    return (
      <LollipopChart
        data={ageGroupData}
        totalN={ageGroupTotalN}
        colors={colorsFor(ageGroupData, sunsetPalette)}
        theme={lollipopTheme}
        styles={computeThemeStyles(lollipopTheme)}
        columnName="age_lollipop"
      />
    );
  },
};

export const LollipopSmallDataset: RenderStory = {
  render: () => {
    const channelData = [
      { name: 'Email', value: 340 },
      { name: 'Social Media', value: 278 },
      { name: 'Word of Mouth', value: 195 },
    ];
    return (
      <LollipopChart
        data={channelData}
        totalN={813}
        colors={colorsFor(channelData, berryPalette)}
        theme={theme}
        styles={styles}
        columnName="channel_lollipop"
      />
    );
  },
};

// ============================================================
// ChartRenderer Stories (Dynamic Chart Type Switching)
// ============================================================

export const RendererDynamicSwitching: RenderStory = {
  render: () => {
    const [chartType, setChartType] = useState<ChartType>('horizontal-bar');

    const chartTypes: { type: ChartType; label: string }[] = [
      { type: 'horizontal-bar', label: 'Horizontal Bar' },
      { type: 'vertical-bar', label: 'Vertical Bar' },
      { type: 'pie', label: 'Pie' },
      { type: 'donut', label: 'Donut' },
      { type: 'lollipop', label: 'Lollipop' },
    ];

    return (
      <div>
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {chartTypes.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
                backgroundColor: chartType === type ? '#3b82f6' : '#fff',
                color: chartType === type ? '#fff' : '#374151',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: chartType === type ? 600 : 400,
                transition: 'all 150ms ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ minHeight: 350 }}>
          <ChartRenderer
            type={chartType}
            data={satisfactionData}
            totalN={satisfactionTotalN}
            columnName="satisfaction_renderer"
            colors={colorsFor(satisfactionData)}
            theme={theme}
            styles={styles}
            height={350}
          />
        </div>
      </div>
    );
  },
};

export const RendererHorizontalBar: RenderStory = {
  render: () => (
    <ChartRenderer
      type="horizontal-bar"
      data={featurePreferenceData}
      totalN={featurePreferenceTotalN}
      columnName="feature_renderer_hbar"
      colors={colorsFor(featurePreferenceData, purplePalette)}
      theme={theme}
      styles={styles}
    />
  ),
};

export const RendererVerticalBar: RenderStory = {
  render: () => (
    <ChartRenderer
      type="vertical-bar"
      data={ageGroupData}
      totalN={ageGroupTotalN}
      columnName="age_renderer_vbar"
      colors={colorsFor(ageGroupData, sunsetPalette)}
      theme={theme}
      styles={styles}
      height={350}
    />
  ),
};

export const RendererPie: RenderStory = {
  render: () => (
    <ChartRenderer
      type="pie"
      data={departmentData}
      totalN={departmentTotalN}
      columnName="dept_renderer_pie"
      colors={colorsFor(departmentData, forestPalette)}
      theme={theme}
      styles={styles}
      height={400}
    />
  ),
};

export const RendererDonut: RenderStory = {
  render: () => (
    <ChartRenderer
      type="donut"
      data={npsData}
      totalN={npsTotalN}
      columnName="nps_renderer_donut"
      colors={['#10b981', '#f59e0b', '#ef4444']}
      theme={theme}
      styles={styles}
      height={400}
    />
  ),
};

export const RendererLollipop: RenderStory = {
  render: () => (
    <ChartRenderer
      type="lollipop"
      data={satisfactionData}
      totalN={satisfactionTotalN}
      columnName="satisfaction_renderer_lollipop"
      colors={colorsFor(satisfactionData, berryPalette)}
      theme={theme}
      styles={styles}
    />
  ),
};
