/**
 * WaffleChart Component
 * 10x10 grid (100 cells) colored proportionally by data values
 * Intuitive: "37 out of 100 people said X"
 */

import { useState } from 'react';
import type { ChartTheme } from '../../types/chartTheme';
import type { StorytellingProps } from './ChartRenderer';

// ============ Types ============

export interface WaffleChartData {
  name: string;
  value: number;
}

export interface WaffleChartProps {
  data: WaffleChartData[];
  totalN: number;
  colors: string[];
  theme: ChartTheme;
  styles: ReturnType<typeof import('../../lib/themes').computeThemeStyles>;
  height?: number;
  columnName?: string;
  storytelling?: StorytellingProps;
}

// ============ Main Component ============

export function WaffleChart({
  data,
  totalN,
  colors,
  theme,
  styles,
  height = 300,
}: WaffleChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Calculate how many cells each category gets out of 100
  const cells: Array<{ name: string; color: string; index: number }> = [];
  let remaining = 100;

  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const cellCounts: Array<{ name: string; count: number; color: string; value: number }> = [];

  sortedData.forEach((item, idx) => {
    const originalIdx = data.findIndex(d => d.name === item.name);
    const color = colors[originalIdx] || colors[0];
    if (idx === sortedData.length - 1) {
      // Last item gets whatever remains to ensure exactly 100
      cellCounts.push({ name: item.name, count: remaining, color, value: item.value });
    } else {
      const count = Math.round((item.value / totalN) * 100);
      const clamped = Math.min(count, remaining);
      cellCounts.push({ name: item.name, count: clamped, color, value: item.value });
      remaining -= clamped;
    }
  });

  // Build flat array of 100 cells
  cellCounts.forEach((cat) => {
    for (let i = 0; i < cat.count; i++) {
      cells.push({ name: cat.name, color: cat.color, index: cells.length });
    }
  });

  // Grid dimensions
  const gridSize = 10;
  const maxGridWidth = Math.min(height - 80, 280); // leave room for legend
  const cellSize = Math.floor(maxGridWidth / gridSize);
  const gap = Math.max(2, Math.floor(cellSize * 0.1));
  const radius = Math.max(2, Math.floor(cellSize * 0.15));

  return (
    <div className="w-full flex flex-col items-center" style={{ minHeight: height }}>
      {/* Grid */}
      <svg
        width={gridSize * (cellSize + gap) - gap}
        height={gridSize * (cellSize + gap) - gap}
        role="img"
        aria-label="Waffle chart showing proportional data"
      >
        {cells.map((cell, i) => {
          const row = Math.floor(i / gridSize);
          const col = i % gridSize;
          const isHovered = hoveredCategory === cell.name;
          const isDimmed = hoveredCategory !== null && !isHovered;

          return (
            <rect
              key={i}
              x={col * (cellSize + gap)}
              y={row * (cellSize + gap)}
              width={cellSize}
              height={cellSize}
              rx={radius}
              ry={radius}
              fill={cell.color}
              opacity={isDimmed ? 0.25 : 1}
              stroke={isHovered ? theme.colors.textPrimary : 'none'}
              strokeWidth={isHovered ? 1.5 : 0}
              style={{
                cursor: 'pointer',
                transition: 'opacity 0.2s, stroke 0.2s',
              }}
              onMouseEnter={() => setHoveredCategory(cell.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            />
          );
        })}
      </svg>

      {/* Tooltip on hover */}
      {hoveredCategory && (
        <div
          className="mt-3 rounded-lg px-3 py-1.5"
          style={{
            backgroundColor: theme.colors.cardBackground,
            border: `1px solid ${theme.colors.borderColor}`,
            fontFamily: styles.fontFamily,
            fontSize: styles.labelFontSize,
            color: theme.colors.textPrimary,
          }}
        >
          <strong>{hoveredCategory}</strong>:{' '}
          <span style={{ color: theme.colors.textSecondary }}>
            {data.find(d => d.name === hoveredCategory)?.value || 0} (
            {((data.find(d => d.name === hoveredCategory)?.value || 0) / totalN * 100).toFixed(1)}%)
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center mt-3 px-4">
        {data.map((item, index) => {
          const count = cellCounts.find(c => c.name === item.name)?.count || 0;
          return (
            <div
              key={item.name}
              className="flex items-center gap-2 cursor-pointer"
              onMouseEnter={() => setHoveredCategory(item.name)}
              onMouseLeave={() => setHoveredCategory(null)}
              style={{
                opacity: hoveredCategory && hoveredCategory !== item.name ? 0.5 : 1,
                transition: 'opacity 0.2s',
              }}
            >
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
                {item.name}: {count}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
