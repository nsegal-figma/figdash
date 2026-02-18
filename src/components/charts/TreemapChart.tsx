/**
 * TreemapChart Component
 * Recharts Treemap — nested rectangles sized by value
 * Good for high-cardinality data (8-20 categories)
 */

import { useState } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import type { ChartTheme } from '../../types/chartTheme';
import type { StorytellingProps } from './ChartRenderer';

// ============ Types ============

export interface TreemapChartData {
  name: string;
  value: number;
}

export interface TreemapChartProps {
  data: TreemapChartData[];
  totalN: number;
  colors: string[];
  theme: ChartTheme;
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;
  height?: number;
  columnName?: string;
  storytelling?: StorytellingProps;
}

// ============ Custom Content Renderer ============

interface CustomContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  value: number;
  color: string;
  totalN: number;
  fontFamily: string;
  textColor: string;
  hoveredName: string | null;
  onHover: (name: string | null) => void;
}

function CustomContent({
  x,
  y,
  width,
  height: h,
  name,
  value,
  color,
  totalN,
  fontFamily,
  textColor,
  hoveredName,
  onHover,
}: CustomContentProps) {
  const isHovered = hoveredName === name;
  const isDimmed = hoveredName !== null && !isHovered;
  const percentage = ((value / totalN) * 100).toFixed(1);

  // Only show labels if the rectangle is big enough
  const showName = width > 50 && h > 30;
  const showPercent = width > 40 && h > 20;
  const fontSize = Math.min(14, Math.max(10, width / 8));

  return (
    <g
      onMouseEnter={() => onHover(name)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: 'pointer' }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={h}
        rx={3}
        ry={3}
        fill={color}
        opacity={isDimmed ? 0.35 : 1}
        stroke={isHovered ? textColor : 'rgba(255,255,255,0.3)'}
        strokeWidth={isHovered ? 2 : 1}
        style={{ transition: 'opacity 0.2s, stroke 0.2s' }}
      />
      {showName && (
        <text
          x={x + width / 2}
          y={y + h / 2 - (showPercent ? 8 : 0)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          fontFamily={fontFamily}
          fontSize={fontSize}
          fontWeight={600}
          style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
        >
          {name.length > Math.floor(width / (fontSize * 0.6))
            ? name.substring(0, Math.floor(width / (fontSize * 0.6)) - 1) + '…'
            : name}
        </text>
      )}
      {showPercent && (
        <text
          x={x + width / 2}
          y={y + h / 2 + (showName ? 12 : 0)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(255,255,255,0.85)"
          fontFamily={fontFamily}
          fontSize={Math.max(9, fontSize - 2)}
          style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
        >
          {percentage}%
        </text>
      )}
    </g>
  );
}

// ============ Custom Tooltip ============

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      value: number;
    };
  }>;
  totalN: number;
  theme: ChartTheme;
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;
}

function TreemapTooltip({ active, payload, totalN, theme, styles }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;
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
        {item.name}
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

export function TreemapChart({
  data,
  totalN,
  colors,
  theme,
  styles,
  height = 300,
}: TreemapChartProps) {
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  // Build treemap data with colors assigned
  const treemapData = data.map((item, index) => ({
    name: item.name,
    value: item.value,
    color: colors[index] || colors[0],
  }));

  return (
    <div className="w-full">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treemapData}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="none"
            animationDuration={theme.effects.animationDuration}
            content={
              <CustomContent
                x={0}
                y={0}
                width={0}
                height={0}
                name=""
                value={0}
                color=""
                totalN={totalN}
                fontFamily={styles.fontFamily}
                textColor={theme.colors.textPrimary}
                hoveredName={hoveredName}
                onHover={setHoveredName}
              />
            }
          >
            <Tooltip
              content={<TreemapTooltip totalN={totalN} theme={theme} styles={styles} />}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
