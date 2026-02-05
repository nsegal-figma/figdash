/**
 * useStorytelling Hook
 * Provides storytelling state and actions for chart components
 */

import { useCallback } from 'react';
import { useStorytellingStore } from '../stores/useStorytellingStore';
import { detectPatterns } from '../lib/storytelling/patternDetection';
import { detectCrossTabPatterns } from '../lib/storytelling/crossTabPatterns';
import type {
  Annotation,
  BarEmphasis,
  DataItem,
  CrossTabRow,
  AnnotationPosition,
} from '../types/storytelling';

export interface StorytellingContext {
  /** Whether storytelling mode is enabled */
  isEnabled: boolean;
  /** Whether to show annotations */
  showAnnotations: boolean;
  /** Whether to show visual emphasis */
  showEmphasis: boolean;
  /** Toggle storytelling mode */
  toggle: () => void;
  /** Enable storytelling mode */
  enable: () => void;
  /** Disable storytelling mode */
  disable: () => void;
}

/**
 * Main hook for consuming storytelling mode in components
 */
export function useStorytelling(): StorytellingContext {
  const settings = useStorytellingStore((state) => state.settings);
  const setEnabled = useStorytellingStore((state) => state.setEnabled);

  const toggle = useCallback(() => {
    setEnabled(!settings.enabled);
  }, [settings.enabled, setEnabled]);

  const enable = useCallback(() => {
    setEnabled(true);
  }, [setEnabled]);

  const disable = useCallback(() => {
    setEnabled(false);
  }, [setEnabled]);

  return {
    isEnabled: settings.enabled,
    showAnnotations: settings.enabled && settings.showAnnotations,
    showEmphasis: settings.enabled && settings.showEmphasis,
    toggle,
    enable,
    disable,
  };
}

/**
 * Hook for chart-specific storytelling (annotations, emphasis)
 */
export function useChartStorytelling(columnName: string) {
  const settings = useStorytellingStore((state) => state.settings);
  const thresholds = useStorytellingStore((state) => state.thresholds);
  const chartConfigs = useStorytellingStore((state) => state.chartConfigs);
  const setChartPatterns = useStorytellingStore((state) => state.setChartPatterns);
  const updateAnnotation = useStorytellingStore((state) => state.updateAnnotation);
  const removeAnnotation = useStorytellingStore((state) => state.removeAnnotation);
  const addCustomAnnotation = useStorytellingStore((state) => state.addCustomAnnotation);
  const toggleAnnotationVisibility = useStorytellingStore(
    (state) => state.toggleAnnotationVisibility
  );

  const config = chartConfigs[columnName];
  const isEnabled = settings.enabled;

  // Analyze chart data and detect patterns
  const analyzeChart = useCallback(
    (data: DataItem[], totalN: number) => {
      if (!isEnabled || !settings.autoDetect) return;

      const patterns = detectPatterns(data, columnName, totalN, thresholds);
      setChartPatterns(columnName, patterns, totalN);
    },
    [columnName, isEnabled, settings.autoDetect, thresholds, setChartPatterns]
  );

  // Get annotations for a specific bar
  const getAnnotationsForBar = useCallback(
    (barName: string): Annotation[] => {
      if (!config || !isEnabled || !settings.showAnnotations) return [];
      return config.annotations.filter((a) => a.targetBar === barName && a.isVisible);
    },
    [config, isEnabled, settings.showAnnotations]
  );

  // Get emphasis for a specific bar
  const getEmphasisForBar = useCallback(
    (barName: string): BarEmphasis | undefined => {
      if (!config || !isEnabled || !settings.showEmphasis) return undefined;
      return config.emphasis.find((e) => e.targetBar === barName);
    },
    [config, isEnabled, settings.showEmphasis]
  );

  // Update annotation text
  const updateAnnotationText = useCallback(
    (annotationId: string, text: string) => {
      updateAnnotation(columnName, annotationId, { text });
    },
    [columnName, updateAnnotation]
  );

  // Remove annotation
  const removeAnnotationById = useCallback(
    (annotationId: string) => {
      removeAnnotation(columnName, annotationId);
    },
    [columnName, removeAnnotation]
  );

  // Add custom annotation
  const addAnnotation = useCallback(
    (targetBar: string, text: string, position?: AnnotationPosition) => {
      addCustomAnnotation(columnName, targetBar, text, position);
    },
    [columnName, addCustomAnnotation]
  );

  // Toggle annotation visibility
  const toggleVisibility = useCallback(
    (annotationId: string) => {
      toggleAnnotationVisibility(columnName, annotationId);
    },
    [columnName, toggleAnnotationVisibility]
  );

  return {
    // State
    isEnabled,
    config,
    patterns: config?.patterns || [],
    annotations: config?.annotations || [],
    emphasis: config?.emphasis || [],

    // Analysis
    analyzeChart,

    // Getters
    getAnnotationsForBar,
    getEmphasisForBar,

    // Actions
    updateAnnotationText,
    removeAnnotation: removeAnnotationById,
    addAnnotation,
    toggleVisibility,
  };
}

