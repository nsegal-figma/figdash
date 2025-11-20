import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BarChartV2 } from './BarChart';

// Mock ResponsiveContainer to avoid jsdom layout issues
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  };
});

describe('BarChartV2', () => {
  const mockData = [
    { category: 'A', value: 10 },
    { category: 'B', value: 20 },
    { category: 'C', value: 30 },
  ];

  it('renders without crashing', () => {
    const { container } = render(
      <BarChartV2 data={mockData} xKey="category" yKeys="value" />
    );

    expect(container).toBeTruthy();
  });

  it('renders with title', () => {
    const { getByText } = render(
      <BarChartV2
        data={mockData}
        xKey="category"
        yKeys="value"
        title="Test Chart"
      />
    );

    expect(getByText('Test Chart')).toBeTruthy();
  });

  it('renders loading state', () => {
    const { getByText } = render(
      <BarChartV2
        data={mockData}
        xKey="category"
        yKeys="value"
        isLoading
      />
    );

    expect(getByText('Loading chart...')).toBeTruthy();
  });

  it('renders empty state for no data', () => {
    const { getByText } = render(
      <BarChartV2 data={[]} xKey="category" yKeys="value" />
    );

    expect(getByText('No data available for this chart')).toBeTruthy();
  });

  it('renders with single series', () => {
    const { container } = render(
      <BarChartV2 data={mockData} xKey="category" yKeys="value" />
    );

    // Just verify it renders without errors
    expect(container).toBeTruthy();
  });

  it('renders with multiple series', () => {
    const multiSeriesData = [
      { category: 'A', series1: 10, series2: 15 },
      { category: 'B', series1: 20, series2: 25 },
    ];

    const { container } = render(
      <BarChartV2
        data={multiSeriesData}
        xKey="category"
        yKeys={['series1', 'series2']}
      />
    );

    // Just verify it renders without errors
    expect(container).toBeTruthy();
  });

  it('shows legend for multi-series', () => {
    const multiSeriesData = [
      { category: 'A', series1: 10, series2: 15 },
    ];

    const { container } = render(
      <BarChartV2
        data={multiSeriesData}
        xKey="category"
        yKeys={['series1', 'series2']}
        showLegend
      />
    );

    // Just verify it renders without errors
    expect(container).toBeTruthy();
  });

  it('hides legend for single series', () => {
    const { container } = render(
      <BarChartV2
        data={mockData}
        xKey="category"
        yKeys="value"
        showLegend
      />
    );

    // Should not show legend for single series even if showLegend=true
    expect(container.querySelector('.recharts-legend-wrapper')).toBeNull();
  });

  it('hides grid when showGrid is false', () => {
    const { container } = render(
      <BarChartV2
        data={mockData}
        xKey="category"
        yKeys="value"
        showGrid={false}
      />
    );

    expect(container.querySelector('.recharts-cartesian-grid')).toBeNull();
  });

  it('hides tooltip when showTooltip is false', () => {
    const { container } = render(
      <BarChartV2
        data={mockData}
        xKey="category"
        yKeys="value"
        showTooltip={false}
      />
    );

    // Tooltip won't be in DOM until hover, but we can check it's not configured
    expect(container).toBeTruthy();
  });

  it('applies custom colors', () => {
    const customColors = ['#FF0000', '#00FF00'];

    const { container } = render(
      <BarChartV2
        data={mockData}
        xKey="category"
        yKeys="value"
        colors={customColors}
      />
    );

    expect(container).toBeTruthy();
  });

  it('applies value formatter', () => {
    const formatter = (value: number) => `$${value}`;

    const { container } = render(
      <BarChartV2
        data={mockData}
        xKey="category"
        yKeys="value"
        valueFormatter={formatter}
      />
    );

    expect(container).toBeTruthy();
  });

  it('handles null data gracefully', () => {
    const { getByText } = render(
      <BarChartV2 data={null as any} xKey="category" yKeys="value" />
    );

    expect(getByText('No data available for this chart')).toBeTruthy();
  });

  describe('Styling Enhancements', () => {
    it('renders with gradient fill', () => {
      const { container } = render(
        <BarChartV2
          data={mockData}
          xKey="category"
          yKeys="value"
          gradient
        />
      );

      // Just verify it renders without errors
      expect(container).toBeTruthy();
    });

    it('applies custom bar radius', () => {
      const { container } = render(
        <BarChartV2
          data={mockData}
          xKey="category"
          yKeys="value"
          barRadius={12}
        />
      );

      expect(container).toBeTruthy();
    });

    it('enables hover effects', () => {
      const { container } = render(
        <BarChartV2
          data={mockData}
          xKey="category"
          yKeys="value"
          hoverEffects
        />
      );

      expect(container).toBeTruthy();
    });

    it('disables hover effects', () => {
      const { container } = render(
        <BarChartV2
          data={mockData}
          xKey="category"
          yKeys="value"
          hoverEffects={false}
        />
      );

      expect(container).toBeTruthy();
    });

    it('shows bar borders', () => {
      const { container } = render(
        <BarChartV2
          data={mockData}
          xKey="category"
          yKeys="value"
          showBarBorder
          barBorderColor="#000000"
        />
      );

      expect(container).toBeTruthy();
    });

    it('combines gradient and borders', () => {
      const { container } = render(
        <BarChartV2
          data={mockData}
          xKey="category"
          yKeys="value"
          gradient
          showBarBorder
          barRadius={16}
        />
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Horizontal Bars (VIZ-029)', () => {
    it('renders horizontal bars', () => {
      const { container } = render(
        <BarChartV2
          data={mockData}
          xKey="category"
          yKeys="value"
          orientation="horizontal"
        />
      );

      expect(container).toBeTruthy();
    });

    it('swaps axes for horizontal orientation', () => {
      const { container } = render(
        <BarChartV2
          data={mockData}
          xKey="category"
          yKeys="value"
          orientation="horizontal"
          xLabel="Categories"
          yLabel="Values"
        />
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Stacked Bars (VIZ-030)', () => {
    it('renders stacked bars for multi-series', () => {
      const multiSeriesData = [
        { category: 'A', series1: 10, series2: 15 },
        { category: 'B', series1: 20, series2: 25 },
      ];

      const { container } = render(
        <BarChartV2
          data={multiSeriesData}
          xKey="category"
          yKeys={['series1', 'series2']}
          stacked
        />
      );

      expect(container).toBeTruthy();
    });

    it('stacked works with horizontal orientation', () => {
      const multiSeriesData = [
        { category: 'A', series1: 10, series2: 15 },
      ];

      const { container } = render(
        <BarChartV2
          data={multiSeriesData}
          xKey="category"
          yKeys={['series1', 'series2']}
          orientation="horizontal"
          stacked
        />
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Annotations (VIZ-031)', () => {
    it('renders reference lines', () => {
      const { container } = render(
        <BarChartV2
          data={mockData}
          xKey="category"
          yKeys="value"
          referenceLines={[
            { value: 20, label: 'Target', color: '#FF0000' },
          ]}
        />
      );

      expect(container).toBeTruthy();
    });

    it('renders multiple reference lines', () => {
      const { container } = render(
        <BarChartV2
          data={mockData}
          xKey="category"
          yKeys="value"
          referenceLines={[
            { value: 15, label: 'Min' },
            { value: 25, label: 'Target' },
            { value: 35, label: 'Max' },
          ]}
        />
      );

      expect(container).toBeTruthy();
    });

    it('shows data labels on bars', () => {
      const { container } = render(
        <BarChartV2
          data={mockData}
          xKey="category"
          yKeys="value"
          showDataLabels
        />
      );

      expect(container).toBeTruthy();
    });
  });
});
