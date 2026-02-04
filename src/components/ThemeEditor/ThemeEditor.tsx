/**
 * ThemeEditor
 * Slide-out panel for editing chart themes
 * Changes apply immediately - no Apply button needed
 */

import { X, RotateCcw } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import { ThemeSection } from './ThemeSection';
import { ColorSection } from './ColorSection';
import { TypographySection } from './TypographySection';
import { LayoutSection } from './LayoutSection';
import { ShapesSection } from './ShapesSection';
import { GridSection } from './GridSection';
import { DataLabelsSection } from './DataLabelsSection';
import { EffectsSection } from './EffectsSection';
import { ThemePresets } from './ThemePresets';

export function ThemeEditor() {
  const {
    isEditorOpen,
    activeTheme,
    closeEditor,
    resetToDefault,
  } = useThemeStore();

  if (!isEditorOpen) return null;

  const handleReset = () => {
    resetToDefault();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={closeEditor}
      />

      {/* Slide-out Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">Theme Editor</h2>
          <button
            onClick={closeEditor}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Theme Presets */}
        <div className="border-b border-gray-200 px-4 py-3">
          <ThemePresets />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <ThemeSection title="Colors" defaultOpen={true}>
            <ColorSection />
          </ThemeSection>

          <ThemeSection title="Typography">
            <TypographySection />
          </ThemeSection>

          <ThemeSection title="Layout & Spacing">
            <LayoutSection />
          </ThemeSection>

          <ThemeSection title="Shapes & Borders">
            <ShapesSection />
          </ThemeSection>

          <ThemeSection title="Grid & Axes">
            <GridSection />
          </ThemeSection>

          <ThemeSection title="Data Labels">
            <DataLabelsSection />
          </ThemeSection>

          <ThemeSection title="Effects">
            <EffectsSection />
          </ThemeSection>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-4 py-3 flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </button>
          <div className="flex-1" />
          <button
            onClick={closeEditor}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
