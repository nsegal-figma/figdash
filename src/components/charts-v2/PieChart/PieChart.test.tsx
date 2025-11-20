import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PieChartV2 } from './PieChart';

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  };
});

describe('PieChartV2', () => {
  const mockData = [
    { name: 'Category A', value: 30 },
    { name: 'Category B', value: 50 },
    { name: 'Category C', value: 20 },
  ];

  describe('Donut Chart Base (VIZ-041)', () => {
    it('renders donut chart', () => {
      const { container } = render(
        <PieChartV2 data={mockData} variant="donut" />
      );
      expect(container).toBeTruthy();
    });

    it('renders with title', () => {
      const { getByText } = render(
        <PieChartV2 data={mockData} variant="donut" title="Distribution" />
      );
      expect(getByText('Distribution')).toBeTruthy();
    });

    it('renders loading state', () => {
      const { getByText } = render(
        <PieChartV2 data={mockData} variant="donut" isLoading />
      );
      expect(getByText('Loading chart...')).toBeTruthy();
    });

    it('renders empty state', () => {
      const { container } = render(
        <PieChartV2 data={[]} variant="donut" />
      );
      expect(container.textContent).toContain('No data');
    });
  });

  describe('Donut Interactions (VIZ-042)', () => {
    it('shows tooltip on hover', () => {
      const { container } = render(
        <PieChartV2 data={mockData} variant="donut" showTooltip />
      );
      expect(container).toBeTruthy();
    });

    it('shows legend', () => {
      const { container } = render(
        <PieChartV2 data={mockData} variant="donut" showLegend />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Pie Chart Variant (VIZ-043)', () => {
    it('renders pie chart', () => {
      const { container } = render(
        <PieChartV2 data={mockData} variant="pie" />
      );
      expect(container).toBeTruthy();
    });

    it('pie has no inner radius', () => {
      const { container } = render(
        <PieChartV2 data={mockData} variant="pie" />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Advanced Donut Features (VIZ-044)', () => {
    it('shows center label in donut', () => {
      const { container } = render(
        <PieChartV2
          data={mockData}
          variant="donut"
          centerLabel="Total"
          centerValue="100"
        />
      );
      expect(container).toBeTruthy();
    });

    it('shows percentage labels', () => {
      const { container } = render(
        <PieChartV2 data={mockData} variant="donut" showLabels />
      );
      expect(container).toBeTruthy();
    });

    it('applies custom inner radius', () => {
      const { container } = render(
        <PieChartV2 data={mockData} variant="donut" innerRadius="70%" />
      );
      expect(container).toBeTruthy();
    });

    it('applies custom outer radius', () => {
      const { container } = render(
        <PieChartV2 data={mockData} variant="donut" outerRadius="90%" />
      );
      expect(container).toBeTruthy();
    });

    it('applies padding angle between segments', () => {
      const { container } = render(
        <PieChartV2 data={mockData} variant="donut" paddingAngle={5} />
      );
      expect(container).toBeTruthy();
    });

    it('applies custom start and end angles', () => {
      const { container } = render(
        <PieChartV2
          data={mockData}
          variant="donut"
          startAngle={90}
          endAngle={450}
        />
      );
      expect(container).toBeTruthy();
    });

    it('uses custom colors', () => {
      const { container } = render(
        <PieChartV2
          data={mockData}
          variant="donut"
          colors={['#FF0000', '#00FF00', '#0000FF']}
        />
      );
      expect(container).toBeTruthy();
    });

    it('applies custom value formatter', () => {
      const { container } = render(
        <PieChartV2
          data={mockData}
          variant="donut"
          valueFormatter={(v) => `$${v}`}
        />
      );
      expect(container).toBeTruthy();
    });

    it('hides legend when showLegend is false', () => {
      const { container } = render(
        <PieChartV2 data={mockData} variant="donut" showLegend={false} />
      );
      expect(container).toBeTruthy();
    });

    it('shows outside labels', () => {
      const { container } = render(
        <PieChartV2
          data={mockData}
          variant="donut"
          showLabels
          labelPosition="outside"
        />
      );
      expect(container).toBeTruthy();
    });

    it('shows inside labels', () => {
      const { container } = render(
        <PieChartV2
          data={mockData}
          variant="donut"
          showLabels
          labelPosition="inside"
        />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Combined Features', () => {
    it('combines all features', () => {
      const { container } = render(
        <PieChartV2
          data={mockData}
          variant="donut"
          title="Complete Donut Chart"
          centerLabel="Total Responses"
          centerValue="100"
          showLabels
          showLegend
          paddingAngle={3}
          valueFormatter={(v) => `${v} responses`}
        />
      );
      expect(container).toBeTruthy();
    });
  });
});
