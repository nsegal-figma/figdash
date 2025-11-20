/**
 * Chart Primitive Components
 * Reusable building blocks for charts with design tokens applied
 */

export { AxisX } from './AxisX';
export { AxisY } from './AxisY';
export type { AxisXProps } from './AxisX';
export type { AxisYProps } from './AxisY';

// Axis utilities
export {
  calculateOptimalTickCount,
  generateNiceTicks,
  getRecommendedTickRotation,
} from './axisUtils';