/**
 * Hook for cross-tab specific storytelling
 */
export function useCrossTabStorytelling(crossTabId: string) {
  const settings = useStorytellingStore((state) => state.settings);
  const thresholds = useStorytellingStore((state) => state.thresholds);
  const crossTabConfigs = useStorytellingStore((state) => state.crossTabConfigs);
  const setCrossTabPatterns = useStorytellingStore((state) => state.setCrossTabPatterns);
  const updateCrossTabAnnotation = useStorytellingStore(
    (state) => state.updateCrossTabAnnotation
  );

  const config = crossTabConfigs[crossTabId];
  const isEnabled = settings.enabled;

  // Analyze cross-tab data
  const analyzeCrossTab = useCallback(
    (data: CrossTabRow[], rowColumn: string, segmentColumn: string) => {
      if (!isEnabled || !settings.autoDetect) return;

      const patterns = detectCrossTabPatterns(data, rowColumn, segmentColumn, thresholds);
      setCrossTabPatterns(crossTabId, rowColumn, segmentColumn, patterns);
    },
    [crossTabId, isEnabled, settings.autoDetect, thresholds, setCrossTabPatterns]
  );

  // Get annotations for a specific row/segment combination
  const getAnnotationsForSegment = useCallback(
    (rowLabel: string, segmentName?: string): Annotation[] => {
      if (!config || !isEnabled || !settings.showAnnotations) return [];
      return config.annotations.filter(
        (a) =>
          a.targetBar === rowLabel &&
          a.isVisible &&
          (segmentName === undefined || a.targetSegment === segmentName)
      );
    },
    [config, isEnabled, settings.showAnnotations]
  );

  // Get emphasis for a specific segment
  const getEmphasisForSegment = useCallback(
    (rowLabel: string, segmentName?: string): BarEmphasis | undefined => {
      if (!config || !isEnabled || !settings.showEmphasis) return undefined;
      return config.emphasis.find(
        (e) =>
          e.targetBar === rowLabel &&
          (segmentName === undefined || e.targetSegment === segmentName)
      );
    },
    [config, isEnabled, settings.showEmphasis]
  );

  // Update annotation
  const updateAnnotationText = useCallback(
    (annotationId: string, text: string) => {
      updateCrossTabAnnotation(crossTabId, annotationId, { text });
    },
    [crossTabId, updateCrossTabAnnotation]
  );

  return {
    isEnabled,
    config,
    patterns: config?.patterns || [],
    annotations: config?.annotations || [],
    emphasis: config?.emphasis || [],

    analyzeCrossTab,
    getAnnotationsForSegment,
    getEmphasisForSegment,
    updateAnnotationText,
  };
}

/**
 * Hook for storytelling settings management
 */
export function useStorytellingSettings() {
  const settings = useStorytellingStore((state) => state.settings);
  const thresholds = useStorytellingStore((state) => state.thresholds);
  const updateSettings = useStorytellingStore((state) => state.updateSettings);
  const updateThresholds = useStorytellingStore((state) => state.updateThresholds);
  const resetAll = useStorytellingStore((state) => state.resetAll);
  const clearAllPatterns = useStorytellingStore((state) => state.clearAllPatterns);

  return {
    settings,
    thresholds,
    updateSettings,
    updateThresholds,
    reset: resetAll,
    clearPatterns: clearAllPatterns,
  };
}
