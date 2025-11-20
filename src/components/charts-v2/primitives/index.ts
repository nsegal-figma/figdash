/**
 * Chart Primitive Components
 * Reusable building blocks for charts with design tokens applied
 */

export { AxisX } from './AxisX';
export { AxisY } from './AxisY';
export { Grid, GridRows, GridColumns } from './Grid';
export type { AxisXProps } from './AxisX';
export type { AxisYProps } from './AxisY';
export type { GridProps } from './Grid';

// Axis utilities
export {
  calculateOptimalTickCount,
  generateNiceTicks,
  getRecommendedTickRotation,
} from './axisUtils';
