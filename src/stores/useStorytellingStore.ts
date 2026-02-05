/**
 * Storytelling Store
 * Manages storytelling mode state with localStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  StorytellingSettings,
  ChartStorytellingConfig,
  CrossTabStorytellingConfig,
  Annotation,
  BarEmphasis,
  DetectedPattern,
  PatternThresholds,
  AnnotationPosition,
} from '../types/storytelling';
import { DEFAULT_THRESHOLDS } from '../lib/storytelling/patternDetection';

// Default settings
const DEFAULT_SETTINGS: StorytellingSettings = {
  enabled: false,
  autoDetect: true,
  showAnnotations: true,
  showEmphasis: true,
  confidenceThreshold: 0.6,
  defaultAnnotationPosition: 'right',
  defaultEmphasisStyle: 'highlight',
};

interface StorytellingStore {
  // Global settings
  settings: StorytellingSettings;
  thresholds: PatternThresholds;

  // Per-chart configurations (keyed by columnName)
  chartConfigs: Record<string, ChartStorytellingConfig>;

  // Per-cross-tab configurations (keyed by crossTabId)
  crossTabConfigs: Record<string, CrossTabStorytellingConfig>;

  // Actions - Settings
  setEnabled: (enabled: boolean) => void;
  updateSettings: (updates: Partial<StorytellingSettings>) => void;
  updateThresholds: (updates: Partial<PatternThresholds>) => void;

  // Actions - Chart Patterns
  setChartPatterns: (columnName: string, patterns: DetectedPattern[], totalN: number) => void;
  clearChartPatterns: (columnName: string) => void;

  // Actions - Cross-Tab Patterns
  setCrossTabPatterns: (
    crossTabId: string,
    rowColumn: string,
    segmentColumn: string,
    patterns: DetectedPattern[]
  ) => void;
  clearCrossTabPatterns: (crossTabId: string) => void;

  // Actions - Annotations
  updateAnnotation: (
    columnName: string,
    annotationId: string,
    updates: Partial<Annotation>
  ) => void;
  addCustomAnnotation: (
    columnName: string,
    targetBar: string,
    text: string,
    position?: AnnotationPosition
  ) => void;
  removeAnnotation: (columnName: string, annotationId: string) => void;
  toggleAnnotationVisibility: (columnName: string, annotationId: string) => void;

  // Actions - Cross-Tab Annotations
  updateCrossTabAnnotation: (
    crossTabId: string,
    annotationId: string,
    updates: Partial<Annotation>
  ) => void;

  // Getters
  getChartConfig: (columnName: string) => ChartStorytellingConfig | undefined;
  getCrossTabConfig: (crossTabId: string) => CrossTabStorytellingConfig | undefined;
  getAnnotationsForBar: (columnName: string, barName: string) => Annotation[];
  getEmphasisForBar: (columnName: string, barName: string) => BarEmphasis | undefined;

  // Reset
  resetAll: () => void;
  clearAllPatterns: () => void;
}

export const useStorytellingStore = create<StorytellingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: DEFAULT_SETTINGS,
      thresholds: DEFAULT_THRESHOLDS,
      chartConfigs: {},
      crossTabConfigs: {},

      // Settings actions
      setEnabled: (enabled) => {
        set((state) => ({
          settings: { ...state.settings, enabled },
        }));
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      updateThresholds: (updates) => {
        set((state) => ({
          thresholds: { ...state.thresholds, ...updates },
        }));
      },

      // Chart pattern actions
      setChartPatterns: (columnName, patterns, _totalN) => {
        set((state) => {
          const existing = state.chartConfigs[columnName];

          // Generate annotations from patterns
          const annotations: Annotation[] = patterns
            .filter((p) => p.confidence >= state.settings.confidenceThreshold)
            .slice(0, 3) // Limit to top 3 annotations per chart
            .map((p) => ({
              id: `ann-${p.id}`,
              patternId: p.id,
              targetBar: p.targetBars[0],
              targetSegment: p.targetSegment,
              text: p.suggestedAnnotation,
              isCustom: false,
              position: state.settings.defaultAnnotationPosition,
              isVisible: true,
            }));

          // Generate emphasis from patterns
          const emphasis: BarEmphasis[] = patterns
            .filter((p) => p.confidence >= state.settings.confidenceThreshold)
            .flatMap((p) =>
              p.targetBars.slice(0, 1).map((bar) => ({
                // Only emphasize first bar
                targetBar: bar,
                targetSegment: p.targetSegment,
                style: state.settings.defaultEmphasisStyle,
                intensity: p.importance,
              }))
            );

          // Preserve custom annotations from existing config
          const customAnnotations = existing?.annotations.filter((a) => a.isCustom) || [];

          return {
            chartConfigs: {
              ...state.chartConfigs,
              [columnName]: {
                columnName,
                patterns,
                annotations: [
                  ...customAnnotations,
                  ...annotations.filter(
                    (a) => !customAnnotations.some((ca) => ca.targetBar === a.targetBar)
                  ),
                ],
                emphasis,
                analyzedAt: Date.now(),
              },
            },
          };
        });
      },

      clearChartPatterns: (columnName) => {
        set((state) => {
          const { [columnName]: _, ...rest } = state.chartConfigs;
          return { chartConfigs: rest };
        });
      },

      // Cross-tab pattern actions
      setCrossTabPatterns: (crossTabId, rowColumn, segmentColumn, patterns) => {
        set((state) => {
          const annotations: Annotation[] = patterns
            .filter((p) => p.confidence >= state.settings.confidenceThreshold)
            .slice(0, 2)
            .map((p) => ({
              id: `ann-${p.id}`,
              patternId: p.id,
              targetBar: p.targetBars[0],
              targetSegment: p.targetSegment,
              text: p.suggestedAnnotation,
              isCustom: false,
              position: 'above' as AnnotationPosition,
              isVisible: true,
            }));

          const emphasis: BarEmphasis[] = patterns
            .filter((p) => p.confidence >= state.settings.confidenceThreshold)
            .flatMap((p) =>
              p.targetBars.slice(0, 1).map((bar) => ({
                targetBar: bar,
                targetSegment: p.targetSegment,
                style: state.settings.defaultEmphasisStyle,
                intensity: p.importance,
              }))
            );

          return {
            crossTabConfigs: {
              ...state.crossTabConfigs,
              [crossTabId]: {
                crossTabId,
                rowColumn,
                segmentColumn,
                patterns,
                annotations,
                emphasis,
                analyzedAt: Date.now(),
              },
            },
          };
        });
      },

      clearCrossTabPatterns: (crossTabId) => {
        set((state) => {
          const { [crossTabId]: _, ...rest } = state.crossTabConfigs;
          return { crossTabConfigs: rest };
        });
      },

      // Annotation actions
      updateAnnotation: (columnName, annotationId, updates) => {
        set((state) => {
          const config = state.chartConfigs[columnName];
          if (!config) return state;

          return {
            chartConfigs: {
              ...state.chartConfigs,
              [columnName]: {
                ...config,
                annotations: config.annotations.map((ann) =>
                  ann.id === annotationId ? { ...ann, ...updates, isCustom: true } : ann
                ),
              },
            },
          };
        });
      },

      addCustomAnnotation: (columnName, targetBar, text, position) => {
        set((state) => {
          const config = state.chartConfigs[columnName] || {
            columnName,
            patterns: [],
            annotations: [],
            emphasis: [],
            analyzedAt: Date.now(),
          };

          const newAnnotation: Annotation = {
            id: `custom-${Date.now()}`,
            targetBar,
            text,
            isCustom: true,
            position: position || state.settings.defaultAnnotationPosition,
            isVisible: true,
          };

          return {
            chartConfigs: {
              ...state.chartConfigs,
              [columnName]: {
                ...config,
                annotations: [...config.annotations, newAnnotation],
              },
            },
          };
        });
      },

      removeAnnotation: (columnName, annotationId) => {
        set((state) => {
          const config = state.chartConfigs[columnName];
          if (!config) return state;

          return {
            chartConfigs: {
              ...state.chartConfigs,
              [columnName]: {
                ...config,
                annotations: config.annotations.filter((a) => a.id !== annotationId),
              },
            },
          };
        });
      },

      toggleAnnotationVisibility: (columnName, annotationId) => {
        set((state) => {
          const config = state.chartConfigs[columnName];
          if (!config) return state;

          return {
            chartConfigs: {
              ...state.chartConfigs,
              [columnName]: {
                ...config,
                annotations: config.annotations.map((ann) =>
                  ann.id === annotationId ? { ...ann, isVisible: !ann.isVisible } : ann
                ),
              },
            },
          };
        });
      },

      updateCrossTabAnnotation: (crossTabId, annotationId, updates) => {
        set((state) => {
          const config = state.crossTabConfigs[crossTabId];
          if (!config) return state;

          return {
            crossTabConfigs: {
              ...state.crossTabConfigs,
              [crossTabId]: {
                ...config,
                annotations: config.annotations.map((ann) =>
                  ann.id === annotationId ? { ...ann, ...updates, isCustom: true } : ann
                ),
              },
            },
          };
        });
      },

      // Getters
      getChartConfig: (columnName) => get().chartConfigs[columnName],

      getCrossTabConfig: (crossTabId) => get().crossTabConfigs[crossTabId],

      getAnnotationsForBar: (columnName, barName) => {
        const config = get().chartConfigs[columnName];
        if (!config) return [];
        return config.annotations.filter((a) => a.targetBar === barName && a.isVisible);
      },

      getEmphasisForBar: (columnName, barName) => {
        const config = get().chartConfigs[columnName];
        if (!config) return undefined;
        return config.emphasis.find((e) => e.targetBar === barName);
      },

      // Reset
      resetAll: () => {
        set({
          settings: DEFAULT_SETTINGS,
          thresholds: DEFAULT_THRESHOLDS,
          chartConfigs: {},
          crossTabConfigs: {},
        });
      },

      clearAllPatterns: () => {
        set({
          chartConfigs: {},
          crossTabConfigs: {},
        });
      },
    }),
    {
      name: 'storytelling-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        thresholds: state.thresholds,
        // Only persist custom annotations (auto-generated will regenerate)
        chartConfigs: Object.fromEntries(
          Object.entries(state.chartConfigs).map(([key, config]) => [
            key,
            {
              ...config,
              annotations: config.annotations.filter((a) => a.isCustom),
              patterns: [], // Don't persist patterns
              emphasis: [], // Don't persist emphasis
            },
          ])
        ),
      }),
    }
  )
);
