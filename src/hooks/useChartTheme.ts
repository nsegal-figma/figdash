/**
 * useChartTheme Hook
 * Provides theme values and computed styles for chart components
 */

import { useMemo } from 'react';
import { useThemeStore } from '../stores/useThemeStore';
import { COLOR_PALETTES, type ColorPalette } from '../lib/colorPalettes';
import { computeThemeStyles } from '../lib/themes';
import type { ChartTheme } from '../types/chartTheme';

export interface ChartThemeContext {
  /** Current theme (draft during editing, active otherwise) */
  theme: ChartTheme;
  /** Whether the theme editor is open */
  isEditing: boolean;
  /** The resolved color palette based on theme's dataPaletteId */
  colorPalette: ColorPalette;
  /** Computed CSS-ready style values */
  styles: ReturnType<typeof computeThemeStyles>;
}

/**
 * Hook for consuming chart theme in components
 *
 * Usage:
 * ```tsx
 * function MyChart() {
 *   const { theme, styles, colorPalette } = useChartTheme();
 *
 *   return (
 *     <div style={{
 *       height: theme.layout.barHeight,
 *       fontSize: styles.labelFontSize,
 *       background: styles.getBarGradient(colorPalette.colors[0])
 *     }}>
 *       ...
 *     </div>
 *   );
 * }
 * ```
 */
export function useChartTheme(): ChartThemeContext {
  // Use individual selectors to ensure proper change detection
  const activeTheme = useThemeStore((state) => state.activeTheme);
  const isEditorOpen = useThemeStore((state) => state.isEditorOpen);

  // Extract the updatedAt to force re-computation when theme changes
  const themeVersion = activeTheme.updatedAt;

  // Get the actual color palette based on theme's dataPaletteId
  const colorPalette = useMemo(() => {
    const found = COLOR_PALETTES.find(
      (p) => p.id === activeTheme.colors.dataPaletteId
    );
    return found || COLOR_PALETTES[0];
  }, [activeTheme.colors.dataPaletteId, themeVersion]);

  // Compute CSS-ready style values - use themeVersion to force re-computation
  const styles = useMemo(
    () => computeThemeStyles(activeTheme),
    [activeTheme, themeVersion]
  );

  return {
    theme: activeTheme,
    isEditing: isEditorOpen,
    colorPalette,
    styles,
  };
}

/**
 * Hook for theme editor operations
 * Provides actions for modifying theme
 */
export function useThemeEditor() {
  const {
    activeTheme,
    draftTheme,
    isEditorOpen,
    activeEditorSection,
    savedThemes,
    openEditor,
    closeEditor,
    setActiveEditorSection,
    updateDraftSection,
    applyDraftTheme,
    discardDraftTheme,
    saveCurrentTheme,
    deleteSavedTheme,
    duplicateTheme,
    setActiveThemeById,
    exportTheme,
    importTheme,
    resetToDefault,
    getAllThemes,
  } = useThemeStore();

  return {
    // State
    activeTheme,
    draftTheme,
    isOpen: isEditorOpen,
    activeSection: activeEditorSection,
    savedThemes,
    allThemes: getAllThemes(),

    // Editor actions
    open: openEditor,
    close: closeEditor,
    setSection: setActiveEditorSection,

    // Draft actions
    updateSection: updateDraftSection,
    apply: applyDraftTheme,
    discard: discardDraftTheme,

    // Theme management
    saveAs: saveCurrentTheme,
    delete: deleteSavedTheme,
    duplicate: duplicateTheme,
    loadTheme: setActiveThemeById,
    reset: resetToDefault,

    // Import/Export
    export: exportTheme,
    import: importTheme,
  };
}
