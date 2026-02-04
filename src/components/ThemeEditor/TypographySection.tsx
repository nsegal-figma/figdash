/**
 * TypographySection
 * Typography settings for the theme editor
 */

import { useThemeStore } from '../../stores/useThemeStore';
import type { FontSize, FontWeight } from '../../types/chartTheme';

const FONT_FAMILIES: { value: string; label: string }[] = [
  { value: 'inherit', label: 'System Default' },
  { value: '"Inter", system-ui, sans-serif', label: 'Inter' },
  { value: '"Roboto", system-ui, sans-serif', label: 'Roboto' },
  { value: '"Open Sans", system-ui, sans-serif', label: 'Open Sans' },
  { value: '"Lato", system-ui, sans-serif', label: 'Lato' },
  { value: '"Source Sans 3", system-ui, sans-serif', label: 'Source Sans' },
  { value: '"Montserrat", system-ui, sans-serif', label: 'Montserrat' },
  { value: '"Poppins", system-ui, sans-serif', label: 'Poppins' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'ui-monospace, monospace', label: 'Monospace' },
];

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: 'xs', label: 'Extra Small' },
  { value: 'sm', label: 'Small' },
  { value: 'base', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
];

const FONT_WEIGHTS: { value: FontWeight; label: string }[] = [
  { value: 400, label: 'Normal' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semi-bold' },
  { value: 700, label: 'Bold' },
];

interface SelectProps<T> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: SelectProps<T>) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => {
          const val = typeof value === 'number'
            ? Number(e.target.value) as T
            : e.target.value as T;
          onChange(val);
        }}
        className="rounded border border-gray-300 px-2 py-1 text-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TypographySection() {
  const { activeTheme, updateDraftSection } = useThemeStore();

  if (!activeTheme) return null;

  const typography = activeTheme.typography;

  const update = (key: keyof typeof typography, value: FontSize | FontWeight | string) => {
    updateDraftSection('typography', { [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Font Family */}
      <div>
        <label className="mb-1 block text-sm text-gray-700">Font Family</label>
        <select
          value={typography.fontFamily}
          onChange={(e) => update('fontFamily', e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Titles
        </div>
        <Select
          label="Size"
          value={typography.titleSize}
          options={FONT_SIZES}
          onChange={(v) => update('titleSize', v)}
        />
        <Select
          label="Weight"
          value={typography.titleWeight}
          options={FONT_WEIGHTS}
          onChange={(v) => update('titleWeight', v)}
        />
      </div>

      {/* Labels */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Labels
        </div>
        <Select
          label="Size"
          value={typography.labelSize}
          options={FONT_SIZES.filter((f) => ['xs', 'sm', 'base'].includes(f.value))}
          onChange={(v) => update('labelSize', v)}
        />
        <Select
          label="Weight"
          value={typography.labelWeight}
          options={FONT_WEIGHTS}
          onChange={(v) => update('labelWeight', v)}
        />
      </div>

      {/* Values */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Values
        </div>
        <Select
          label="Size"
          value={typography.valueSize}
          options={FONT_SIZES.filter((f) => ['xs', 'sm', 'base'].includes(f.value))}
          onChange={(v) => update('valueSize', v)}
        />
        <Select
          label="Weight"
          value={typography.valueWeight}
          options={FONT_WEIGHTS}
          onChange={(v) => update('valueWeight', v)}
        />
      </div>

      {/* Legend & Axis */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Legend & Axis
        </div>
        <Select
          label="Legend Size"
          value={typography.legendSize}
          options={FONT_SIZES.filter((f) => ['xs', 'sm'].includes(f.value))}
          onChange={(v) => update('legendSize', v)}
        />
        <Select
          label="Axis Size"
          value={typography.axisTickSize}
          options={FONT_SIZES.filter((f) => ['xs', 'sm'].includes(f.value))}
          onChange={(v) => update('axisTickSize', v)}
        />
      </div>
    </div>
  );
}
