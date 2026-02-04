/**
 * ShapesSection
 * Shapes & borders settings for the theme editor
 */

import { useThemeStore } from '../../stores/useThemeStore';
import type {
  BorderRadius,
  StackedBarRadiusStyle,
  BarStyle,
  LegendSwatchShape,
} from '../../types/chartTheme';

const BORDER_RADII: { value: BorderRadius; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
];

const STACKED_RADIUS_STYLES: { value: StackedBarRadiusStyle; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'ends-only', label: 'Ends Only' },
  { value: 'all', label: 'All Segments' },
];

const BAR_STYLES: { value: BarStyle; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'gradient', label: 'Gradient' },
];

const SWATCH_SHAPES: { value: LegendSwatchShape; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
];

export function ShapesSection() {
  const { activeTheme, updateDraftSection } = useThemeStore();

  if (!activeTheme) return null;

  const shapes = activeTheme.shapes;

  const update = (key: keyof typeof shapes, value: unknown) => {
    updateDraftSection('shapes', { [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Bar Corners */}
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Bar Corners
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Horizontal Bars</label>
          <select
            value={shapes.barBorderRadius}
            onChange={(e) => update('barBorderRadius', e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {BORDER_RADII.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Stacked Bars</label>
          <select
            value={shapes.stackedBarRadius}
            onChange={(e) => update('stackedBarRadius', e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {STACKED_RADIUS_STYLES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Grouped Bars</label>
          <select
            value={shapes.groupedBarRadius}
            onChange={(e) => update('groupedBarRadius', e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {BORDER_RADII.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bar Fill */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Bar Fill Style
        </div>
        <div className="flex gap-2">
          {BAR_STYLES.map((style) => (
            <button
              key={style.value}
              onClick={() => update('barStyle', style.value)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                shapes.barStyle === style.value
                  ? 'border-gray-900 bg-gray-50 text-gray-900'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
        {shapes.barStyle === 'gradient' && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Start Opacity</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  value={shapes.gradientStartOpacity}
                  onChange={(e) => update('gradientStartOpacity', Number(e.target.value))}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-20"
                />
                <span className="w-12 text-right text-sm text-gray-600">
                  {Math.round(shapes.gradientStartOpacity * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bar Border */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Bar Border
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Width</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              value={shapes.barBorderWidth}
              onChange={(e) => update('barBorderWidth', Number(e.target.value))}
              min={0}
              max={4}
              step={1}
              className="w-20"
            />
            <span className="w-12 text-right text-sm text-gray-600">
              {shapes.barBorderWidth}px
            </span>
          </div>
        </div>
        {shapes.barBorderWidth > 0 && (
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={shapes.barBorderColor}
                onChange={(e) => update('barBorderColor', e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border border-gray-300"
              />
              <input
                type="text"
                value={shapes.barBorderColor}
                onChange={(e) => update('barBorderColor', e.target.value)}
                className="w-20 rounded border border-gray-300 px-2 py-1 text-xs font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Container & Legend */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Other
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Container Radius</label>
          <select
            value={shapes.containerRadius}
            onChange={(e) => update('containerRadius', e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {BORDER_RADII.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Legend Swatch</label>
          <select
            value={shapes.legendSwatchShape}
            onChange={(e) => update('legendSwatchShape', e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {SWATCH_SHAPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
