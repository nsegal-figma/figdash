/**
 * Animation Design Tokens
 * Timing and easing functions for chart animations
 */

import type { AnimationTokens } from './types';

export const animationTokens: AnimationTokens = {
  duration: {
    instant: 0,      // No animation
    fast: 150,       // Quick feedback (hover states)
    normal: 300,     // Standard transitions (data updates)
    slow: 400,       // Entrance animations
  },

  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',        // Accelerate
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',       // Decelerate (default)
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',   // Smooth curve
  },
};
