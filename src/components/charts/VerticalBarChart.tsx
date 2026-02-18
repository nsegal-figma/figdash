/**
 * VerticalBarChart Component
 * Theme-aware vertical bar chart using Recharts with storytelling support
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
import { Compass, X } from 'lucide-react';
import type { ChartTheme } from '../../types/chartTheme';
import type { StorytellingProps } from './ChartRenderer';

// ============ Types ============

export interface VerticalBarChartData {
  name: string;
  value: number;
}

export interface VerticalBarChartProps {
  /** Chart data */
  data: VerticalBarChartData[];
  /** Total sample size for percentage calculations */
  totalN: number;
  /** Colors for each bar */
  colors: string[];
  /** Chart theme */
  theme: ChartTheme;
  /** Computed theme styles */
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;
  /** Chart height */
  height?: number;
  /** Show grid lines */
  showGrid?: boolean;
  /** Column name for storytelling */
  columnName?: string;
  /** Storytelling props */
  storytelling?: StorytellingProps;
}

// ============ Custom Tooltip Component ============

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: VerticalBarChartData;
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

// ============ Main Chart Component ============

export function VerticalBarChart({
  data,
  totalN,
  colors,
  theme,
  styles,
  height = 300,
  showGrid = true,
  storytelling,
}: VerticalBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  // Truncate long labels
  const truncateLabel = (label: string, maxLength: number = 12) => {
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength - 1) + '…';
  };

  // Get annotations for display above the chart
  const getAnnotations = () => {
    if (!storytelling) return [];
    const annotations: Array<{ name: string; text: string; id: string }> = [];
    data.forEach((item) => {
      const itemAnnotations = storytelling.getAnnotationsForBar(item.name);
      const visible = itemAnnotations.filter(a => a.isVisible);
      if (visible.length > 0) {
        annotations.push({ name: item.name, text: visible[0].text, id: visible[0].id });
      }
    });
    return annotations;
  };

  const annotations = getAnnotations();

  return (
    <div className="w-full">
      {/* Storytelling Annotations */}
      {annotations.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {annotations.map((ann) => (
            <div
              key={ann.id}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1"
              style={{
                backgroundColor: '#1e293b',
                color: '#fff',
                fontFamily: styles.fontFamily,
                fontSize: styles.axisTickFontSize,
                fontWeight: 600,
              }}
            >
              <Compass className="h-3 w-3" />
              <span><strong>{ann.name}:</strong> {ann.text}</span>
              <button
                onClick={() => storytelling?.removeAnnotation(ann.id)}
                className="ml-1 hover:opacity-70"
                title="Dismiss"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
          >
            {showGrid && theme.grid.showHorizontalGrid && (
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
              tickFormatter={(value) => truncateLabel(value)}
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
              radius={[
                styles.barBorderRadiusPx,
                styles.barBorderRadiusPx,
                0,
                0,
              ]}
              animationDuration={theme.effects.animationDuration}
              animationEasing={theme.effects.animationEasing === 'linear' ? 'linear' : 'ease-out'}
            >
              {data.map((item, index) => {
                const emphasis = storytelling?.getEmphasisForBar(item.name);
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index] || colors[0]}
                    style={{
                      cursor: theme.effects.hoverCursor ? 'pointer' : 'default',
                      filter: emphasis ? 'drop-shadow(0 0 6px #f59e0b)' : undefined,
                    }}
                    stroke={emphasis ? '#f59e0b' : undefined}
                    strokeWidth={emphasis ? 2 : undefined}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
