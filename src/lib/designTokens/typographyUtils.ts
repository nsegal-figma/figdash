/**
 * Typography Utilities
 * Functions for formatting numbers, dates, and text in charts
 */

/**
 * Format number with abbreviation (K, M, B, T)
 * @param value - Number to format
 * @param precision - Decimal places (default: 1)
 * @returns Formatted string (e.g., "1.2M", "345K")
 */
export function formatNumberAbbreviated(value: number, precision = 1): string {
  if (value === 0) return '0';

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000_000_000) {
    return sign + (abs / 1_000_000_000_000).toFixed(precision) + 'T';
  } else if (abs >= 1_000_000_000) {
    return sign + (abs / 1_000_000_000).toFixed(precision) + 'B';
  } else if (abs >= 1_000_000) {
    return sign + (abs / 1_000_000).toFixed(precision) + 'M';
  } else if (abs >= 1_000) {
    return sign + (abs / 1_000).toFixed(precision) + 'K';
  } else {
    return sign + abs.toFixed(precision);
  }
}

/**
 * Format number with locale-specific formatting
 * @param value - Number to format
 * @param locale - Locale string (default: 'en-US')
 * @param options - Intl.NumberFormat options
 * @returns Formatted string (e.g., "1,234.56")
 */
export function formatNumber(
  value: number,
  locale = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format number as percentage
 * @param value - Number to format (0-1 or 0-100)
 * @param precision - Decimal places (default: 0)
 * @param asDecimal - If true, treats 0.5 as 50% (default: true)
 * @returns Formatted string (e.g., "75%", "12.5%")
 */
export function formatPercentage(
  value: number,
  precision = 0,
  asDecimal = true
): string {
  const percent = asDecimal ? value * 100 : value;
  return percent.toFixed(precision) + '%';
}

/**
 * Format number as currency
 * @param value - Number to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted string (e.g., "$1,234.56", "€1.234,56")
 */
export function formatCurrency(
  value: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format date for chart axes
 * @param date - Date to format
 * @param format - Format type ('short', 'medium', 'long', 'time')
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted string
 */
export function formatDate(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' | 'time' = 'short',
  locale = 'en-US'
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (format === 'time') {
    return d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const options: Intl.DateTimeFormatOptions =
    format === 'short'
      ? { month: 'short', day: 'numeric' }
      : format === 'medium'
        ? { month: 'short', day: 'numeric', year: 'numeric' }
        : { month: 'long', day: 'numeric', year: 'numeric' };

  return d.toLocaleDateString(locale, options);
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length including ellipsis
 * @returns Truncated string (e.g., "Long text name...")
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Get responsive font size based on container width
 * @param containerWidth - Width of container in pixels
 * @param baseSize - Base font size at reference width
 * @param referenceWidth - Reference width in pixels (default: 800)
 * @returns Scaled font size in pixels
 */
export function getResponsiveFontSize(
  containerWidth: number,
  baseSize: number,
  referenceWidth = 800
): number {
  const scale = containerWidth / referenceWidth;
  const clampedScale = Math.max(0.7, Math.min(scale, 1.3)); // Clamp between 70% and 130%
  return Math.round(baseSize * clampedScale);
}

/**
 * Format number with fixed decimal places and monospace styling
 * Useful for tabular data in tooltips
 * @param value - Number to format
 * @param decimals - Decimal places (default: 2)
 * @returns Object with formatted value and monospace flag
 */
export function formatMonospaceNumber(value: number, decimals = 2): {
  value: string;
  monospace: boolean;
} {
  return {
    value: value.toFixed(decimals),
    monospace: true,
  };
}

/**
 * Format large number with compact notation
 * Uses Intl.NumberFormat with compact display
 * @param value - Number to format
 * @param locale - Locale string (default: 'en-US')
 * @returns Compact format (e.g., "1.2M", "345K", "12.3B")
 */
export function formatCompactNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Smart number formatter - chooses best format based on value
 * @param value - Number to format
 * @param options - Formatting options
 * @returns Best formatted representation
 */
export function formatSmartNumber(
  value: number,
  options?: {
    abbreviate?: boolean;
    decimals?: number;
    locale?: string;
  }
): string {
  const { abbreviate = true, decimals = 1, locale = 'en-US' } = options || {};

  // Handle edge cases
  if (!isFinite(value)) return 'N/A';
  if (value === 0) return '0';

  // For very small or very large numbers, use abbreviation
  if (abbreviate && (Math.abs(value) >= 1000 || Math.abs(value) < 0.01)) {
    return formatNumberAbbreviated(value, decimals);
  }

  // For normal range numbers, use locale formatting
  return formatNumber(value, locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}
