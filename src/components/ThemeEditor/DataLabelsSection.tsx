/**
 * DataLabelsSection
 * Data label settings for the theme editor
 */

import { useThemeStore } from '../../stores/useThemeStore';
import type { ValuePosition, NumberFormat, DecimalPlaces } from '../../types/chartTheme';

const VALUE_POSITIONS: { value: ValuePosition; label: string }[] = [
  { value: 'inside', label: 'Inside Bar' },
  { value: 'outside', label: 'Outside Bar' },
  { value: 'end', label: 'At End' },
];

const NUMBER_FORMATS: { value: NumberFormat; label: string }[] = [
  { value: 'raw', label: 'Raw Count' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'abbreviated', label: 'Abbreviated (1K, 1M)' },
];

const DECIMAL_PLACES: { value: DecimalPlaces; label: string }[] = [
  { value: 0, label: 'None (42%)' },
  { value: 1, label: 'One (42.1%)' },
  { value: 2, label: 'Two (42.13%)' },
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

export function DataLabelsSection() {
  const { activeTheme, updateDraftSection } = useThemeStore();

  if (!activeTheme) return null;

  const dataLabels = activeTheme.dataLabels;

  const update = (key: keyof typeof dataLabels, value: unknown) => {
    updateDraftSection('dataLabels', { [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Horizontal Bars */}
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Horizontal Bars
        </div>
        <Toggle
          label="Show Values"
          checked={dataLabels.showBarValues}
          onChange={(v) => update('showBarValues', v)}
        />
        {dataLabels.showBarValues && (
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Position</label>
            <select
              value={dataLabels.valuePosition}
              onChange={(e) => update('valuePosition', e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            >
              {VALUE_POSITIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Stacked Bars */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Stacked Bars
        </div>
        <Toggle
          label="Show Percentages"
          checked={dataLabels.showStackedPercentages}
          onChange={(v) => update('showStackedPercentages', v)}
        />
        {dataLabels.showStackedPercentages && (
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Min % to Show</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                value={dataLabels.minPercentageForLabel}
                onChange={(e) => update('minPercentageForLabel', Number(e.target.value))}
                min={0}
                max={20}
                step={1}
                className="w-20"
              />
              <span className="w-10 text-right text-sm text-gray-600">
                {dataLabels.minPercentageForLabel}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Number Format */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Number Format
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Format</label>
          <select
            value={dataLabels.numberFormat}
            onChange={(e) => update('numberFormat', e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {NUMBER_FORMATS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {dataLabels.numberFormat === 'percentage' && (
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Decimal Places</label>
            <select
              value={dataLabels.percentageDecimals}
              onChange={(e) => update('percentageDecimals', Number(e.target.value))}
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            >
              {DECIMAL_PLACES.map((opt) => (
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
