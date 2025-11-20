import { describe, it, expect } from 'vitest';
import {
  formatNumberAbbreviated,
  formatNumber,
  formatPercentage,
  formatCurrency,
  formatDate,
  truncateText,
  getResponsiveFontSize,
  formatMonospaceNumber,
  formatCompactNumber,
  formatSmartNumber,
} from './typographyUtils';

describe('Typography Utilities', () => {
  describe('formatNumberAbbreviated', () => {
    it('formats thousands with K', () => {
      expect(formatNumberAbbreviated(1000)).toBe('1.0K');
      expect(formatNumberAbbreviated(1500)).toBe('1.5K');
      expect(formatNumberAbbreviated(345000)).toBe('345.0K');
    });

    it('formats millions with M', () => {
      expect(formatNumberAbbreviated(1_000_000)).toBe('1.0M');
      expect(formatNumberAbbreviated(1_234_567)).toBe('1.2M');
      expect(formatNumberAbbreviated(12_500_000)).toBe('12.5M');
    });

    it('formats billions with B', () => {
      expect(formatNumberAbbreviated(1_000_000_000)).toBe('1.0B');
      expect(formatNumberAbbreviated(5_600_000_000)).toBe('5.6B');
    });

    it('formats trillions with T', () => {
      expect(formatNumberAbbreviated(1_000_000_000_000)).toBe('1.0T');
      expect(formatNumberAbbreviated(3_450_000_000_000)).toBe('3.5T');
    });

    it('handles zero', () => {
      expect(formatNumberAbbreviated(0)).toBe('0');
    });

    it('handles negative numbers', () => {
      expect(formatNumberAbbreviated(-1000)).toBe('-1.0K');
      expect(formatNumberAbbreviated(-1_500_000)).toBe('-1.5M');
    });

    it('handles small numbers without abbreviation', () => {
      expect(formatNumberAbbreviated(999)).toBe('999.0');
      expect(formatNumberAbbreviated(42)).toBe('42.0');
    });

    it('respects precision parameter', () => {
      expect(formatNumberAbbreviated(1234, 0)).toBe('1K');
      expect(formatNumberAbbreviated(1234, 2)).toBe('1.23K');
    });
  });

  describe('formatNumber', () => {
    it('formats with thousand separators (en-US)', () => {
      const result = formatNumber(1234.56, 'en-US');
      expect(result).toBe('1,234.56');
    });

    it('formats with custom options', () => {
      const result = formatNumber(1234.5678, 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      expect(result).toBe('1,234.57');
    });
  });

  describe('formatPercentage', () => {
    it('formats decimal as percentage', () => {
      expect(formatPercentage(0.75)).toBe('75%');
      expect(formatPercentage(0.123)).toBe('12%');
    });

    it('formats whole number as percentage', () => {
      expect(formatPercentage(75, 0, false)).toBe('75%');
      expect(formatPercentage(12.5, 1, false)).toBe('12.5%');
    });

    it('respects precision parameter', () => {
      expect(formatPercentage(0.12345, 2)).toBe('12.35%');
      expect(formatPercentage(0.12345, 0)).toBe('12%');
    });

    it('handles edge cases', () => {
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(1)).toBe('100%');
    });
  });

  describe('formatCurrency', () => {
    it('formats USD currency', () => {
      const result = formatCurrency(1234.56, 'USD', 'en-US');
      expect(result).toContain('1,234.56');
      expect(result).toContain('$');
    });

    it('formats EUR currency', () => {
      const result = formatCurrency(1234.56, 'EUR', 'de-DE');
      expect(result).toContain('1');
      expect(result).toContain('€');
    });

    it('handles zero', () => {
      const result = formatCurrency(0, 'USD', 'en-US');
      expect(result).toContain('0');
    });

    it('handles negative amounts', () => {
      const result = formatCurrency(-1234.56, 'USD', 'en-US');
      expect(result).toContain('1,234.56');
      expect(result).toMatch(/-|\(.*\)/); // Negative sign or parentheses
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2025-11-20T12:00:00');

    it('formats short date', () => {
      const result = formatDate(testDate, 'short');
      expect(result).toContain('Nov');
      expect(result).toContain('20');
    });

    it('formats medium date', () => {
      const result = formatDate(testDate, 'medium');
      expect(result).toContain('Nov');
      expect(result).toContain('20');
      expect(result).toContain('2025');
    });

    it('formats long date', () => {
      const result = formatDate(testDate, 'long');
      expect(result).toContain('November');
      expect(result).toContain('20');
      expect(result).toContain('2025');
    });

    it('formats time', () => {
      const result = formatDate(testDate, 'time');
      expect(result).toMatch(/\d{1,2}:\d{2}/); // HH:MM format
    });

    it('handles string dates', () => {
      const result = formatDate('2025-11-20', 'short');
      expect(result).toContain('Nov');
    });

    it('handles timestamp numbers', () => {
      const result = formatDate(testDate.getTime(), 'short');
      expect(result).toContain('Nov');
    });
  });

  describe('truncateText', () => {
    it('truncates long text', () => {
      const result = truncateText('This is a very long text', 15);
      expect(result).toBe('This is a ve...');
      expect(result.length).toBe(15);
    });

    it('does not truncate short text', () => {
      const result = truncateText('Short', 10);
      expect(result).toBe('Short');
    });

    it('handles exact length', () => {
      const result = truncateText('Exactly10!', 10);
      expect(result).toBe('Exactly10!');
    });

    it('handles edge case maxLength <= 3', () => {
      const result = truncateText('Text', 3);
      expect(result).toBe('...');
    });

    it('handles empty string', () => {
      const result = truncateText('', 10);
      expect(result).toBe('');
    });
  });

  describe('getResponsiveFontSize', () => {
    it('returns base size at reference width', () => {
      const result = getResponsiveFontSize(800, 14, 800);
      expect(result).toBe(14);
    });

    it('scales down for smaller widths', () => {
      const result = getResponsiveFontSize(400, 14, 800); // Half width
      expect(result).toBeLessThan(14);
    });

    it('scales up for larger widths', () => {
      const result = getResponsiveFontSize(1200, 14, 800); // 1.5x width
      expect(result).toBeGreaterThan(14);
    });

    it('clamps minimum scale to 70%', () => {
      const result = getResponsiveFontSize(200, 14, 800); // Very small
      expect(result).toBeGreaterThanOrEqual(10); // 70% of 14 ≈ 10
    });

    it('clamps maximum scale to 130%', () => {
      const result = getResponsiveFontSize(2000, 14, 800); // Very large
      expect(result).toBeLessThanOrEqual(18); // 130% of 14 ≈ 18
    });

    it('returns integer values', () => {
      const result = getResponsiveFontSize(500, 14, 800);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('formatMonospaceNumber', () => {
    it('formats with fixed decimals', () => {
      const result = formatMonospaceNumber(123.456);
      expect(result.value).toBe('123.46');
      expect(result.monospace).toBe(true);
    });

    it('respects decimals parameter', () => {
      const result = formatMonospaceNumber(123.456, 0);
      expect(result.value).toBe('123');
    });

    it('pads decimals', () => {
      const result = formatMonospaceNumber(123, 2);
      expect(result.value).toBe('123.00');
    });

    it('always sets monospace flag', () => {
      expect(formatMonospaceNumber(42).monospace).toBe(true);
    });
  });

  describe('formatCompactNumber', () => {
    it('formats thousands', () => {
      const result = formatCompactNumber(1500);
      expect(result).toMatch(/1\.5K/);
    });

    it('formats millions', () => {
      const result = formatCompactNumber(2_500_000);
      expect(result).toMatch(/2\.5M/);
    });

    it('formats billions', () => {
      const result = formatCompactNumber(3_600_000_000);
      expect(result).toMatch(/3\.6B/);
    });

    it('handles small numbers', () => {
      const result = formatCompactNumber(42);
      expect(result).toBe('42');
    });
  });

  describe('formatSmartNumber', () => {
    it('abbreviates large numbers', () => {
      const result = formatSmartNumber(1_234_567);
      expect(result).toContain('M');
    });

    it('formats small numbers normally', () => {
      const result = formatSmartNumber(123.45);
      expect(result).toBe('123.5');
    });

    it('handles zero', () => {
      expect(formatSmartNumber(0)).toBe('0');
    });

    it('handles infinity', () => {
      expect(formatSmartNumber(Infinity)).toBe('N/A');
      expect(formatSmartNumber(-Infinity)).toBe('N/A');
    });

    it('handles NaN', () => {
      expect(formatSmartNumber(NaN)).toBe('N/A');
    });

    it('respects abbreviate option', () => {
      const result = formatSmartNumber(1_234_567, { abbreviate: false });
      expect(result).not.toContain('M');
      expect(result).toContain('1,234,567');
    });

    it('handles negative numbers', () => {
      const result = formatSmartNumber(-1_500);
      expect(result).toBe('-1.5K');
    });
  });

  describe('Edge Cases', () => {
    it('handles very large numbers', () => {
      const result = formatNumberAbbreviated(9_999_999_999_999);
      expect(result).toContain('T');
    });

    it('handles very small decimals', () => {
      const result = formatSmartNumber(0.000123, { abbreviate: true });
      expect(result).toBe('0.0'); // Very small, displays as 0.0 (rounds down)
    });

    it('handles special number values', () => {
      expect(formatSmartNumber(Infinity)).toBe('N/A');
      expect(formatSmartNumber(-Infinity)).toBe('N/A');
      expect(formatSmartNumber(NaN)).toBe('N/A');
    });

    it('date formatting handles invalid dates gracefully', () => {
      const result = formatDate(new Date('invalid'), 'short');
      expect(result).toBeTruthy(); // Should return something (Invalid Date string)
    });
  });
});
