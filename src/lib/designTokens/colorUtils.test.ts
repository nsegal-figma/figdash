import { describe, it, expect } from 'vitest';
import {
  generateSequentialScale,
  generateDivergingScale,
  generateCategoricalPalette,
  adjustBrightness,
  simulateColorBlindness,
  checkColorBlindAccessibility,
  autoAdjustContrast,
  generateDarkModeVariant,
  generateDarkModePalette,
  getContrastRatio,
  meetsWCAG_AA,
} from './colorUtils';

describe('Color Utilities', () => {
  describe('generateSequentialScale', () => {
    it('generates correct number of colors', () => {
      const scale = generateSequentialScale('#3B82F6', 10);
      expect(scale).toHaveLength(10);
    });

    it('generates lighter colors at start, darker at end', () => {
      const scale = generateSequentialScale('#3B82F6', 5);
      // First color should be lighter (closer to white)
      expect(scale[0]).toMatch(/#[E-F]/i); // Starts with E or F (light)
      // Last color should be darker
      expect(parseInt(scale[4].slice(1, 3), 16)).toBeLessThan(100); // Dark
    });

    it('all generated colors are valid hex codes', () => {
      const scale = generateSequentialScale('#3B82F6', 10);
      scale.forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/);
      });
    });
  });

  describe('generateDivergingScale', () => {
    it('generates correct number of colors', () => {
      const scale = generateDivergingScale('#DC2626', '#22C55E', 9);
      expect(scale).toHaveLength(9);
    });

    it('has neutral color in center', () => {
      const scale = generateDivergingScale('#DC2626', '#22C55E', 9);
      const midPoint = Math.floor(scale.length / 2);
      expect(scale[midPoint]).toBe('#E5E7EB'); // Gray-200 neutral
    });

    it('throws error for even number of steps', () => {
      expect(() => generateDivergingScale('#DC2626', '#22C55E', 10)).toThrow();
    });

    it('all generated colors are valid hex codes', () => {
      const scale = generateDivergingScale('#DC2626', '#22C55E', 7);
      scale.forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/);
      });
    });
  });

  describe('generateCategoricalPalette', () => {
    it('generates correct number of colors', () => {
      expect(generateCategoricalPalette(5)).toHaveLength(5);
      expect(generateCategoricalPalette(12)).toHaveLength(12);
    });

    it('throws error for invalid count', () => {
      expect(() => generateCategoricalPalette(1)).toThrow();
      expect(() => generateCategoricalPalette(15)).toThrow();
    });

    it('returns distinct colors (no duplicates)', () => {
      const palette = generateCategoricalPalette(7);
      const unique = new Set(palette);
      expect(unique.size).toBe(7);
    });

    it('all colors are valid hex codes', () => {
      const palette = generateCategoricalPalette(8);
      palette.forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/);
      });
    });
  });

  describe('adjustBrightness', () => {
    it('darkens color with negative factor', () => {
      const original = '#3B82F6';
      const darkened = adjustBrightness(original, -0.3);

      const origRgb = parseInt(original.slice(1), 16);
      const darkRgb = parseInt(darkened.slice(1), 16);

      expect(darkRgb).toBeLessThan(origRgb);
    });

    it('lightens color with positive factor', () => {
      const original = '#3B82F6';
      const lightened = adjustBrightness(original, 0.3);

      const origRgb = parseInt(original.slice(1), 16);
      const lightRgb = parseInt(lightened.slice(1), 16);

      expect(lightRgb).toBeGreaterThan(origRgb);
    });

    it('returns valid hex color', () => {
      const result = adjustBrightness('#3B82F6', 0.5);
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });
  });

  describe('simulateColorBlindness', () => {
    it('transforms color for protanopia (red-blind)', () => {
      const original = '#DC2626'; // Red
      const simulated = simulateColorBlindness(original, 'protanopia');
      expect(simulated).not.toBe(original);
      expect(simulated).toMatch(/^#[0-9A-F]{6}$/);
    });

    it('transforms color for deuteranopia (green-blind)', () => {
      const original = '#22C55E'; // Green
      const simulated = simulateColorBlindness(original, 'deuteranopia');
      expect(simulated).not.toBe(original);
      expect(simulated).toMatch(/^#[0-9A-F]{6}$/);
    });

    it('transforms color for tritanopia (blue-blind)', () => {
      const original = '#3B82F6'; // Blue
      const simulated = simulateColorBlindness(original, 'tritanopia');
      expect(simulated).not.toBe(original);
      expect(simulated).toMatch(/^#[0-9A-F]{6}$/);
    });
  });

  describe('checkColorBlindAccessibility', () => {
    it('validates accessible categorical palette', () => {
      const palette = ['#3B82F6', '#059669', '#D97706', '#8B5CF6'];
      const result = checkColorBlindAccessibility(palette);

      expect(result).toHaveProperty('protanopia');
      expect(result).toHaveProperty('deuteranopia');
      expect(result).toHaveProperty('tritanopia');
      expect(result).toHaveProperty('issues');
      expect(Array.isArray(result.issues)).toBe(true);
    });

    it('detects similar colors', () => {
      // Two very similar colors should fail
      const palette = ['#3B82F6', '#3B82F5']; // Almost identical
      const result = checkColorBlindAccessibility(palette);

      // Should detect issues for at least one type
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('autoAdjustContrast', () => {
    it('adjusts color to meet WCAG AA target', () => {
      const foreground = '#CCCCCC'; // Light gray (insufficient contrast on white)
      const background = '#FFFFFF';
      const adjusted = autoAdjustContrast(foreground, background, 4.5);

      const ratio = getContrastRatio(adjusted, background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('returns original color if already meets target', () => {
      const foreground = '#000000'; // Black (high contrast on white)
      const background = '#FFFFFF';
      const adjusted = autoAdjustContrast(foreground, background, 4.5);

      expect(adjusted).toBe(foreground);
    });

    it('returns valid hex color', () => {
      const adjusted = autoAdjustContrast('#CCCCCC', '#FFFFFF', 4.5);
      expect(adjusted).toMatch(/^#[0-9A-F]{6}$/);
    });

    it('adjusted color meets WCAG AA', () => {
      const adjusted = autoAdjustContrast('#AAAAAA', '#FFFFFF', 4.5);
      expect(meetsWCAG_AA(adjusted, '#FFFFFF', false)).toBe(true);
    });
  });

  describe('generateDarkModeVariant', () => {
    it('generates lighter variant for dark backgrounds', () => {
      const lightMode = '#3B82F6';
      const darkMode = generateDarkModeVariant(lightMode);

      const lightRgb = parseInt(lightMode.slice(1), 16);
      const darkRgb = parseInt(darkMode.slice(1), 16);

      expect(darkRgb).toBeGreaterThan(lightRgb); // Lighter
    });

    it('dark mode variant meets WCAG AA on dark background', () => {
      const darkVariant = generateDarkModeVariant('#3B82F6');
      const darkBg = '#1F2937'; // gray-800

      expect(meetsWCAG_AA(darkVariant, darkBg, false)).toBe(true);
    });

    it('returns valid hex color', () => {
      const darkVariant = generateDarkModeVariant('#3B82F6');
      expect(darkVariant).toMatch(/^#[0-9A-F]{6}$/);
    });
  });

  describe('generateDarkModePalette', () => {
    it('generates dark mode variant for each light color', () => {
      const lightPalette = ['#3B82F6', '#059669', '#D97706'];
      const darkPalette = generateDarkModePalette(lightPalette);

      expect(darkPalette).toHaveLength(lightPalette.length);
    });

    it('all dark mode colors are lighter than light mode', () => {
      const lightPalette = ['#3B82F6', '#059669'];
      const darkPalette = generateDarkModePalette(lightPalette);

      darkPalette.forEach((dark, i) => {
        const lightRgb = parseInt(lightPalette[i].slice(1), 16);
        const darkRgb = parseInt(dark.slice(1), 16);
        expect(darkRgb).toBeGreaterThan(lightRgb);
      });
    });

    it('all dark mode colors are valid hex codes', () => {
      const darkPalette = generateDarkModePalette(['#3B82F6', '#059669', '#D97706']);
      darkPalette.forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/);
      });
    });
  });
});
