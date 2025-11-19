import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export interface BarChartData {
  name: string;
  value: number;
}

export interface BarChartProps {
  data: BarChartData[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
  height?: number;
}

const COLORS = [
  '#3B82F6', // primary blue
  '#10B981', // success green
  '#F59E0B', // warning orange
  '#EF4444', // error red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

export function BarChart({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
  height = 300,
}: BarChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            label={xAxisLabel ? { value: xAxisLabel, position: 'bottom' } : undefined}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            stroke="#D1D5DB"
          />
          <YAxis
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            stroke="#D1D5DB"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

