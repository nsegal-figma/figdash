/**
 * DivergingBarChart Component
 * Custom SVG — bars extend left (negative) and right (positive) from center axis
 * Auto-detects midpoint: splits ordinal categories into left/right halves
 * Best for Likert/agreement/satisfaction scales
 */

import { useState } from 'react';
import type { ChartTheme } from '../../types/chartTheme';
import type { StorytellingProps } from './ChartRenderer';

// ============ Types ============

export interface DivergingBarChartData {
  name: string;
  value: number;
}

export interface DivergingBarChartProps {
  data: DivergingBarChartData[];
  totalN: number;
  colors: string[];
  theme: ChartTheme;
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;
  height?: number;
  columnName?: string;
  storytelling?: StorytellingProps;
}

// ============ Helpers ============

/**
 * Split data into left (negative sentiment) and right (positive sentiment) halves.
 * If odd number of categories, the middle one is split 50/50.
 */
function splitDiverging(data: DivergingBarChartData[]): {
  left: Array<{ name: string; value: number; percentage: number }>;
  right: Array<{ name: string; value: number; percentage: number }>;
  center: { name: string; value: number; percentage: number } | null;
} {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const midIndex = Math.floor(data.length / 2);
  const isOdd = data.length % 2 !== 0;

  const toEntry = (d: DivergingBarChartData) => ({
    name: d.name,
    value: d.value,
    percentage: total > 0 ? (d.value / total) * 100 : 0,
  });

  const left = data.slice(0, midIndex).map(toEntry);
  const right = data.slice(isOdd ? midIndex + 1 : midIndex).map(toEntry);
  const center = isOdd ? toEntry(data[midIndex]) : null;

  return { left, right, center };
}

// ============ Main Component ============

