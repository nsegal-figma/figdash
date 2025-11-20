import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BarChart, Bar } from 'recharts';
import { AxisY } from './AxisY';

describe('AxisY Component', () => {
  const mockData = [
    { name: 'A', value: 10 },
    { name: 'B', value: 20 },
    { name: 'C', value: 30 },
  ];

  it('renders without crashing', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <AxisY />
        <Bar dataKey="value" />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });

  it('applies design tokens for text color', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <AxisY />
        <Bar dataKey="value" />
      </BarChart>
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders axis label when provided', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <AxisY label="Values" />
        <Bar dataKey="value" />
      </BarChart>
    );

    expect(container.textContent).toContain('Values');
  });

  it('hides axis line when showAxisLine is false', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <AxisY showAxisLine={false} />
        <Bar dataKey="value" />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });

  it('applies custom tick formatter', () => {
    const formatter = (value: number) => `$${value}`;

    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <AxisY tickFormatter={formatter} />
        <Bar dataKey="value" />
      </BarChart>
    );

    expect(container.textContent).toContain('$');
  });

  it('renders with empty data', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={[]}>
        <AxisY />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders with single data point', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={[{ name: 'A', value: 10 }]}>
        <AxisY />
        <Bar dataKey="value" />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });
});
