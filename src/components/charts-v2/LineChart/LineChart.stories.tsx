import type { Meta, StoryObj } from '@storybook/react';
import { LineChartV2 } from './LineChart';

const meta = {
  title: 'Charts/LineChartV2',
  component: LineChartV2,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LineChartV2>;

export default meta;
type Story = StoryObj<typeof meta>;

const timeSeriesData = [
  { date: 'Jan', value: 45 },
  { date: 'Feb', value: 52 },
  { date: 'Mar', value: 48 },
  { date: 'Apr', value: 67 },
  { date: 'May', value: 72 },
  { date: 'Jun', value: 65 },
];

const multiLineData = [
  { date: 'Jan', actual: 45, forecast: 50, target: 55 },
  { date: 'Feb', actual: 52, forecast: 55, target: 55 },
  { date: 'Mar', actual: 48, forecast: 52, target: 55 },
  { date: 'Apr', actual: 67, forecast: 60, target: 55 },
  { date: 'May', actual: 72, forecast: 65, target: 55 },
];

export const Default: Story = {
  args: {
    data: timeSeriesData,
    xKey: 'date',
    yKeys: 'value',
    title: 'Response Trend Over Time',
    yLabel: 'Responses',
    height: 400,
  },
};

export const WithAreaFill: Story = {
  args: {
    data: timeSeriesData,
    xKey: 'date',
    yKeys: 'value',
    title: 'Area Line Chart',
    fillArea: true,
    areaOpacity: 0.3,
    height: 400,
  },
};

export const MultiLine: Story = {
  args: {
    data: multiLineData,
    xKey: 'date',
    yKeys: ['actual', 'forecast', 'target'],
    title: 'Multi-Line Comparison',
    showLegend: true,
    height: 400,
  },
};

export const Sparkline: Story = {
  args: {
    data: timeSeriesData,
    xKey: 'date',
    yKeys: 'value',
    sparkline: true,
    width: 200,
    height: 60,
  },
};

export const WithAnnotations: Story = {
  args: {
    data: timeSeriesData,
    xKey: 'date',
    yKeys: 'value',
    title: 'Line Chart with Reference Lines',
    referenceLines: [
      { value: 50, label: 'Baseline' },
      { value: 70, label: 'Target', color: '#059669' },
    ],
    height: 400,
  },
};

export const StepCurve: Story = {
  args: {
    data: timeSeriesData,
    xKey: 'date',
    yKeys: 'value',
    title: 'Step Line Chart',
    curveType: 'step',
    showDots: true,
    height: 400,
  },
};
