import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface ScatterPlotData {
  x: number;
  y: number;
  name?: string;
}

export interface ScatterPlotProps {
  data: ScatterPlotData[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
  height?: number;
}

export function ScatterPlot({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
  color = '#3B82F6',
  height = 300,
}: ScatterPlotProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            type="number"
            dataKey="x"
            name={xAxisLabel || 'X'}
            label={xAxisLabel ? { value: xAxisLabel, position: 'bottom' } : undefined}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            stroke="#D1D5DB"
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yAxisLabel || 'Y'}
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
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Scatter name="Data Points" data={data} fill={color} />
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

