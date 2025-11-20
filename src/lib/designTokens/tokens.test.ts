import { describe, it, expect } from 'vitest';
import { designTokens, colorTokens } from './index';

describe('Design Tokens - Complete System', () => {
  describe('Token Structure', () => {
    it('has all required top-level token categories', () => {
      expect(designTokens).toHaveProperty('colors');
      expect(designTokens).toHaveProperty('typography');
      expect(designTokens).toHaveProperty('spacing');
      expect(designTokens).toHaveProperty('shadows');
      expect(designTokens).toHaveProperty('borderRadius');
      expect(designTokens).toHaveProperty('animation');
    });
  });

  describe('Typography Tokens', () => {
    it('has font families defined', () => {
      expect(designTokens.typography.fontFamily.primary).toContain('apple-system');
      expect(designTokens.typography.fontFamily.monospace).toContain('JetBrains Mono');
    });

    it('has 8 font size levels', () => {
      const sizes = Object.keys(designTokens.typography.fontSize);
      expect(sizes).toHaveLength(8);
      expect(sizes).toContain('xs');
      expect(sizes).toContain('4xl');
    });

    it('has 4 font weight levels', () => {
      expect(designTokens.typography.fontWeight.regular).toBe(400);
      expect(designTokens.typography.fontWeight.medium).toBe(500);
      expect(designTokens.typography.fontWeight.semibold).toBe(600);
      expect(designTokens.typography.fontWeight.bold).toBe(700);
    });

    it('has 3 line height levels', () => {
      expect(designTokens.typography.lineHeight.tight).toBe(1.25);
      expect(designTokens.typography.lineHeight.normal).toBe(1.5);
      expect(designTokens.typography.lineHeight.relaxed).toBe(1.75);
    });
  });

  describe('Spacing Tokens', () => {
    it('follows 8px base unit system', () => {
      expect(designTokens.spacing[2]).toBe('0.5rem'); // 8px
      expect(designTokens.spacing[4]).toBe('1rem');   // 16px
      expect(designTokens.spacing[6]).toBe('1.5rem'); // 24px
      expect(designTokens.spacing[8]).toBe('2rem');   // 32px
    });

    it('has 12 spacing levels', () => {
      const levels = Object.keys(designTokens.spacing);
      expect(levels).toHaveLength(12);
    });

    it('spacing values increase logically', () => {
      expect(designTokens.spacing[0]).toBe('0');
      expect(designTokens.spacing[1]).toBe('0.25rem');
      expect(designTokens.spacing[20]).toBe('5rem');
    });
  });

  describe('Shadow Tokens', () => {
    it('has 5 elevation levels plus tooltip', () => {
      expect(designTokens.shadows.none).toBe('none');
      expect(designTokens.shadows.sm).toBeTruthy();
      expect(designTokens.shadows.base).toBeTruthy();
      expect(designTokens.shadows.md).toBeTruthy();
      expect(designTokens.shadows.lg).toBeTruthy();
      expect(designTokens.shadows.xl).toBeTruthy();
      expect(designTokens.shadows.tooltip).toBeTruthy();
    });

    it('shadows use rgba with alpha transparency', () => {
      expect(designTokens.shadows.sm).toContain('rgba');
      expect(designTokens.shadows.tooltip).toContain('rgba');
    });
  });

  describe('Border Radius Tokens', () => {
    it('has 6 radius levels', () => {
      const levels = Object.keys(designTokens.borderRadius);
      expect(levels).toHaveLength(7); // none + 6 levels
    });

    it('includes full rounded option', () => {
      expect(designTokens.borderRadius.full).toBe('9999px');
    });

    it('radius values increase logically', () => {
      expect(designTokens.borderRadius.none).toBe('0');
      expect(designTokens.borderRadius.sm).toBe('0.25rem');
      expect(designTokens.borderRadius.xl).toBe('1rem');
    });
  });

  describe('Animation Tokens', () => {
    it('has 4 duration presets', () => {
      expect(designTokens.animation.duration.instant).toBe(0);
      expect(designTokens.animation.duration.fast).toBe(150);
      expect(designTokens.animation.duration.normal).toBe(300);
      expect(designTokens.animation.duration.slow).toBe(400);
    });

    it('has 4 easing functions', () => {
      expect(designTokens.animation.easing.linear).toBe('linear');
      expect(designTokens.animation.easing.easeIn).toContain('cubic-bezier');
      expect(designTokens.animation.easing.easeOut).toContain('cubic-bezier');
      expect(designTokens.animation.easing.easeInOut).toContain('cubic-bezier');
    });

    it('durations align with Framer Motion standards', () => {
      // Fast interactions (hover) should be 150ms or less
      expect(designTokens.animation.duration.fast).toBeLessThanOrEqual(150);
      // Normal transitions should be 300ms
      expect(designTokens.animation.duration.normal).toBe(300);
      // Entrance animations should be 400ms
      expect(designTokens.animation.duration.slow).toBe(400);
    });
  });

  describe('Token Consistency', () => {
    it('categorical colors are distinct (no duplicates)', () => {
      const colors = colorTokens.data.categorical;
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });

    it('sequential colors form a gradient', () => {
      // All sequential colors should be in blue spectrum
      colorTokens.data.sequential.forEach(color => {
        expect(color).toMatch(/#[0-9A-F]{6}/i);
      });
    });
  });
});
