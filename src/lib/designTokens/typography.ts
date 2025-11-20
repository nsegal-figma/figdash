/**
 * Typography Design Tokens
 * Defines font families, sizes, weights, and line heights for charts
 */

import type { TypographyTokens } from './types';

export const typographyTokens: TypographyTokens = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
  },

  fontSize: {
    xs: '0.75rem',    // 12px - axis ticks, small labels
    sm: '0.875rem',   // 14px - axis labels, tooltip text
    base: '1rem',     // 16px - chart titles, legend
    lg: '1.125rem',   // 18px - section headings
    xl: '1.25rem',    // 20px - page titles
    '2xl': '1.5rem',  // 24px - dashboard headers
    '3xl': '1.875rem', // 30px - large display text
    '4xl': '2.25rem',  // 36px - hero text
  },

  fontWeight: {
    regular: 400,   // Body text, axis labels
    medium: 500,    // Emphasized labels, legend
    semibold: 600,  // Chart titles, section headers
    bold: 700,      // Dashboard headers, callouts
  },

  lineHeight: {
    tight: 1.25,    // Compact labels, axis ticks
    normal: 1.5,    // Standard text, tooltips
    relaxed: 1.75,  // Headings, titles
  },
};
