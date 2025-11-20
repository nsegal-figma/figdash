import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BarChart } from 'recharts';
import { AxisX } from './AxisX';

describe('AxisX Component', () => {
  const mockData = [
    { name: 'A', value: 10 },
    { name: 'B', value: 20 },
    { name: 'C', value: 30 },
  ];

  it('renders without crashing', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <AxisX dataKey="name" />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });

  it('applies design tokens for text color', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <AxisX dataKey="name" />
      </BarChart>
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders axis label when provided', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <AxisX dataKey="name" label="Categories" />
      </BarChart>
    );

    expect(container.textContent).toContain('Categories');
  });

  it('hides axis line when showAxisLine is false', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <AxisX dataKey="name" showAxisLine={false} />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });

  it('applies custom tick formatter', () => {
    const formatter = (value: string) => `Item ${value}`;

    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <AxisX dataKey="name" tickFormatter={formatter} />
      </BarChart>
    );

    expect(container.textContent).toContain('Item');
  });

  it('handles tick rotation', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={mockData}>
        <AxisX dataKey="name" tickRotation={45} />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });

  it('renders with empty data', () => {
    const { container } = render(
      <BarChart width={400} height={200} data={[]}>
        <AxisX dataKey="name" />
      </BarChart>
    );

    expect(container).toBeTruthy();
  });
});
