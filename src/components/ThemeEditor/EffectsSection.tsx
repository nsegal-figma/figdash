/**
 * EffectsSection
 * Effects settings for the theme editor
 */

import { useThemeStore } from '../../stores/useThemeStore';
import type { Shadow, AnimationEasing } from '../../types/chartTheme';

const SHADOWS: { value: Shadow; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const EASINGS: { value: AnimationEasing; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'easeIn', label: 'Ease In' },
  { value: 'easeOut', label: 'Ease Out' },
  { value: 'easeInOut', label: 'Ease In Out' },
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

export function EffectsSection() {
  const { activeTheme, updateDraftSection } = useThemeStore();

  if (!activeTheme) return null;

  const effects = activeTheme.effects;

  const update = (key: keyof typeof effects, value: unknown) => {
    updateDraftSection('effects', { [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Container Shadow */}
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Container
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Shadow</label>
          <select
            value={effects.containerShadow}
            onChange={(e) => update('containerShadow', e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {SHADOWS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hover Effects */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Hover
        </div>
        <Toggle
          label="Pointer Cursor"
          checked={effects.hoverCursor}
          onChange={(v) => update('hoverCursor', v)}
        />
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Opacity Change</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              value={effects.hoverOpacity}
              onChange={(e) => update('hoverOpacity', Number(e.target.value))}
              min={0.5}
              max={1}
              step={0.05}
              className="w-20"
            />
            <span className="w-12 text-right text-sm text-gray-600">
              {Math.round(effects.hoverOpacity * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Animation */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Animation
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Duration</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              value={effects.animationDuration}
              onChange={(e) => update('animationDuration', Number(e.target.value))}
              min={0}
              max={500}
              step={50}
              className="w-20"
            />
            <span className="w-14 text-right text-sm text-gray-600">
              {effects.animationDuration}ms
            </span>
          </div>
        </div>
        {effects.animationDuration > 0 && (
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Easing</label>
            <select
              value={effects.animationEasing}
              onChange={(e) => update('animationEasing', e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            >
              {EASINGS.map((opt) => (
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
