/**
 * StackedBarChart Component
 * Single 100% stacked horizontal bar showing proportional segments
 * Theme-aware with tooltip support
 */

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ChartTheme } from '../../types/chartTheme';
import type { StorytellingProps } from './ChartRenderer';

// ============ Types ============

export interface StackedBarChartData {
  name: string;
  value: number;
}

export interface StackedBarChartProps {
  data: StackedBarChartData[];
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
    name: string;
    value: number;
    payload: Record<string, unknown>;
  }>;
  totalN: number;
  theme: ChartTheme;
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;
  dataItems: StackedBarChartData[];
}

function CustomTooltip({ active, payload, totalN, theme, styles, dataItems }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  // Find which segment is hovered by checking which payload entry has a non-zero value
  const hoveredEntry = payload.find(p => p.value > 0);
  if (!hoveredEntry) return null;

  const name = hoveredEntry.name;
  const item = dataItems.find(d => d.name === name);
  if (!item) return null;

  const percentage = ((item.value / totalN) * 100).toFixed(1);

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
        {name}
      </div>
      <div
        style={{
          fontSize: styles.axisTickFontSize,
          color: theme.colors.textSecondary,
          marginTop: '4px',
        }}
      >
        {item.value} ({percentage}%)
      </div>
    </div>
  );
}

// ============ Main Component ============

export function StackedBarChart({
  data,
  totalN,
  colors,
  theme,
  styles,
  height = 300,
}: StackedBarChartProps) {
  // Build a single row with each category as a separate key
  const row: Record<string, number> = { name: 'total' };
  data.forEach((d) => {
    row[d.name] = d.value;
  });

  const barHeight = Math.min(60, height * 0.2);

  return (
    <div className="w-full">
      {/* Stacked bar */}
      <div style={{ height: barHeight + 40 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[row]}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
            barSize={barHeight}
          >
            <XAxis type="number" hide domain={[0, totalN]} />
            <Tooltip
              content={<CustomTooltip totalN={totalN} theme={theme} styles={styles} dataItems={data} />}
              cursor={false}
            />
            {data.map((item, index) => (
              <Bar
                key={item.name}
                dataKey={item.name}
                stackId="stack"
                radius={
                  index === 0
                    ? [styles.barBorderRadiusPx, 0, 0, styles.barBorderRadiusPx]
                    : index === data.length - 1
                    ? [0, styles.barBorderRadiusPx, styles.barBorderRadiusPx, 0]
                    : [0, 0, 0, 0]
                }
                animationDuration={theme.effects.animationDuration}
              >
                <Cell fill={colors[index] || colors[0]} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend below */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center mt-2 px-4">
        {data.map((item, index) => {
          const percentage = ((item.value / totalN) * 100).toFixed(1);
          return (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="flex-shrink-0"
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: theme.shapes.legendSwatchShape === 'circle' ? '50%' : 2,
                  backgroundColor: colors[index] || colors[0],
                }}
              />
              <span
                style={{
                  fontFamily: styles.fontFamily,
                  fontSize: styles.axisTickFontSize,
                  color: theme.colors.textSecondary,
                }}
              >
                {item.name}: {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
