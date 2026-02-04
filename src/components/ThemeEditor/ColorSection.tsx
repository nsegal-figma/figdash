/**
 * ColorSection
 * Color settings for the theme editor
 */

import { useThemeStore } from '../../stores/useThemeStore';
import { COLOR_PALETTES } from '../../lib/colorPalettes';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-gray-300"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 rounded border border-gray-300 px-2 py-1 text-xs font-mono"
        />
      </div>
    </div>
  );
}

export function ColorSection() {
  const { activeTheme, updateDraftSection } = useThemeStore();

  if (!activeTheme) return null;

  const colors = activeTheme.colors;

  const updateColor = (key: keyof typeof colors, value: string) => {
    updateDraftSection('colors', { [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Data Palette Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Data Palette
        </label>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_PALETTES.map((palette) => (
            <button
              key={palette.id}
              onClick={() => updateColor('dataPaletteId', palette.id)}
              className={`rounded-md border p-2 text-left transition-colors ${
                colors.dataPaletteId === palette.id
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="mb-1 text-xs font-medium text-gray-700">
                {palette.name}
              </div>
              <div className="flex gap-0.5">
                {palette.colors.slice(0, 6).map((color, idx) => (
                  <div
                    key={idx}
                    className="h-3 flex-1 first:rounded-l last:rounded-r"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Individual Colors */}
      <div className="space-y-3 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Chart Colors
        </div>
        <ColorInput
          label="Background"
          value={colors.background}
          onChange={(v) => updateColor('background', v)}
        />
        <ColorInput
          label="Card Background"
          value={colors.cardBackground}
          onChange={(v) => updateColor('cardBackground', v)}
        />
        <ColorInput
          label="Border"
          value={colors.borderColor}
          onChange={(v) => updateColor('borderColor', v)}
        />
      </div>

      <div className="space-y-3 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Text Colors
        </div>
        <ColorInput
          label="Primary Text"
          value={colors.textPrimary}
          onChange={(v) => updateColor('textPrimary', v)}
        />
        <ColorInput
          label="Secondary Text"
          value={colors.textSecondary}
          onChange={(v) => updateColor('textSecondary', v)}
        />
        <ColorInput
          label="Muted Text"
          value={colors.textMuted}
          onChange={(v) => updateColor('textMuted', v)}
        />
        <ColorInput
          label="Value Labels"
          value={colors.valueLabelColor}
          onChange={(v) => updateColor('valueLabelColor', v)}
        />
      </div>

      <div className="space-y-3 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Grid & Axes
        </div>
        <ColorInput
          label="Grid Lines"
          value={colors.gridColor}
          onChange={(v) => updateColor('gridColor', v)}
        />
        <ColorInput
          label="Axis Lines"
          value={colors.axisColor}
          onChange={(v) => updateColor('axisColor', v)}
        />
      </div>
    </div>
  );
}
