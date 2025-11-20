import { describe, it, expect } from 'vitest';
import { colorTokens, getContrastRatio, meetsWCAG_AA } from './colors';

describe('Design Tokens - Colors', () => {
  describe('Data Visualization Palette', () => {
    it('has 7 categorical colors', () => {
      expect(colorTokens.data.categorical).toHaveLength(7);
    });

    it('has 10 sequential colors', () => {
      expect(colorTokens.data.sequential).toHaveLength(10);
    });

    it('has 9 diverging colors', () => {
      expect(colorTokens.data.diverging).toHaveLength(9);
    });

    it('all categorical colors are valid hex codes', () => {
      colorTokens.data.categorical.forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('WCAG AA Contrast Compliance', () => {
    it('all categorical colors meet WCAG AA on white background', () => {
      const white = '#FFFFFF';
      colorTokens.data.categorical.forEach(color => {
        const ratio = getContrastRatio(color, white);
        expect(ratio).toBeGreaterThanOrEqual(3.0); // AA for graphics (3:1)
      });
    });

    it('all categorical colors meet WCAG AA on gray-50 background', () => {
      const gray50 = '#F9FAFB';
      colorTokens.data.categorical.forEach(color => {
        const ratio = getContrastRatio(color, gray50);
        expect(ratio).toBeGreaterThanOrEqual(3.0); // AA for graphics (3:1)
      });
    });

    it('semantic colors meet WCAG AA', () => {
      const white = '#FFFFFF';
      expect(getContrastRatio(colorTokens.semantic.success, white)).toBeGreaterThanOrEqual(3.0);
      expect(getContrastRatio(colorTokens.semantic.warning, white)).toBeGreaterThanOrEqual(3.0);
      expect(getContrastRatio(colorTokens.semantic.error, white)).toBeGreaterThanOrEqual(3.0);
      expect(getContrastRatio(colorTokens.semantic.info, white)).toBeGreaterThanOrEqual(3.0);
    });

    it('text colors (gray-500+) meet WCAG AA for normal text on white', () => {
      const white = '#FFFFFF';
      expect(getContrastRatio(colorTokens.neutral.text[500], white)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(colorTokens.neutral.text[600], white)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(colorTokens.neutral.text[700], white)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(colorTokens.neutral.text[800], white)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(colorTokens.neutral.text[900], white)).toBeGreaterThanOrEqual(4.5);
    });

    it('tooltip text has sufficient contrast', () => {
      const ratio = getContrastRatio(
        colorTokens.chart.tooltip.text,
        colorTokens.chart.tooltip.background
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5); // AA for normal text
    });
  });

  describe('Contrast Ratio Calculation', () => {
    it('calculates correct ratio for black on white', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 1); // Maximum contrast
    });

    it('calculates correct ratio for white on white', () => {
      const ratio = getContrastRatio('#FFFFFF', '#FFFFFF');
      expect(ratio).toBe(1); // No contrast
    });

    it('handles order independence', () => {
      const ratio1 = getContrastRatio('#3B82F6', '#FFFFFF');
      const ratio2 = getContrastRatio('#FFFFFF', '#3B82F6');
      expect(ratio1).toBe(ratio2);
    });
  });

  describe('WCAG AA Helper', () => {
    it('validates normal text correctly', () => {
      expect(meetsWCAG_AA('#000000', '#FFFFFF', false)).toBe(true); // Black on white
      expect(meetsWCAG_AA('#CCCCCC', '#FFFFFF', false)).toBe(false); // Light gray on white
    });

    it('validates large text correctly', () => {
      expect(meetsWCAG_AA('#757575', '#FFFFFF', true)).toBe(true); // 3.0:1 passes for large text
      expect(meetsWCAG_AA('#CCCCCC', '#FFFFFF', true)).toBe(false); // Still fails
    });
  });

  describe('Semantic Color Consistency', () => {
    it('success colors use green spectrum', () => {
      expect(colorTokens.semantic.success).toMatch(/#059669/i); // Darkened for WCAG AA
      expect(colorTokens.semantic.successDark).toMatch(/#047857/i);
    });

    it('warning colors use orange spectrum', () => {
      expect(colorTokens.semantic.warning).toMatch(/#D97706/i); // Darkened for WCAG AA
      expect(colorTokens.semantic.warningDark).toMatch(/#B45309/i);
    });

    it('error colors use red spectrum', () => {
      expect(colorTokens.semantic.error).toMatch(/#EF4444/i);
      expect(colorTokens.semantic.errorDark).toMatch(/#DC2626/i);
    });
  });
});