export function DivergingBarChart({
  data,
  totalN,
  colors,
  theme,
  styles,
  height = 300,
}: DivergingBarChartProps) {
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  const { left, right, center } = splitDiverging(data);

  // Calculate max extent for scaling
  const leftTotal = left.reduce((s, d) => s + d.percentage, 0) + (center ? center.percentage / 2 : 0);
  const rightTotal = right.reduce((s, d) => s + d.percentage, 0) + (center ? center.percentage / 2 : 0);
  const maxExtent = Math.max(leftTotal, rightTotal, 1);

  // SVG dimensions
  const margin = { top: 20, right: 20, bottom: 40, left: 20 };
  const barHeight = Math.min(40, (height - margin.top - margin.bottom - 60) * 0.4);
  const svgHeight = barHeight + margin.top + margin.bottom + 60;
  const chartWidth = 100; // percentage-based

  // Color assignments: left categories get first colors, center gets mid, right gets last
  const getColor = (name: string) => {
    const idx = data.findIndex(d => d.name === name);
    return colors[idx] || colors[0];
  };

  // Build segments
  const leftSegments = [...left].reverse(); // reverse so most negative is outermost
  const rightSegments = right;

  return (
    <div className="w-full" style={{ minHeight: height }}>
      <svg
        width="100%"
        viewBox={`0 0 600 ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Diverging bar chart"
      >
        {/* Center axis line */}
        <line
          x1={300}
          y1={margin.top}
          x2={300}
          y2={margin.top + barHeight}
          stroke={theme.colors.axisColor}
          strokeWidth={2}
        />

        {/* Left segments (growing from center to left) */}
        {(() => {
          let offset = 0;
          return leftSegments.map((seg) => {
            const width = (seg.percentage / maxExtent) * 280;
            const x = 300 - offset - width;
            offset += width;
            const isHovered = hoveredName === seg.name;
            const isDimmed = hoveredName !== null && !isHovered;
            return (
              <g key={`left-${seg.name}`}>
                <rect
                  x={x}
                  y={margin.top}
                  width={Math.max(width, 1)}
                  height={barHeight}
                  fill={getColor(seg.name)}
                  rx={3}
                  ry={3}
                  opacity={isDimmed ? 0.3 : 1}
                  stroke={isHovered ? theme.colors.textPrimary : 'none'}
                  strokeWidth={isHovered ? 2 : 0}
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                  onMouseEnter={() => setHoveredName(seg.name)}
                  onMouseLeave={() => setHoveredName(null)}
                />
                {width > 30 && (
                  <text
                    x={x + width / 2}
                    y={margin.top + barHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#fff"
                    fontFamily={styles.fontFamily}
                    fontSize={11}
                    fontWeight={600}
                    style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                  >
                    {seg.percentage.toFixed(0)}%
                  </text>
                )}
              </g>
            );
          });
        })()}

        {/* Center segment (split evenly) */}
        {center && (() => {
          const halfWidth = (center.percentage / 2 / maxExtent) * 280;
          const isHovered = hoveredName === center.name;
          const isDimmed = hoveredName !== null && !isHovered;
          return (
            <g>
              <rect
                x={300 - halfWidth}
                y={margin.top}
                width={halfWidth * 2}
                height={barHeight}
                fill={getColor(center.name)}
                rx={3}
                ry={3}
                opacity={isDimmed ? 0.3 : 0.7}
                stroke={isHovered ? theme.colors.textPrimary : 'none'}
                strokeWidth={isHovered ? 2 : 0}
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseEnter={() => setHoveredName(center.name)}
                onMouseLeave={() => setHoveredName(null)}
              />
              {halfWidth * 2 > 30 && (
                <text
                  x={300}
                  y={margin.top + barHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#fff"
                  fontFamily={styles.fontFamily}
                  fontSize={11}
                  fontWeight={600}
                  style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                >
                  {center.percentage.toFixed(0)}%
                </text>
              )}
            </g>
          );
        })()}

        {/* Right segments (growing from center to right) */}
        {(() => {
          let offset = 0;
          return rightSegments.map((seg) => {
            const width = (seg.percentage / maxExtent) * 280;
            const x = 300 + offset;
            offset += width;
            const isHovered = hoveredName === seg.name;
            const isDimmed = hoveredName !== null && !isHovered;
            return (
              <g key={`right-${seg.name}`}>
                <rect
                  x={x}
                  y={margin.top}
                  width={Math.max(width, 1)}
                  height={barHeight}
                  fill={getColor(seg.name)}
                  rx={3}
                  ry={3}
                  opacity={isDimmed ? 0.3 : 1}
                  stroke={isHovered ? theme.colors.textPrimary : 'none'}
                  strokeWidth={isHovered ? 2 : 0}
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                  onMouseEnter={() => setHoveredName(seg.name)}
                  onMouseLeave={() => setHoveredName(null)}
                />
                {width > 30 && (
                  <text
                    x={x + width / 2}
                    y={margin.top + barHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#fff"
                    fontFamily={styles.fontFamily}
                    fontSize={11}
                    fontWeight={600}
                    style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                  >
                    {seg.percentage.toFixed(0)}%
                  </text>
                )}
              </g>
            );
          });
        })()}

        {/* Category labels below */}
        {data.map((item, idx) => {
          const total = data.reduce((s, d) => s + d.value, 0);
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          const isHovered = hoveredName === item.name;
          // Spread labels evenly across width
          const xPos = 30 + (idx / (data.length - 1 || 1)) * 540;
          return (
            <g key={`label-${idx}`}>
              <rect
                x={xPos - 6}
                y={margin.top + barHeight + 14}
                width={12}
                height={12}
                rx={theme.shapes.legendSwatchShape === 'circle' ? 6 : 2}
                fill={colors[idx] || colors[0]}
              />
              <text
                x={xPos + 10}
                y={margin.top + barHeight + 25}
                textAnchor="start"
                fill={isHovered ? theme.colors.textPrimary : theme.colors.textSecondary}
                fontFamily={styles.fontFamily}
                fontSize={10}
                fontWeight={isHovered ? 600 : 400}
              >
                {item.name.length > 18 ? item.name.substring(0, 17) + '…' : item.name} ({pct.toFixed(0)}%)
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredName && (
        <div
          className="flex justify-center mt-1"
        >
          <div
            className="rounded-lg px-3 py-1.5"
            style={{
              backgroundColor: theme.colors.cardBackground,
              border: `1px solid ${theme.colors.borderColor}`,
              fontFamily: styles.fontFamily,
              fontSize: styles.labelFontSize,
              color: theme.colors.textPrimary,
            }}
          >
            <strong>{hoveredName}</strong>:{' '}
            <span style={{ color: theme.colors.textSecondary }}>
              {data.find(d => d.name === hoveredName)?.value || 0} (
              {((data.find(d => d.name === hoveredName)?.value || 0) / totalN * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
