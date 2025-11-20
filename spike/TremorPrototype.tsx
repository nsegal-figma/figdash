import { BarChart } from '@tremor/react';
import type { DataPoint } from './testData';

interface TremorPrototypeProps {
  data: DataPoint[];
  width?: number;
  height?: number;
}

export function TremorPrototype({ data, width = 600, height = 400 }: TremorPrototypeProps) {
  // Tremor expects specific data format
  const tremorData = data.map(d => ({
    name: d.label,
    value: d.value,
  }));

  return (
    <div style={{ width, height }}>
      <BarChart
        data={tremorData}
        index="name"
        categories={['value']}
        colors={['blue']}
        valueFormatter={(number) => `${number}`}
        yAxisWidth={48}
        showAnimation={true}
        showTooltip={true}
        showGridLines={true}
      />
    </div>
  );
}
