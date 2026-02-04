/**
 * LayoutSection
 * Layout & spacing settings for the theme editor
 */

import { useThemeStore } from '../../stores/useThemeStore';
import type { LegendPosition } from '../../types/chartTheme';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 500,
  step = 1,
  unit = 'px',
}: NumberInputProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-20"
        />
        <span className="w-16 text-right text-sm text-gray-600">
          {value}{unit}
        </span>
      </div>
    </div>
  );
}

const LEGEND_POSITIONS: { value: LegendPosition; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'none', label: 'Hidden' },
];

export function LayoutSection() {
  const { activeTheme, updateDraftSection } = useThemeStore();

  if (!activeTheme) return null;

  const layout = activeTheme.layout;

  const update = (key: keyof typeof layout, value: number | LegendPosition | [number, number, number, number]) => {
    updateDraftSection('layout', { [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Bar Dimensions */}
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Bar Dimensions
        </div>
        <NumberInput
          label="Bar Height"
          value={layout.barHeight}
          onChange={(v) => update('barHeight', v)}
          min={20}
          max={80}
        />
        <NumberInput
          label="Bar Gap"
          value={layout.barGap}
          onChange={(v) => update('barGap', v)}
          min={2}
          max={24}
        />
        <NumberInput
          label="Label Width"
          value={layout.labelWidth}
          onChange={(v) => update('labelWidth', v)}
          min={100}
          max={400}
        />
      </div>

      {/* Grouped Charts */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Grouped Charts
        </div>
        <NumberInput
          label="Chart Height"
          value={layout.groupedChartHeight}
          onChange={(v) => update('groupedChartHeight', v)}
          min={150}
          max={500}
        />
        <NumberInput
          label="Bar Width"
          value={layout.groupedBarWidth}
          onChange={(v) => update('groupedBarWidth', v)}
          min={20}
          max={80}
        />
      </div>

      {/* Legend */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Legend
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Position</label>
          <select
            value={layout.legendPosition}
            onChange={(e) => update('legendPosition', e.target.value as LegendPosition)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {LEGEND_POSITIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <NumberInput
          label="Swatch Size"
          value={layout.legendSwatchSize}
          onChange={(v) => update('legendSwatchSize', v)}
          min={8}
          max={24}
        />
      </div>
    </div>
  );
}
