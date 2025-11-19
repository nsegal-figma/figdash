import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface LineChartData {
  name: string;
  [key: string]: string | number;
}

export interface LineChartProps {
  data: LineChartData[];
  lines: { dataKey: string; name: string; color?: string }[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
}

const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function LineChart({
  data,
  lines,
  title,
  xAxisLabel,
  yAxisLabel,
  height = 300,
}: LineChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
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
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="line"
            wrapperStyle={{ fontSize: '12px' }}
          />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

