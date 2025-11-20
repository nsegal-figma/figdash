import { describe, it, expect } from 'vitest';
import {
  calculateOptimalTickCount,
  generateNiceTicks,
  getRecommendedTickRotation,
} from './axisUtils';

describe('Axis Utilities', () => {
  describe('calculateOptimalTickCount', () => {
    it('calculates ticks for horizontal axis', () => {
      const count = calculateOptimalTickCount(800, 'horizontal');
      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(10);
    });

    it('calculates ticks for vertical axis', () => {
      const count = calculateOptimalTickCount(400, 'vertical');
      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(10);
    });

    it('returns minimum 3 ticks for small axes', () => {
      const count = calculateOptimalTickCount(100, 'horizontal');
      expect(count).toBe(3);
    });

    it('returns maximum 10 ticks for large axes', () => {
      const count = calculateOptimalTickCount(2000, 'horizontal');
      expect(count).toBe(10);
    });

    it('vertical axis allows more ticks (smaller min spacing)', () => {
      const horizontal = calculateOptimalTickCount(400, 'horizontal');
      const vertical = calculateOptimalTickCount(400, 'vertical');

      expect(vertical).toBeGreaterThanOrEqual(horizontal);
    });
  });

  describe('generateNiceTicks', () => {
    it('generates round numbers', () => {
      const ticks = generateNiceTicks(0, 100, 5);

      expect(ticks).toContain(0);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(100);

      // Verify ticks are evenly spaced
      const step = ticks[1] - ticks[0];
      for (let i = 2; i < ticks.length; i++) {
        expect(ticks[i] - ticks[i - 1]).toBeCloseTo(step, 8);
      }
    });

    it('handles data range 0-10', () => {
      const ticks = generateNiceTicks(0, 10, 5);

      expect(ticks).toContain(0);
      expect(ticks).toContain(10);
      expect(ticks.length).toBeGreaterThanOrEqual(3);
    });

    it('handles data range 1-99', () => {
      const ticks = generateNiceTicks(1, 99, 5);

      expect(ticks[0]).toBeLessThanOrEqual(1);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(99);
    });

    it('handles negative values', () => {
      const ticks = generateNiceTicks(-50, 50, 5);

      expect(ticks).toContain(0);
      expect(ticks[0]).toBeLessThanOrEqual(-50);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(50);
    });

    it('handles same min and max', () => {
      const ticks = generateNiceTicks(42, 42, 5);

      expect(ticks).toEqual([42]);
    });

    it('handles large numbers', () => {
      const ticks = generateNiceTicks(0, 1_000_000, 5);

      expect(ticks).toContain(0);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(1_000_000);

      // Verify all ticks are round numbers (multiples of some nice step)
      const step = ticks[1] - ticks[0];
      expect(step).toBeGreaterThan(0);
      expect(step % 100_000 === 0 || step % 200_000 === 0 || step % 250_000 === 0).toBe(true);
    });

    it('handles decimal ranges', () => {
      const ticks = generateNiceTicks(0, 1, 5);

      expect(ticks).toContain(0);
      expect(ticks).toContain(1);
      expect(ticks.length).toBeGreaterThanOrEqual(3);
    });

    it('returns sorted ticks', () => {
      const ticks = generateNiceTicks(0, 100, 5);

      for (let i = 1; i < ticks.length; i++) {
        expect(ticks[i]).toBeGreaterThan(ticks[i - 1]);
      }
    });
  });

  describe('getRecommendedTickRotation', () => {
    it('returns 0 for short labels with enough space', () => {
      const labels = ['A', 'B', 'C', 'D', 'E'];
      const rotation = getRecommendedTickRotation(labels, 500, 5);

      expect(rotation).toBe(0);
    });

    it('returns non-zero rotation for medium-length labels in tight space', () => {
      const labels = ['Category 1', 'Category 2', 'Category 3', 'Category 4'];
      const rotation = getRecommendedTickRotation(labels, 300, 4); // Tighter space

      expect([45, 90]).toContain(rotation); // Either diagonal or vertical
    });

    it('returns 90 for long labels or tight spacing', () => {
      const labels = ['Very Long Category Name 1', 'Very Long Category Name 2'];
      const rotation = getRecommendedTickRotation(labels, 200, 2);

      expect(rotation).toBe(90);
    });

    it('handles empty labels array', () => {
      const rotation = getRecommendedTickRotation([], 400, 0);

      expect(rotation).toBe(0);
    });

    it('handles single label', () => {
      const labels = ['Single'];
      const rotation = getRecommendedTickRotation(labels, 100, 1);

      expect(rotation).toBe(0); // Plenty of space for one label
    });

    it('returns valid rotation angles', () => {
      const labels = ['Label 1', 'Label 2', 'Label 3'];
      const rotation = getRecommendedTickRotation(labels, 300, 3);

      expect([0, 45, 90]).toContain(rotation);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero-length axis', () => {
      const count = calculateOptimalTickCount(0, 'horizontal');
      expect(count).toBe(3); // Minimum
    });

    it('handles negative axis length', () => {
      const count = calculateOptimalTickCount(-100, 'horizontal');
      expect(count).toBe(3); // Minimum (absolute value used internally)
    });

    it('handles reversed min/max', () => {
      const ticks = generateNiceTicks(100, 0, 5);

      // Should still work (swap internally or handle gracefully)
      expect(ticks.length).toBeGreaterThan(0);
    });

    it('handles very small decimal range', () => {
      const ticks = generateNiceTicks(0.001, 0.009, 5);

      expect(ticks.length).toBeGreaterThan(0);
      expect(ticks[0]).toBeLessThanOrEqual(0.001);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(0.009);
    });
  });
});
