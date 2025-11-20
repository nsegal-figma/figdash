import type { Meta, StoryObj } from '@storybook/react';
import { AreaChartV2 } from './AreaChart';

const meta = {
  title: 'Charts/AreaChartV2',
  component: AreaChartV2,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AreaChartV2>;

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

const stackedData = [
  { date: 'Jan', productA: 20, productB: 25, productC: 15 },
  { date: 'Feb', productA: 25, productB: 27, productC: 18 },
  { date: 'Mar', productA: 22, productB: 26, productC: 16 },
  { date: 'Apr', productA: 30, productB: 37, productC: 22 },
  { date: 'May', productA: 35, productB: 37, productC: 25 },
];

export const Default: Story = {
  args: {
    data: timeSeriesData,
    xKey: 'date',
    yKeys: 'value',
    title: 'Response Trend',
    yLabel: 'Responses',
    height: 400,
  },
};

export const Stacked: Story = {
  args: {
    data: stackedData,
    xKey: 'date',
    yKeys: ['productA', 'productB', 'productC'],
    title: 'Stacked Area Chart',
    stacked: true,
    showLegend: true,
    height: 400,
  },
};

export const WithDots: Story = {
  args: {
    data: timeSeriesData,
    xKey: 'date',
    yKeys: 'value',
    title: 'Area Chart with Dots',
    showDots: true,
    height: 400,
  },
};

export const LinearCurve: Story = {
  args: {
    data: timeSeriesData,
    xKey: 'date',
    yKeys: 'value',
    title: 'Linear Area Chart',
    curveType: 'linear',
    height: 400,
  },
};
