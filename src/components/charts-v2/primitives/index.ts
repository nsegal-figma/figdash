/**
 * Chart Primitive Components
 * Reusable building blocks for charts with design tokens applied
 */

export { AxisX } from './AxisX';
export { AxisY } from './AxisY';
export { Grid, GridRows, GridColumns } from './Grid';
export { ChartTooltip } from './ChartTooltip';
export { ChartLegend } from './ChartLegend';
export { ChartContainer } from './ChartContainer';
export { ChartLoading } from './ChartLoading';
export { ChartEmpty } from './ChartEmpty';
export type { AxisXProps } from './AxisX';
export type { AxisYProps } from './AxisY';
export type { GridProps } from './Grid';
export type { ChartTooltipProps } from './ChartTooltip';
export type { ChartLegendProps } from './ChartLegend';
export type { ChartContainerProps } from './ChartContainer';
export type { ChartLoadingProps } from './ChartLoading';
export type { ChartEmptyProps } from './ChartEmpty';

// Axis utilities
export {
  calculateOptimalTickCount,
  generateNiceTicks,
  getRecommendedTickRotation,
} from './axisUtils';
