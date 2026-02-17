/**
 * ThemedPieChart and DonutChart Components
 * Theme-aware pie/donut charts using Recharts with storytelling support
 */

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Sparkles, X } from 'lucide-react';
import type { ChartTheme } from '../../types/chartTheme';
import type { StorytellingProps } from './ChartRenderer';

// ============ Types ============

export interface PieChartData {
  name: string;
  value: number;
}

export interface ThemedPieChartProps {
  /** Chart data */
  data: PieChartData[];
  /** Total sample size for percentage calculations */
  totalN: number;
  /** Colors for each slice */
  colors: string[];
  /** Chart theme */
  theme: ChartTheme;
  /** Computed theme styles */
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;
  /** Chart height */
  height?: number;
  /** Show legend */
  showLegend?: boolean;
  /** Show labels on slices */
  showLabels?: boolean;
  /** Inner radius (0 for pie, >0 for donut) */
  innerRadius?: number;
  /** Outer radius */
  outerRadius?: number;
  /** Column name for storytelling */
  columnName?: string;
  /** Storytelling props */
  storytelling?: StorytellingProps;
}

// ============ Custom Label Component ============

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
  theme: ChartTheme;
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;
}

function CustomLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
  theme,
  styles,
}: CustomLabelProps) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if slice is > 5%
  if (percent < 0.05) return null;

  const percentValue = (percent * 100).toFixed(theme.dataLabels.percentageDecimals);

  // Small offset (2px) to prevent text touching the line endpoint
  const xOffset = x > cx ? 2 : -2;

  return (
    <text
      x={x + xOffset}
      y={y}
      fill={theme.colors.textPrimary}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{
        fontFamily: styles.fontFamily,
        fontSize: styles.labelFontSize,
        fontWeight: theme.typography.labelWeight,
      }}
    >
      {`${name}: ${percentValue}%`}
    </text>
  );
}

// ============ Custom Tooltip Component ============

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: PieChartData;
  }>;
  totalN: number;
  theme: ChartTheme;
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;
}

function CustomTooltip({ active, payload, totalN, theme, styles }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const percentage = ((data.value / totalN) * 100).toFixed(1);

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
        {data.name}
      </div>
      <div
        style={{
          fontSize: styles.axisTickFontSize,
          color: theme.colors.textSecondary,
          marginTop: '4px',
        }}
      >
        {data.value} ({percentage}%)
      </div>
    </div>
  );
}

// ============ Main Pie Chart Component ============

export function ThemedPieChart({
  data,
  totalN,
  colors,
  theme,
  styles,
  height = 300,
  showLegend = true,
  showLabels = true,
  innerRadius = 0,
  outerRadius = 100,
  storytelling,
}: ThemedPieChartProps) {
  // Calculate responsive radius based on container
  const responsiveOuterRadius = Math.min(outerRadius, height * 0.35);
  const responsiveInnerRadius = innerRadius > 0 ? responsiveOuterRadius * 0.6 : 0;

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
                backgroundColor: '#f59e0b',
                color: '#fff',
                fontFamily: styles.fontFamily,
                fontSize: styles.axisTickFontSize,
                fontWeight: 600,
              }}
            >
              <Sparkles className="h-3 w-3" />
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
          <RechartsPieChart>
            <Pie
              data={data as Array<{ name: string; value: number; [key: string]: unknown }>}
              cx="50%"
              cy="50%"
              innerRadius={responsiveInnerRadius}
              outerRadius={responsiveOuterRadius}
              paddingAngle={data.length > 1 ? 2 : 0}
              dataKey="value"
              labelLine={showLabels}
              label={
                showLabels
                  ? ((props: Record<string, unknown>) => (
                      <CustomLabel
                        cx={props.cx as number}
                        cy={props.cy as number}
                        midAngle={props.midAngle as number}
                        innerRadius={props.innerRadius as number}
                        outerRadius={props.outerRadius as number}
                        percent={props.percent as number}
                        name={props.name as string}
                        theme={theme}
                        styles={styles}
                      />
                    )) as unknown as boolean
                  : undefined
              }
              animationDuration={theme.effects.animationDuration}
              animationEasing={theme.effects.animationEasing === 'linear' ? 'linear' : 'ease-out'}
            >
              {data.map((item, index) => {
                const emphasis = storytelling?.getEmphasisForBar(item.name);
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index] || colors[0]}
                    stroke={emphasis ? '#f59e0b' : theme.colors.cardBackground}
                    strokeWidth={emphasis ? 3 : 2}
                    style={{
                      cursor: theme.effects.hoverCursor ? 'pointer' : 'default',
                      transition: styles.animationTransition,
                      filter: emphasis ? 'drop-shadow(0 0 6px #f59e0b)' : undefined,
                    }}
                  />
                );
              })}
            </Pie>
            <Tooltip
              content={<CustomTooltip totalN={totalN} theme={theme} styles={styles} />}
            />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType={theme.shapes.legendSwatchShape === 'circle' ? 'circle' : 'square'}
                iconSize={theme.layout.legendSwatchSize}
                wrapperStyle={{
                  fontFamily: styles.fontFamily,
                  fontSize: styles.legendFontSize,
                  color: theme.colors.textSecondary,
                }}
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============ Donut Chart (Pie with inner radius) ============

export interface DonutChartProps extends Omit<ThemedPieChartProps, 'innerRadius'> {
  /** Center label text */
  centerLabel?: string;
  /** Center value text */
  centerValue?: string;
}

export function DonutChart({
  centerLabel,
  centerValue,
  ...props
}: DonutChartProps) {
  const { theme, styles, height = 300 } = props;

  return (
    <div className="relative" style={{ height }}>
      <ThemedPieChart {...props} innerRadius={60} height={height} />

      {/* Center label for donut */}
      {(centerLabel || centerValue) && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ marginTop: props.showLegend !== false ? '-18px' : 0 }}
        >
          {centerValue && (
            <div
              style={{
                fontFamily: styles.fontFamily,
                fontSize: styles.titleFontSize,
                fontWeight: theme.typography.titleWeight,
                color: theme.colors.textPrimary,
              }}
            >
              {centerValue}
            </div>
          )}
          {centerLabel && (
            <div
              style={{
                fontFamily: styles.fontFamily,
                fontSize: styles.axisTickFontSize,
                color: theme.colors.textSecondary,
              }}
            >
              {centerLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
