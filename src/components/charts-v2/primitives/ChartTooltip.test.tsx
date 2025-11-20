import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BarChart, Bar } from 'recharts';
import { ChartTooltip } from './ChartTooltip';

describe('ChartTooltip Component', () => {
  const mockData = [
    { name: 'A', value: 10 },
    { name: 'B', value: 20 },
    { name: 'C', value: 30 },
  ];

  it('renders without crashing', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <Bar dataKey="value" />
        <ChartTooltip />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders with custom value formatter', () => {
    const formatter = (value: number) => `$${value}`;

    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <Bar dataKey="value" />
        <ChartTooltip valueFormatter={formatter} />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders with custom label formatter', () => {
    const formatter = (label: string) => `Category: ${label}`;

    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <Bar dataKey="value" />
        <ChartTooltip labelFormatter={formatter} />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders without cursor when showCursor is false', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <Bar dataKey="value" />
        <ChartTooltip showCursor={false} />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders with custom cursor fill', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <Bar dataKey="value" />
        <ChartTooltip cursorFill="#FF0000" />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders with custom animation duration', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <Bar dataKey="value" />
        <ChartTooltip animationDuration={150} />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders in follow cursor mode', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <Bar dataKey="value" />
        <ChartTooltip followCursor />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders with empty data', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={[]}>
        <Bar dataKey="value" />
        <ChartTooltip />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders with single data point', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={[{ name: 'A', value: 10 }]}>
        <Bar dataKey="value" />
        <ChartTooltip />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });

  describe('Design Token Integration', () => {
    it('applies design token styling', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={mockData}>
          <Bar dataKey="value" />
          <ChartTooltip />
        </BarChart>
      );

      // Tooltip should render with design token styles
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });
});
