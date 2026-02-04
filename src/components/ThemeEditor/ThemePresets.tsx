/**
 * ThemePresets
 * Save, load, and manage theme presets
 */

import { useState } from 'react';
import { Save, Download, Upload, Trash2, Copy } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import { PRESET_THEMES } from '../../lib/themes';

export function ThemePresets() {
  const {
    activeTheme,
    savedThemes,
    setActiveTheme,
    saveCurrentTheme,
    deleteSavedTheme,
    duplicateTheme,
    exportTheme,
    importTheme,
  } = useThemeStore();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeDescription, setNewThemeDescription] = useState('');

  const handleLoadPreset = (themeId: string) => {
    const preset = PRESET_THEMES.find((t) => t.id === themeId);
    if (preset) {
      setActiveTheme(preset);
    }
  };

  const handleLoadSaved = (themeId: string) => {
    const saved = savedThemes.find((t) => t.id === themeId);
    if (saved) {
      setActiveTheme(saved.theme);
    }
  };

  const handleSave = () => {
    if (!newThemeName.trim()) return;
    saveCurrentTheme(newThemeName.trim(), newThemeDescription.trim() || undefined);
    setNewThemeName('');
    setNewThemeDescription('');
    setShowSaveDialog(false);
  };

  const handleExport = () => {
    const json = exportTheme();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Use theme name directly, replacing only characters that are invalid in filenames
    const safeName = activeTheme.name.replace(/[<>:"/\\|?*]/g, '-');
    a.download = `${safeName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = importTheme(ev.target?.result as string);
          if (!result.success) {
            alert(result.error || 'Failed to import theme');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-3">
      {/* Current Theme Info */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-900">{activeTheme.name}</div>
          {activeTheme.description && (
            <div className="text-xs text-gray-500">{activeTheme.description}</div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            title="Save as new theme"
          >
            <Save className="h-4 w-4" />
          </button>
          <button
            onClick={handleExport}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            title="Export theme"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleImport}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            title="Import theme"
          >
            <Upload className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-2">
          <input
            type="text"
            placeholder="Theme name"
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            autoFocus
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newThemeDescription}
            onChange={(e) => setNewThemeDescription(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowSaveDialog(false)}
              className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!newThemeName.trim()}
              className="rounded bg-gray-900 px-2 py-1 text-xs text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Preset Themes */}
      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
          Built-in Themes
        </div>
        <div className="flex flex-wrap gap-1">
          {PRESET_THEMES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleLoadPreset(preset.id)}
              className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                activeTheme.id === preset.id
                  ? 'border-gray-900 bg-gray-100 text-gray-900'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Saved Themes */}
      {savedThemes.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            Saved Themes
          </div>
          <div className="space-y-1">
            {savedThemes.map((saved) => (
              <div
                key={saved.id}
                className={`flex items-center justify-between rounded-md border px-2 py-1.5 ${
                  activeTheme.id === saved.id
                    ? 'border-gray-900 bg-gray-100'
                    : 'border-gray-200'
                }`}
              >
                <button
                  onClick={() => handleLoadSaved(saved.id)}
                  className="flex-1 text-left text-xs font-medium text-gray-900"
                >
                  {saved.name}
                </button>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => duplicateTheme(saved.id, `${saved.name} Copy`)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                    title="Duplicate"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => deleteSavedTheme(saved.id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
