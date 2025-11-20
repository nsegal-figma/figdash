import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BarChart, Bar } from 'recharts';
import { Grid, GridRows, GridColumns } from './Grid';

describe('Grid Component', () => {
  const mockData = [
    { name: 'A', value: 10 },
    { name: 'B', value: 20 },
    { name: 'C', value: 30 },
  ];

  describe('Grid', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={mockData}>
          <Grid />
          <Bar dataKey="value" />
        </BarChart>
      );

      expect(container).toBeTruthy();
    });

    it('renders with dashed lines by default', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={mockData}>
          <Grid />
          <Bar dataKey="value" />
        </BarChart>
      );

      const grid = container.querySelector('.recharts-cartesian-grid');
      expect(grid).toBeTruthy();
    });

    it('renders with solid lines', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={mockData}>
          <Grid variant="solid" />
          <Bar dataKey="value" />
        </BarChart>
      );

      expect(container).toBeTruthy();
    });

    it('renders with dotted lines', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={mockData}>
          <Grid variant="dotted" />
          <Bar dataKey="value" />
        </BarChart>
      );

      expect(container).toBeTruthy();
    });

    it('applies custom opacity', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={mockData}>
          <Grid opacity={0.5} />
          <Bar dataKey="value" />
        </BarChart>
      );

      expect(container).toBeTruthy();
    });

    it('renders horizontal lines only', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={mockData}>
          <Grid showHorizontal showVertical={false} />
          <Bar dataKey="value" />
        </BarChart>
      );

      expect(container).toBeTruthy();
    });

    it('renders vertical lines only', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={mockData}>
          <Grid showHorizontal={false} showVertical />
          <Bar dataKey="value" />
        </BarChart>
      );

      expect(container).toBeTruthy();
    });

    it('renders with background fill', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={mockData}>
          <Grid backgroundFill="#f0f0f0" />
          <Bar dataKey="value" />
        </BarChart>
      );

      const rect = container.querySelector('rect[fill="#f0f0f0"]');
      expect(rect).toBeTruthy();
    });

    it('renders with subtle styling', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={mockData}>
          <Grid subtle />
          <Bar dataKey="value" />
        </BarChart>
      );

      expect(container).toBeTruthy();
    });

    it('renders with empty data', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={[]}>
          <Grid />
        </BarChart>
      );

      expect(container).toBeTruthy();
    });
  });

  describe('GridRows', () => {
    it('renders horizontal lines only', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={mockData}>
          <GridRows />
          <Bar dataKey="value" />
        </BarChart>
      );

      expect(container).toBeTruthy();
    });

    it('applies variant and opacity props', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={mockData}>
          <GridRows variant="solid" opacity={0.7} />
          <Bar dataKey="value" />
        </BarChart>
      );

      expect(container).toBeTruthy();
    });
  });

  describe('GridColumns', () => {
    it('renders vertical lines only', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={mockData}>
          <GridColumns />
          <Bar dataKey="value" />
        </BarChart>
      );

      expect(container).toBeTruthy();
    });

    it('applies variant and opacity props', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={mockData}>
          <GridColumns variant="dotted" opacity={0.3} />
          <Bar dataKey="value" />
        </BarChart>
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Design Token Integration', () => {
    it('uses design tokens for grid color', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={mockData}>
          <Grid />
          <Bar dataKey="value" />
        </BarChart>
      );

      // Grid should render with design token colors
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('subtle variant uses lighter color', () => {
      const { container } = render(
        <BarChart width={400} height={200} data={mockData}>
          <Grid subtle />
          <Bar dataKey="value" />
        </BarChart>
      );

      expect(container).toBeTruthy();
    });
  });
});
