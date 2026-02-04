/**
 * Theme Store
 * Manages chart theme state with localStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChartTheme, SavedTheme } from '../types/chartTheme';
import {
  DEFAULT_THEME,
  PRESET_THEMES,
  cloneTheme,
  isValidTheme,
  generateThemeId,
} from '../lib/themes';

interface ThemeStore {
  // Current active theme
  activeTheme: ChartTheme;

  // Draft theme for live editing (separate from active)
  draftTheme: ChartTheme | null;

  // Saved custom themes (presets are always available)
  savedThemes: SavedTheme[];

  // Theme editor state
  isEditorOpen: boolean;
  activeEditorSection: string | null;

  // Actions - Theme Management
  setActiveTheme: (theme: ChartTheme) => void;
  setActiveThemeById: (themeId: string) => void;

  // Actions - Draft Editing
  setDraftTheme: (theme: ChartTheme | null) => void;
  updateDraftSection: <K extends keyof ChartTheme>(
    section: K,
    values: Partial<ChartTheme[K]>
  ) => void;
  applyDraftTheme: () => void;
  discardDraftTheme: () => void;

  // Actions - Saved Themes
  saveCurrentTheme: (name: string, description?: string) => string;
  updateSavedTheme: (themeId: string, updates: Partial<SavedTheme>) => void;
  deleteSavedTheme: (themeId: string) => void;
  duplicateTheme: (themeId: string, newName: string) => string | null;

  // Actions - Import/Export
  exportTheme: (themeId?: string) => string;
  importTheme: (json: string) => { success: boolean; error?: string };

  // Actions - Editor UI
  openEditor: () => void;
  closeEditor: () => void;
  setActiveEditorSection: (section: string | null) => void;

  // Actions - Reset
  resetToDefault: () => void;

  // Getters
  getAllThemes: () => ChartTheme[];
  getThemeById: (themeId: string) => ChartTheme | undefined;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      activeTheme: DEFAULT_THEME,
      draftTheme: null,
      savedThemes: [],
      isEditorOpen: false,
      activeEditorSection: null,

      // Theme Management
      setActiveTheme: (theme) => {
        set({ activeTheme: cloneTheme(theme) });
      },

      setActiveThemeById: (themeId) => {
        const theme = get().getThemeById(themeId);
        if (theme) {
          set({ activeTheme: cloneTheme(theme) });
        }
      },

      // Draft Editing (kept for backwards compatibility, but now updates activeTheme directly)
      setDraftTheme: (theme) => {
        if (theme) {
          set({ activeTheme: cloneTheme(theme) });
        }
      },

      updateDraftSection: (section, values) => {
        const { activeTheme } = get();

        const currentSection = activeTheme[section];
        if (typeof currentSection === 'object' && currentSection !== null) {
          // Update activeTheme directly for immediate effect
          set({
            activeTheme: {
              ...activeTheme,
              [section]: { ...currentSection, ...values },
              updatedAt: Date.now(),
            },
          });
        }
      },

      applyDraftTheme: () => {
        // No-op now since changes apply immediately
      },

      discardDraftTheme: () => {
        // No-op now since we don't use draft
      },

      // Saved Themes
      saveCurrentTheme: (name, description) => {
        const { activeTheme, savedThemes } = get();
        const id = generateThemeId();
        const now = Date.now();

        const newTheme: SavedTheme = {
          id,
          name,
          description,
          theme: {
            ...cloneTheme(activeTheme),
            id,
            name,
            description,
            isBuiltIn: false,
            createdAt: now,
            updatedAt: now,
          },
          createdAt: now,
          updatedAt: now,
        };

        set({ savedThemes: [...savedThemes, newTheme] });
        return id;
      },

      updateSavedTheme: (themeId, updates) => {
        const { savedThemes } = get();
        set({
          savedThemes: savedThemes.map((saved) =>
            saved.id === themeId
              ? { ...saved, ...updates, updatedAt: Date.now() }
              : saved
          ),
        });
      },

      deleteSavedTheme: (themeId) => {
        const { savedThemes, activeTheme } = get();
        // Don't delete if it's the active theme
        if (activeTheme.id === themeId) {
          set({ activeTheme: DEFAULT_THEME });
        }
        set({
          savedThemes: savedThemes.filter((t) => t.id !== themeId),
        });
      },

      duplicateTheme: (themeId, newName) => {
        const theme = get().getThemeById(themeId);
        if (!theme) return null;

        const { savedThemes } = get();
        const id = generateThemeId();
        const now = Date.now();

        const newTheme: SavedTheme = {
          id,
          name: newName,
          description: theme.description,
          theme: {
            ...cloneTheme(theme),
            id,
            name: newName,
            isBuiltIn: false,
            createdAt: now,
            updatedAt: now,
          },
          createdAt: now,
          updatedAt: now,
        };

        set({ savedThemes: [...savedThemes, newTheme] });
        return id;
      },

      // Import/Export
      exportTheme: (themeId) => {
        const theme = themeId
          ? get().getThemeById(themeId)
          : get().activeTheme;

        if (!theme) return '';

        const exportData = {
          ...cloneTheme(theme),
          exportedAt: Date.now(),
          version: 1,
        };

        return JSON.stringify(exportData, null, 2);
      },

      importTheme: (json) => {
        try {
          const parsed = JSON.parse(json);

          if (!isValidTheme(parsed)) {
            return { success: false, error: 'Invalid theme format' };
          }

          const { savedThemes } = get();
          const id = generateThemeId();
          const now = Date.now();

          const importedTheme: ChartTheme = {
            ...parsed,
            id,
            isBuiltIn: false,
            createdAt: now,
            updatedAt: now,
          };

          const newSaved: SavedTheme = {
            id,
            name: `${importedTheme.name} (Imported)`,
            description: importedTheme.description,
            theme: importedTheme,
            createdAt: now,
            updatedAt: now,
          };

          set({
            savedThemes: [...savedThemes, newSaved],
            activeTheme: importedTheme,
          });

          return { success: true };
        } catch {
          return { success: false, error: 'Failed to parse theme JSON' };
        }
      },

      // Editor UI
      openEditor: () => {
        const { activeTheme } = get();
        set({
          isEditorOpen: true,
          draftTheme: cloneTheme(activeTheme),
          activeEditorSection: 'colors',
        });
      },

      closeEditor: () => {
        set({
          isEditorOpen: false,
          draftTheme: null,
          activeEditorSection: null,
        });
      },

      setActiveEditorSection: (section) => {
        set({ activeEditorSection: section });
      },

      // Reset
      resetToDefault: () => {
        set({
          activeTheme: cloneTheme(DEFAULT_THEME),
          draftTheme: null,
        });
      },

      // Getters
      getAllThemes: () => {
        const { savedThemes } = get();
        return [...PRESET_THEMES, ...savedThemes.map((s) => s.theme)];
      },

      getThemeById: (themeId) => {
        // Check presets first
        const preset = PRESET_THEMES.find((t) => t.id === themeId);
        if (preset) return preset;

        // Check saved themes
        const { savedThemes } = get();
        const saved = savedThemes.find((t) => t.id === themeId);
        return saved?.theme;
      },
    }),
    {
      name: 'chart-theme-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeTheme: state.activeTheme,
        savedThemes: state.savedThemes,
      }),
    }
  )
);
