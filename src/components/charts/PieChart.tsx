import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

export interface PieChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface PieChartProps {
  data: PieChartData[];
  title?: string;
  height?: number;
  showLegend?: boolean;
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

export function PieChart({
  data,
  title,
  height = 300,
  showLegend = true,
}: PieChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: any) => {
              const percent = props.percent || 0;
              const name = props.name || '';
              return `${name}: ${(percent * 100).toFixed(0)}%`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px' }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

