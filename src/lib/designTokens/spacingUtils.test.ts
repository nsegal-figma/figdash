import { describe, it, expect } from 'vitest';
import {
  calculateChartMargins,
  calculateChartDimensions,
  getCurrentBreakpoint,
  meetsBreakpoint,
  getResponsiveChartHeight,
  calculateChartGrid,
  getSpacingPx,
  aspectRatios,
  calculateInnerDimensions,
  supportsFeature,
  getOptimalChartsPerRow,
} from './spacingUtils';

describe('Spacing & Layout Utilities', () => {
  describe('calculateChartMargins', () => {
    it('calculates margins for standard chart with axes', () => {
      const margins = calculateChartMargins(800, 400, true, true);

      expect(margins.top).toBeGreaterThan(0);
      expect(margins.right).toBeGreaterThan(0);
      expect(margins.bottom).toBeGreaterThan(0);
      expect(margins.left).toBeGreaterThan(0);
    });

    it('uses larger bottom margin with X axis', () => {
      const withAxis = calculateChartMargins(800, 400, true, true);
      const withoutAxis = calculateChartMargins(800, 400, false, true);

      expect(withAxis.bottom).toBeGreaterThan(withoutAxis.bottom);
    });

    it('uses larger left margin with Y axis', () => {
      const withAxis = calculateChartMargins(800, 400, true, true);
      const withoutAxis = calculateChartMargins(800, 400, true, false);

      expect(withAxis.left).toBeGreaterThan(withoutAxis.left);
    });

    it('scales margins for smaller containers', () => {
      const large = calculateChartMargins(1200, 600, true, true);
      const small = calculateChartMargins(400, 200, true, true);

      // Small container should have proportionally smaller margins
      expect(small.left).toBeLessThan(large.left);
    });

    it('margins are multiples of base unit (8px)', () => {
      const margins = calculateChartMargins(800, 400, true, true);

      expect(margins.top % 8).toBe(0);
      expect(margins.bottom % 8).toBe(0);
      expect(margins.left % 8).toBe(0);
      expect(margins.right % 8).toBe(0);
    });
  });

  describe('calculateChartDimensions', () => {
    it('maintains aspect ratio when constrained by height', () => {
      const result = calculateChartDimensions(1000, 400, 16 / 9);

      expect(result.height).toBe(400); // Constrained by height
      expect(Math.round(result.width / result.height * 100) / 100).toBeCloseTo(16 / 9, 1);
    });

    it('maintains aspect ratio when constrained by width', () => {
      const result = calculateChartDimensions(800, 600, 16 / 9);

      expect(result.width).toBe(800); // Constrained by width
      expect(Math.round(result.width / result.height * 100) / 100).toBeCloseTo(16 / 9, 1);
    });

    it('handles square aspect ratio', () => {
      const result = calculateChartDimensions(500, 600, 1);

      expect(result.width).toBe(result.height);
    });

    it('returns integer dimensions', () => {
      const result = calculateChartDimensions(777, 444, 16 / 9);

      expect(Number.isInteger(result.width)).toBe(true);
      expect(Number.isInteger(result.height)).toBe(true);
    });
  });

  describe('getCurrentBreakpoint', () => {
    it('returns sm for small widths', () => {
      expect(getCurrentBreakpoint(500)).toBe('sm');
      expect(getCurrentBreakpoint(639)).toBe('sm');
    });

    it('returns md for medium widths', () => {
      expect(getCurrentBreakpoint(768)).toBe('md');
      expect(getCurrentBreakpoint(1023)).toBe('md');
    });

    it('returns lg for large widths', () => {
      expect(getCurrentBreakpoint(1024)).toBe('lg');
      expect(getCurrentBreakpoint(1279)).toBe('lg');
    });

    it('returns xl for extra large widths', () => {
      expect(getCurrentBreakpoint(1280)).toBe('xl');
      expect(getCurrentBreakpoint(1535)).toBe('xl');
    });

    it('returns 2xl for very large widths', () => {
      expect(getCurrentBreakpoint(1536)).toBe('2xl');
      expect(getCurrentBreakpoint(2000)).toBe('2xl');
    });
  });

  describe('meetsBreakpoint', () => {
    it('returns true when width meets breakpoint', () => {
      expect(meetsBreakpoint(768, 'md')).toBe(true);
      expect(meetsBreakpoint(1024, 'lg')).toBe(true);
    });

    it('returns false when width below breakpoint', () => {
      expect(meetsBreakpoint(500, 'md')).toBe(false);
      expect(meetsBreakpoint(1000, 'xl')).toBe(false);
    });

    it('handles exact breakpoint values', () => {
      expect(meetsBreakpoint(640, 'sm')).toBe(true);
      expect(meetsBreakpoint(768, 'md')).toBe(true);
      expect(meetsBreakpoint(1024, 'lg')).toBe(true);
      expect(meetsBreakpoint(1280, 'xl')).toBe(true);
    });
  });

  describe('getResponsiveChartHeight', () => {
    it('returns appropriate height for sm breakpoint', () => {
      const height = getResponsiveChartHeight(500);
      expect(height).toBe(250);
    });

    it('returns appropriate height for md breakpoint', () => {
      const height = getResponsiveChartHeight(768);
      expect(height).toBe(300);
    });

    it('returns appropriate height for lg breakpoint', () => {
      const height = getResponsiveChartHeight(1024);
      expect(height).toBe(350);
    });

    it('returns appropriate height for xl breakpoint', () => {
      const height = getResponsiveChartHeight(1280);
      expect(height).toBe(400);
    });

    it('returns appropriate height for 2xl breakpoint', () => {
      const height = getResponsiveChartHeight(1600);
      expect(height).toBe(450);
    });

    it('accepts explicit breakpoint override', () => {
      const height = getResponsiveChartHeight(500, 'xl');
      expect(height).toBe(400); // Uses xl height despite sm width
    });
  });

  describe('calculateChartGrid', () => {
    it('creates single column on mobile', () => {
      const grid = calculateChartGrid(4, 500); // sm breakpoint

      expect(grid.columns).toBe(1);
      expect(grid.rows).toBe(4);
    });

    it('creates 2 columns on tablets', () => {
      const grid = calculateChartGrid(4, 768); // md breakpoint

      expect(grid.columns).toBe(2);
      expect(grid.rows).toBe(2);
    });

    it('creates up to 3 columns on desktop', () => {
      const grid = calculateChartGrid(6, 1280); // xl breakpoint

      expect(grid.columns).toBe(3);
      expect(grid.rows).toBe(2);
    });

    it('limits columns to chart count', () => {
      const grid = calculateChartGrid(2, 1280); // xl but only 2 charts

      expect(grid.columns).toBe(2); // Not 3
    });

    it('calculates chart dimensions accounting for gaps', () => {
      const grid = calculateChartGrid(2, 1000);

      const totalWidth = grid.chartWidth * grid.columns + grid.gap * (grid.columns - 1);
      expect(totalWidth).toBeLessThanOrEqual(1000);
    });

    it('returns consistent gap based on breakpoint', () => {
      const gridSm = calculateChartGrid(3, 500);
      const gridLg = calculateChartGrid(3, 1200);

      expect(gridSm.gap).toBe(16); // sm gap
      expect(gridLg.gap).toBe(32); // lg gap
    });
  });

  describe('getSpacingPx', () => {
    it('converts spacing tokens to pixels', () => {
      expect(getSpacingPx(0)).toBe(0);
      expect(getSpacingPx(4)).toBe(16);  // 1rem = 16px
      expect(getSpacingPx(8)).toBe(32);  // 2rem = 32px
      expect(getSpacingPx(12)).toBe(48); // 3rem = 48px
    });

    it('handles fractional rem values', () => {
      expect(getSpacingPx(1)).toBe(4);  // 0.25rem = 4px
      expect(getSpacingPx(2)).toBe(8);  // 0.5rem = 8px
      expect(getSpacingPx(3)).toBe(12); // 0.75rem = 12px
    });
  });

  describe('aspectRatios', () => {
    it('defines common aspect ratios', () => {
      expect(aspectRatios['16:9']).toBeCloseTo(1.778, 2);
      expect(aspectRatios['4:3']).toBeCloseTo(1.333, 2);
      expect(aspectRatios['1:1']).toBe(1);
      expect(aspectRatios.golden).toBeCloseTo(1.618, 2);
    });
  });

  describe('calculateInnerDimensions', () => {
    it('subtracts margins from total dimensions', () => {
      const inner = calculateInnerDimensions(800, 400, {
        top: 20,
        right: 20,
        bottom: 40,
        left: 50,
      });

      expect(inner.width).toBe(800 - 20 - 50); // 730
      expect(inner.height).toBe(400 - 20 - 40); // 340
    });

    it('returns zero for negative dimensions', () => {
      const inner = calculateInnerDimensions(100, 100, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      });

      expect(inner.width).toBe(0); // 100 - 100 = 0
      expect(inner.height).toBe(0);
    });

    it('handles zero margins', () => {
      const inner = calculateInnerDimensions(800, 400, {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      });

      expect(inner.width).toBe(800);
      expect(inner.height).toBe(400);
    });
  });

  describe('supportsFeature', () => {
    it('checks legend support (min 400px)', () => {
      expect(supportsFeature(500, 'legend')).toBe(true);
      expect(supportsFeature(300, 'legend')).toBe(false);
    });

    it('checks tooltip support (min 200px)', () => {
      expect(supportsFeature(250, 'tooltip')).toBe(true);
      expect(supportsFeature(150, 'tooltip')).toBe(false);
    });

    it('checks annotation support (min 500px)', () => {
      expect(supportsFeature(600, 'annotations')).toBe(true);
      expect(supportsFeature(400, 'annotations')).toBe(false);
    });

    it('checks title support (min 300px)', () => {
      expect(supportsFeature(350, 'title')).toBe(true);
      expect(supportsFeature(250, 'title')).toBe(false);
    });

    it('handles exact minimum widths', () => {
      expect(supportsFeature(400, 'legend')).toBe(true);
      expect(supportsFeature(200, 'tooltip')).toBe(true);
    });
  });

  describe('getOptimalChartsPerRow', () => {
    it('returns 1 for mobile widths', () => {
      expect(getOptimalChartsPerRow(500)).toBe(1);
    });

    it('calculates charts per row based on preferred width', () => {
      const result = getOptimalChartsPerRow(1200, 400);
      expect(result).toBeGreaterThan(1);
      expect(result).toBeLessThanOrEqual(4);
    });

    it('respects maximum of 4 charts per row', () => {
      const result = getOptimalChartsPerRow(3000, 400);
      expect(result).toBe(4);
    });

    it('returns at least 1 chart per row', () => {
      const result = getOptimalChartsPerRow(300, 500);
      expect(result).toBe(1);
    });

    it('accounts for gaps between charts', () => {
      const result = getOptimalChartsPerRow(848, 400); // 2 * 400 + 24 gap = 824
      expect(result).toBe(2);
    });
  });

  describe('Integration Tests', () => {
    it('margins + inner dimensions equal total dimensions', () => {
      const totalWidth = 800;
      const totalHeight = 400;
      const margins = calculateChartMargins(totalWidth, totalHeight, true, true);
      const inner = calculateInnerDimensions(totalWidth, totalHeight, margins);

      expect(inner.width + margins.left + margins.right).toBe(totalWidth);
      expect(inner.height + margins.top + margins.bottom).toBe(totalHeight);
    });

    it('chart grid fits within container', () => {
      const containerWidth = 1200;
      const grid = calculateChartGrid(6, containerWidth);

      const totalWidth = grid.chartWidth * grid.columns + grid.gap * (grid.columns - 1);
      expect(totalWidth).toBeLessThanOrEqual(containerWidth);
    });

    it('aspect ratio dimensions fit in calculated chart dimensions', () => {
      const grid = calculateChartGrid(4, 1200);
      const aspectDims = calculateChartDimensions(
        grid.chartWidth,
        grid.chartHeight,
        aspectRatios['16:9']
      );

      expect(aspectDims.width).toBeLessThanOrEqual(grid.chartWidth);
      expect(aspectDims.height).toBeLessThanOrEqual(grid.chartHeight);
    });
  });

  describe('Edge Cases', () => {
    it('handles very small containers', () => {
      const margins = calculateChartMargins(200, 100, true, true);
      const inner = calculateInnerDimensions(200, 100, margins);

      // Should still return valid dimensions (even if tiny)
      expect(inner.width).toBeGreaterThanOrEqual(0);
      expect(inner.height).toBeGreaterThanOrEqual(0);
    });

    it('handles very large containers', () => {
      const margins = calculateChartMargins(3000, 2000, true, true);

      // Margins should be clamped (not excessively large)
      expect(margins.left).toBeLessThan(200);
      expect(margins.bottom).toBeLessThan(150);
    });

    it('handles extreme aspect ratios', () => {
      const ultraWide = calculateChartDimensions(1000, 400, 5);
      expect(ultraWide.width).toBeLessThanOrEqual(1000);
      expect(ultraWide.height).toBeLessThanOrEqual(400);

      const ultraTall = calculateChartDimensions(400, 1000, 0.2);
      expect(ultraTall.width).toBeLessThanOrEqual(400);
      expect(ultraTall.height).toBeLessThanOrEqual(1000);
    });
  });

  describe('Responsive Behavior', () => {
    it('chart height increases with breakpoint', () => {
      const heightSm = getResponsiveChartHeight(500); // sm
      const heightMd = getResponsiveChartHeight(768); // md
      const heightXl = getResponsiveChartHeight(1280); // xl

      expect(heightMd).toBeGreaterThan(heightSm);
      expect(heightXl).toBeGreaterThan(heightMd);
    });

    it('grid columns increase with breakpoint', () => {
      const gridSm = calculateChartGrid(6, 500);  // sm
      const gridMd = calculateChartGrid(6, 768);  // md
      const gridXl = calculateChartGrid(6, 1280); // xl

      expect(gridMd.columns).toBeGreaterThan(gridSm.columns);
      expect(gridXl.columns).toBeGreaterThan(gridMd.columns);
    });

    it('feature support correlates with width', () => {
      expect(supportsFeature(150, 'tooltip')).toBe(false);
      expect(supportsFeature(250, 'tooltip')).toBe(true);

      expect(supportsFeature(350, 'legend')).toBe(false);
      expect(supportsFeature(450, 'legend')).toBe(true);
    });
  });
});
