/**
 * HistogramChart Component
 * Vertical bar chart with no gap between bars, communicating continuous distribution
 * Theme-aware using Recharts
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ChartTheme } from '../../types/chartTheme';
import type { StorytellingProps } from './ChartRenderer';

// ============ Types ============

export interface HistogramChartData {
  name: string;
  value: number;
}

export interface HistogramChartProps {
  data: HistogramChartData[];
  totalN: number;
  colors: string[];
  theme: ChartTheme;
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;
  height?: number;
  columnName?: string;
  storytelling?: StorytellingProps;
}

// ============ Custom Tooltip ============

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: HistogramChartData;
  }>;
  label?: string;
  totalN: number;
  theme: ChartTheme;
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;
}

function CustomTooltip({ active, payload, label, totalN, theme, styles }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const value = payload[0].value;
  const percentage = ((value / totalN) * 100).toFixed(1);

  return (
    <div
      className="rounded-lg px-3 py-2 shadow-xl"
      style={{
        backgroundColor: theme.colors.cardBackground,
        border: `1px solid ${theme.colors.borderColor}`,
        fontFamily: styles.fontFamily,
      }}
    >
      <div
        style={{
          fontSize: styles.labelFontSize,
          fontWeight: 600,
          color: theme.colors.textPrimary,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: styles.axisTickFontSize,
          color: theme.colors.textSecondary,
          marginTop: '4px',
        }}
      >
        {value} ({percentage}%)
      </div>
    </div>
  );
}

// ============ Main Component ============

export function HistogramChart({
  data,
  totalN,
  colors,
  theme,
  styles,
  height = 300,
}: HistogramChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="w-full">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
            barCategoryGap={0}
            barGap={0}
          >
            {theme.grid.showHorizontalGrid && (
              <CartesianGrid
                strokeDasharray={
                  theme.grid.gridStyle === 'dashed'
                    ? '5 5'
                    : theme.grid.gridStyle === 'dotted'
                    ? '2 2'
                    : '0'
                }
                stroke={theme.colors.gridColor}
                strokeOpacity={theme.grid.gridOpacity}
                vertical={false}
              />
            )}
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={{ stroke: theme.colors.axisColor }}
              tick={{
                fill: theme.colors.textSecondary,
                fontFamily: styles.fontFamily,
                fontSize: 11,
              }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: theme.colors.axisColor }}
              tick={{
                fill: theme.colors.textMuted,
                fontFamily: styles.fontFamily,
                fontSize: 11,
              }}
              domain={[0, maxValue]}
              tickCount={theme.grid.axisDivisions + 1}
            />
            <Tooltip
              content={<CustomTooltip totalN={totalN} theme={theme} styles={styles} />}
              cursor={{ fill: theme.colors.gridColor, fillOpacity: 0.1 }}
            />
            <Bar
              dataKey="value"
              radius={[0, 0, 0, 0]}
              animationDuration={theme.effects.animationDuration}
              animationEasing={theme.effects.animationEasing === 'linear' ? 'linear' : 'ease-out'}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index] || colors[0]}
                  style={{
                    cursor: theme.effects.hoverCursor ? 'pointer' : 'default',
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
