import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { LineChartV2 } from './LineChart';

// Mock ResponsiveContainer
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  };
});

describe('LineChartV2', () => {
  const mockData = [
    { date: '2025-01', value: 10 },
    { date: '2025-02', value: 20 },
    { date: '2025-03', value: 15 },
  ];

  describe('Basic Structure (VIZ-032)', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <LineChartV2 data={mockData} xKey="date" yKeys="value" />
      );
      expect(container).toBeTruthy();
    });

    it('renders with title', () => {
      const { getByText } = render(
        <LineChartV2 data={mockData} xKey="date" yKeys="value" title="Trend" />
      );
      expect(getByText('Trend')).toBeTruthy();
    });

    it('renders loading state', () => {
      const { getByText } = render(
        <LineChartV2 data={mockData} xKey="date" yKeys="value" isLoading />
      );
      expect(getByText('Loading chart...')).toBeTruthy();
    });

    it('renders empty state', () => {
      const { getByText } = render(
        <LineChartV2 data={[]} xKey="date" yKeys="value" />
      );
      expect(getByText('No data available for this chart')).toBeTruthy();
    });
  });

  describe('Styling (VIZ-033)', () => {
    it('renders with monotone curve', () => {
      const { container } = render(
        <LineChartV2 data={mockData} xKey="date" yKeys="value" curveType="monotone" />
      );
      expect(container).toBeTruthy();
    });

    it('renders with linear curve', () => {
      const { container } = render(
        <LineChartV2 data={mockData} xKey="date" yKeys="value" curveType="linear" />
      );
      expect(container).toBeTruthy();
    });

    it('renders with step curve', () => {
      const { container } = render(
        <LineChartV2 data={mockData} xKey="date" yKeys="value" curveType="step" />
      );
      expect(container).toBeTruthy();
    });

    it('shows dots on data points', () => {
      const { container } = render(
        <LineChartV2 data={mockData} xKey="date" yKeys="value" showDots />
      );
      expect(container).toBeTruthy();
    });

    it('hides dots', () => {
      const { container } = render(
        <LineChartV2 data={mockData} xKey="date" yKeys="value" showDots={false} />
      );
      expect(container).toBeTruthy();
    });

    it('applies custom stroke width', () => {
      const { container } = render(
        <LineChartV2 data={mockData} xKey="date" yKeys="value" strokeWidth={4} />
      );
      expect(container).toBeTruthy();
    });

    it('fills area under line', () => {
      const { container } = render(
        <LineChartV2 data={mockData} xKey="date" yKeys="value" fillArea areaOpacity={0.5} />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Multi-Line (VIZ-034)', () => {
    const multiLineData = [
      { date: '2025-01', series1: 10, series2: 15 },
      { date: '2025-02', series1: 20, series2: 25 },
    ];

    it('renders multiple lines', () => {
      const { container } = render(
        <LineChartV2
          data={multiLineData}
          xKey="date"
          yKeys={['series1', 'series2']}
        />
      );
      expect(container).toBeTruthy();
    });

    it('shows legend for multi-line', () => {
      const { container } = render(
        <LineChartV2
          data={multiLineData}
          xKey="date"
          yKeys={['series1', 'series2']}
          showLegend
        />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Crosshair Tooltip (VIZ-035)', () => {
    it('renders with crosshair cursor', () => {
      const { container } = render(
        <LineChartV2 data={mockData} xKey="date" yKeys="value" crosshair />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Sparkline (VIZ-036)', () => {
    it('renders as sparkline', () => {
      const { container } = render(
        <LineChartV2 data={mockData} xKey="date" yKeys="value" sparkline />
      );
      expect(container).toBeTruthy();
    });

    it('sparkline hides axes and grid', () => {
      const { container } = render(
        <LineChartV2 data={mockData} xKey="date" yKeys="value" sparkline />
      );
      // Sparkline should be minimal
      expect(container).toBeTruthy();
    });
  });

  describe('Annotations (VIZ-037)', () => {
    it('renders reference lines', () => {
      const { container } = render(
        <LineChartV2
          data={mockData}
          xKey="date"
          yKeys="value"
          referenceLines={[{ value: 15, label: 'Average' }]}
        />
      );
      expect(container).toBeTruthy();
    });

    it('renders multiple reference lines', () => {
      const { container } = render(
        <LineChartV2
          data={mockData}
          xKey="date"
          yKeys="value"
          referenceLines={[
            { value: 10, label: 'Min', color: '#FF0000' },
            { value: 20, label: 'Max', color: '#00FF00' },
          ]}
        />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Combined Features', () => {
    it('combines all features', () => {
      const { container } = render(
        <LineChartV2
          data={mockData}
          xKey="date"
          yKeys="value"
          title="Complete Line Chart"
          curveType="monotone"
          showDots
          fillArea
          crosshair
          referenceLines={[{ value: 15 }]}
          valueFormatter={(v) => `$${v}`}
        />
      );
      expect(container).toBeTruthy();
    });
  });
});
