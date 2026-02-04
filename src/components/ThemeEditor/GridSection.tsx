/**
 * GridSection
 * Grid & axes settings for the theme editor
 */

import { useThemeStore } from '../../stores/useThemeStore';
import type { GridStyle, AxisDivisions } from '../../types/chartTheme';

const GRID_STYLES: { value: GridStyle; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

const AXIS_DIVISIONS: { value: AxisDivisions; label: string }[] = [
  { value: 4, label: '4 divisions' },
  { value: 5, label: '5 divisions' },
  { value: 10, label: '10 divisions' },
];

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-700">{label}</label>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-gray-900' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export function GridSection() {
  const { activeTheme, updateDraftSection } = useThemeStore();

  if (!activeTheme) return null;

  const grid = activeTheme.grid;

  const update = (key: keyof typeof grid, value: unknown) => {
    updateDraftSection('grid', { [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Grid Lines */}
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Grid Lines
        </div>
        <Toggle
          label="Horizontal Grid"
          checked={grid.showHorizontalGrid}
          onChange={(v) => update('showHorizontalGrid', v)}
        />
        <Toggle
          label="Vertical Grid"
          checked={grid.showVerticalGrid}
          onChange={(v) => update('showVerticalGrid', v)}
        />
        {(grid.showHorizontalGrid || grid.showVerticalGrid) && (
          <>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Style</label>
              <select
                value={grid.gridStyle}
                onChange={(e) => update('gridStyle', e.target.value)}
                className="rounded border border-gray-300 px-2 py-1 text-sm"
              >
                {GRID_STYLES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Opacity</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  value={grid.gridOpacity}
                  onChange={(e) => update('gridOpacity', Number(e.target.value))}
                  min={0.1}
                  max={1}
                  step={0.1}
                  className="w-20"
                />
                <span className="w-12 text-right text-sm text-gray-600">
                  {Math.round(grid.gridOpacity * 100)}%
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Axis */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Axes
        </div>
        <Toggle
          label="Show Axis Lines"
          checked={grid.showAxisLines}
          onChange={(v) => update('showAxisLines', v)}
        />
        <Toggle
          label="Show Axis Labels"
          checked={grid.showAxisTicks}
          onChange={(v) => update('showAxisTicks', v)}
        />
        {grid.showAxisTicks && (
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Divisions</label>
            <select
              value={grid.axisDivisions}
              onChange={(e) => update('axisDivisions', Number(e.target.value))}
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            >
              {AXIS_DIVISIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
