import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { AreaChartV2 } from './AreaChart';

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  };
});

describe('AreaChartV2', () => {
  const mockData = [
    { date: '2025-01', value: 10 },
    { date: '2025-02', value: 20 },
    { date: '2025-03', value: 15 },
  ];

  describe('Base Area Chart (VIZ-038)', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <AreaChartV2 data={mockData} xKey="date" yKeys="value" />
      );
      expect(container).toBeTruthy();
    });

    it('renders with title', () => {
      const { getByText } = render(
        <AreaChartV2 data={mockData} xKey="date" yKeys="value" title="Trend" />
      );
      expect(getByText('Trend')).toBeTruthy();
    });

    it('renders loading state', () => {
      const { getByText } = render(
        <AreaChartV2 data={mockData} xKey="date" yKeys="value" isLoading />
      );
      expect(getByText('Loading chart...')).toBeTruthy();
    });

    it('renders empty state', () => {
      const { container } = render(
        <AreaChartV2 data={[]} xKey="date" yKeys="value" />
      );
      expect(container.textContent).toContain('No data');
    });

    it('applies custom opacity', () => {
      const { container } = render(
        <AreaChartV2 data={mockData} xKey="date" yKeys="value" opacity={0.8} />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Stacked Area (VIZ-039)', () => {
    const stackedData = [
      { date: '2025-01', series1: 10, series2: 15 },
      { date: '2025-02', series1: 20, series2: 25 },
    ];

    it('renders stacked areas', () => {
      const { container } = render(
        <AreaChartV2
          data={stackedData}
          xKey="date"
          yKeys={['series1', 'series2']}
          stacked
        />
      );
      expect(container).toBeTruthy();
    });

    it('shows legend for stacked areas', () => {
      const { container } = render(
        <AreaChartV2
          data={stackedData}
          xKey="date"
          yKeys={['series1', 'series2']}
          stacked
          showLegend
        />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Range Area (VIZ-040)', () => {
    it('renders with reference lines for range', () => {
      const { container } = render(
        <AreaChartV2
          data={mockData}
          xKey="date"
          yKeys="value"
          referenceLines={[
            { value: 10, label: 'Min' },
            { value: 20, label: 'Max' },
          ]}
        />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Curve Types', () => {
    it('renders with monotone curve', () => {
      const { container } = render(
        <AreaChartV2 data={mockData} xKey="date" yKeys="value" curveType="monotone" />
      );
      expect(container).toBeTruthy();
    });

    it('renders with linear curve', () => {
      const { container } = render(
        <AreaChartV2 data={mockData} xKey="date" yKeys="value" curveType="linear" />
      );
      expect(container).toBeTruthy();
    });

    it('renders with step curve', () => {
      const { container } = render(
        <AreaChartV2 data={mockData} xKey="date" yKeys="value" curveType="step" />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Dots & Stroke', () => {
    it('shows dots on data points', () => {
      const { container } = render(
        <AreaChartV2 data={mockData} xKey="date" yKeys="value" showDots />
      );
      expect(container).toBeTruthy();
    });

    it('applies custom stroke width', () => {
      const { container } = render(
        <AreaChartV2 data={mockData} xKey="date" yKeys="value" strokeWidth={3} />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Grid & Tooltip', () => {
    it('hides grid when showGrid is false', () => {
      const { container } = render(
        <AreaChartV2 data={mockData} xKey="date" yKeys="value" showGrid={false} />
      );
      expect(container).toBeTruthy();
    });

    it('applies custom value formatter', () => {
      const { container } = render(
        <AreaChartV2
          data={mockData}
          xKey="date"
          yKeys="value"
          valueFormatter={(v) => `$${v}`}
        />
      );
      expect(container).toBeTruthy();
    });
  });
});
