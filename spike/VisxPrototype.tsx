import { useMemo } from 'react';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Grid } from '@visx/grid';
import { defaultStyles, useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import type { DataPoint } from './testData';

interface VisxPrototypeProps {
  data: DataPoint[];
  width?: number;
  height?: number;
}

const margin = { top: 20, right: 20, bottom: 40, left: 50 };

export function VisxPrototype({ data, width = 600, height = 400 }: VisxPrototypeProps) {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<DataPoint>();

  // Calculate dimensions
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Scales
  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xMax],
        domain: data.map(d => d.label),
        padding: 0.3,
      }),
    [xMax, data]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [0, Math.max(...data.map(d => d.value))],
        nice: true,
      }),
    [yMax, data]
  );

  // Tooltip handler
  const handleMouseOver = (event: React.MouseEvent<SVGRectElement>, datum: DataPoint) => {
    const coords = localPoint(event);
    if (coords) {
      showTooltip({
        tooltipLeft: coords.x,
        tooltipTop: coords.y,
        tooltipData: datum,
      });
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <Grid
            xScale={xScale}
            yScale={yScale}
            width={xMax}
            height={yMax}
            stroke="#e5e7eb"
            strokeDasharray="3,3"
          />
          <AxisBottom
            top={yMax}
            scale={xScale}
            tickFormat={(value) => {
              // Show every 10th label to avoid crowding
              const index = parseInt(value.replace('Item ', ''));
              return index % 10 === 0 ? value : '';
            }}
            stroke="#d1d5db"
            tickStroke="#d1d5db"
            tickLabelProps={() => ({
              fill: '#6b7280',
              fontSize: 10,
              textAnchor: 'middle',
            })}
          />
          <AxisLeft
            scale={yScale}
            stroke="#d1d5db"
            tickStroke="#d1d5db"
            tickLabelProps={() => ({
              fill: '#6b7280',
              fontSize: 10,
              textAnchor: 'end',
              dx: '-0.25em',
              dy: '0.25em',
            })}
          />
          {data.map((d, i) => {
            const barHeight = yMax - (yScale(d.value) ?? 0);
            const barX = xScale(d.label);
            const barY = yMax - barHeight;
            return (
              <Bar
                key={`bar-${i}`}
                x={barX}
                y={barY}
                width={xScale.bandwidth()}
                height={barHeight}
                fill="#3b82f6"
                onMouseMove={(event) => handleMouseOver(event, d)}
                onMouseLeave={hideTooltip}
                style={{ cursor: 'pointer' }}
              />
            );
          })}
        </Group>
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '0.5rem',
          }}
        >
          <div>
            <strong>{tooltipData.label}</strong>
          </div>
          <div>Value: {tooltipData.value}</div>
        </TooltipWithBounds>
      )}
    </div>
  );
}
