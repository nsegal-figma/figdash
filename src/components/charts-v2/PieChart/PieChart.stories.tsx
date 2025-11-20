import type { Meta, StoryObj } from '@storybook/react';
import { PieChartV2 } from './PieChart';

const meta = {
  title: 'Charts/PieChartV2',
  component: PieChartV2,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PieChartV2>;

export default meta;
type Story = StoryObj<typeof meta>;

const distributionData = [
  { name: 'Satisfied', value: 145 },
  { name: 'Neutral', value: 67 },
  { name: 'Dissatisfied', value: 23 },
  { name: 'Very Satisfied', value: 89 },
  { name: 'Very Dissatisfied', value: 12 },
];

export const Donut: Story = {
  args: {
    data: distributionData,
    variant: 'donut',
    title: 'Satisfaction Distribution',
    height: 400,
  },
};

export const DonutWithCenterLabel: Story = {
  args: {
    data: distributionData,
    variant: 'donut',
    title: 'Total Responses',
    centerLabel: 'Total',
    centerValue: '336',
    height: 400,
  },
};

export const Pie: Story = {
  args: {
    data: distributionData,
    variant: 'pie',
    title: 'Response Distribution',
    height: 400,
  },
};

export const WithLabels: Story = {
  args: {
    data: distributionData,
    variant: 'donut',
    title: 'Distribution with Labels',
    showLabels: true,
    labelPosition: 'outside',
    height: 400,
  },
};

export const HalfDonut: Story = {
  args: {
    data: distributionData,
    variant: 'donut',
    title: 'Half Donut',
    startAngle: 180,
    endAngle: 0,
    centerLabel: 'Score',
    centerValue: '8.5',
    height: 400,
  },
};
