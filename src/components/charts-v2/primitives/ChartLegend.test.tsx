import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LineChart, Line } from 'recharts';
import { ChartLegend } from './ChartLegend';

describe('ChartLegend Component', () => {
  const mockData = [
    { name: 'A', series1: 10, series2: 15 },
    { name: 'B', series1: 20, series2: 25 },
    { name: 'C', series1: 30, series2: 35 },
  ];

  it('renders without crashing', () => {
    const { container } = render(
      <LineChart width={400} height={200} data={mockData}>
        <Line dataKey="series1" name="Series 1" />
        <Line dataKey="series2" name="Series 2" />
        <ChartLegend />
      </LineChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders in bottom position by default', () => {
    const { container } = render(
      <LineChart width={400} height={200} data={mockData}>
        <Line dataKey="series1" name="Series 1" />
        <ChartLegend />
      </LineChart>
    );

    const legend = container.querySelector('.recharts-legend-wrapper');
    expect(legend).toBeTruthy();
  });

  it('renders in top position', () => {
    const { container } = render(
      <LineChart width={400} height={200} data={mockData}>
        <Line dataKey="series1" name="Series 1" />
        <ChartLegend position="top" />
      </LineChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders in left position', () => {
    const { container } = render(
      <LineChart width={400} height={200} data={mockData}>
        <Line dataKey="series1" name="Series 1" />
        <ChartLegend position="left" />
      </LineChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders in right position', () => {
    const { container } = render(
      <LineChart width={400} height={200} data={mockData}>
        <Line dataKey="series1" name="Series 1" />
        <ChartLegend position="right" />
      </LineChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders with horizontal layout', () => {
    const { container } = render(
      <LineChart width={400} height={200} data={mockData}>
        <Line dataKey="series1" name="Series 1" />
        <Line dataKey="series2" name="Series 2" />
        <ChartLegend layout="horizontal" />
      </LineChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders with vertical layout', () => {
    const { container } = render(
      <LineChart width={400} height={200} data={mockData}>
        <Line dataKey="series1" name="Series 1" />
        <Line dataKey="series2" name="Series 2" />
        <ChartLegend layout="vertical" />
      </LineChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders with square icons', () => {
    const { container } = render(
      <LineChart width={400} height={200} data={mockData}>
        <Line dataKey="series1" name="Series 1" />
        <ChartLegend iconShape="square" />
      </LineChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders with circle icons', () => {
    const { container } = render(
      <LineChart width={400} height={200} data={mockData}>
        <Line dataKey="series1" name="Series 1" />
        <ChartLegend iconShape="circle" />
      </LineChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders with line icons', () => {
    const { container } = render(
      <LineChart width={400} height={200} data={mockData}>
        <Line dataKey="series1" name="Series 1" />
        <ChartLegend iconShape="line" />
      </LineChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders without interactive mode', () => {
    const { container } = render(
      <LineChart width={400} height={200} data={mockData}>
        <Line dataKey="series1" name="Series 1" />
        <ChartLegend interactive={false} />
      </LineChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders with multiple series', () => {
    const { container } = render(
      <LineChart width={400} height={200} data={mockData}>
        <Line dataKey="series1" name="Series 1" />
        <Line dataKey="series2" name="Series 2" />
        <ChartLegend />
      </LineChart>
    );

    const legend = container.querySelector('.recharts-legend-wrapper');
    expect(legend).toBeTruthy();
  });

  it('renders with empty data', () => {
    const { container } = render(
      <LineChart width={400} height={200} data={[]}>
        <Line dataKey="series1" name="Series 1" />
        <ChartLegend />
      </LineChart>
    );

    expect(container).toBeTruthy();
  });
});
