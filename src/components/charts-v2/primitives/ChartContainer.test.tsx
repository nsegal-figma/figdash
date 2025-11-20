import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ChartContainer } from './ChartContainer';

// Mock ResponsiveContainer to avoid jsdom layout issues
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  };
});

describe('ChartContainer', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ChartContainer>
        <div>Chart Content</div>
      </ChartContainer>
    );

    expect(getByText('Chart Content')).toBeTruthy();
  });

  it('renders with title', () => {
    const { getByText } = render(
      <ChartContainer title="Test Chart">
        <div>Chart</div>
      </ChartContainer>
    );

    expect(getByText('Test Chart')).toBeTruthy();
    expect(getByText('Chart')).toBeTruthy();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ChartContainer className="custom-chart">
        <div>Chart</div>
      </ChartContainer>
    );

    const chartContainer = container.querySelector('.custom-chart');
    expect(chartContainer).toBeTruthy();
  });

  it('renders without title when not provided', () => {
    const { container } = render(
      <ChartContainer>
        <div>Chart</div>
      </ChartContainer>
    );

    expect(container.querySelector('h3')).toBeNull();
  });

  it('applies container styles', () => {
    const { container } = render(
      <ChartContainer width={600} height={400}>
        <div>Chart</div>
      </ChartContainer>
    );

    const chartContainer = container.querySelector('.chart-container');
    expect(chartContainer).toBeTruthy();
  });
});
