import type { Meta, StoryObj } from '@storybook/react';
import { BarChartV2 } from './BarChart';

const meta = {
  title: 'Charts/BarChartV2',
  component: BarChartV2,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BarChartV2>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
  { category: 'Category A', value: 45 },
  { category: 'Category B', value: 67 },
  { category: 'Category C', value: 32 },
  { category: 'Category D', value: 89 },
  { category: 'Category E', value: 54 },
];

const multiSeriesData = [
  { category: 'Q1', series1: 45, series2: 38, series3: 52 },
  { category: 'Q2', series1: 67, series2: 72, series3: 61 },
  { category: 'Q3', series1: 32, series2: 41, series3: 38 },
  { category: 'Q4', series1: 89, series2: 95, series3: 82 },
];

export const Default: Story = {
  args: {
    data: sampleData,
    xKey: 'category',
    yKeys: 'value',
    title: 'Survey Responses by Category',
    yLabel: 'Response Count',
    height: 400,
  },
};

export const WithGradient: Story = {
  args: {
    data: sampleData,
    xKey: 'category',
    yKeys: 'value',
    title: 'Gradient Bar Chart',
    gradient: true,
    height: 400,
  },
};

export const Horizontal: Story = {
  args: {
    data: sampleData,
    xKey: 'category',
    yKeys: 'value',
    title: 'Horizontal Bar Chart',
    orientation: 'horizontal',
    xLabel: 'Response Count',
    gradient: true,
    height: 400,
  },
};

export const Stacked: Story = {
  args: {
    data: multiSeriesData,
    xKey: 'category',
    yKeys: ['series1', 'series2', 'series3'],
    title: 'Stacked Bar Chart',
    stacked: true,
    showLegend: true,
    height: 400,
  },
};

export const WithAnnotations: Story = {
  args: {
    data: sampleData,
    xKey: 'category',
    yKeys: 'value',
    title: 'Bar Chart with Reference Lines',
    referenceLines: [
      { value: 50, label: 'Target', color: '#059669' },
      { value: 75, label: 'Goal', color: '#EF4444' },
    ],
    showDataLabels: true,
    height: 400,
  },
};

export const MultiSeries: Story = {
  args: {
    data: multiSeriesData,
    xKey: 'category',
    yKeys: ['series1', 'series2', 'series3'],
    title: 'Multi-Series Bar Chart',
    showLegend: true,
    gradient: true,
    height: 400,
  },
};

export const Loading: Story = {
  args: {
    data: sampleData,
    xKey: 'category',
    yKeys: 'value',
    isLoading: true,
    height: 400,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    xKey: 'category',
    yKeys: 'value',
    title: 'Empty Bar Chart',
    height: 400,
  },
};
