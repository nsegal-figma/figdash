import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DataPoint } from './testData';

interface RechartsPrototypeProps {
  data: DataPoint[];
  width?: number;
  height?: number;
}

export function RechartsPrototype({ data, width = 600, height = 400 }: RechartsPrototypeProps) {
  // Recharts expects specific data format
  const rechartsData = data.map(d => ({
    name: d.label,
    value: d.value,
  }));

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart
        data={rechartsData}
        margin={{ top: 20, right: 20, bottom: 40, left: 50 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          tick={{ fill: '#6b7280', fontSize: 10 }}
          stroke="#d1d5db"
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 10 }}
          stroke="#d1d5db"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '0.5rem',
          }}
          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
        />
        <Bar
          dataKey="value"
          fill="#3b82f6"
          radius={[8, 8, 0, 0]}
          animationDuration={300}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
