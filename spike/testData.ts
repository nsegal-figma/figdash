// Test data for visualization library evaluation
// 100 data points as specified in acceptance criteria

export const testData = Array.from({ length: 100 }, (_, i) => ({
  label: `Item ${i + 1}`,
  value: Math.floor(Math.random() * 100),
}));

export interface DataPoint {
  label: string;
  value: number;
}
