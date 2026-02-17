import { create } from 'zustand';
import type { SurveyData } from '../types/survey';
import { DEFAULT_PALETTE, type ColorPalette } from '../lib/colorPalettes';
import type { AISummaryResponse } from '../lib/ai/openai';
import type { Insight } from '../lib/ai/insightDiscovery';
import type { ExecutiveSummary } from '../lib/ai/executiveSummary';
import type { CleaningReport, CleaningSettings, CleaningMode } from '../types/cleaning';
import type { ChartType } from '../types/chartTypes';

export type SortOrder = 'desc' | 'asc';

interface SurveyStore {
  surveyData: SurveyData | null;
  isLoading: boolean;
  error: string | null;
  selectedPalette: ColorPalette;
  sortOrder: SortOrder;
  aiSummaries: Map<string, AISummaryResponse>;
  isGeneratingAI: boolean;
  filters: Map<string, string[]>; // columnName -> selected values
  customTitles: Map<string, string>; // columnName -> custom title
  figmaToken: string | null;
  insights: Insight[];
  executiveSummary: ExecutiveSummary | null;
  isGeneratingInsights: boolean;
  surveyType: 'regular' | 'screener';

  // Chart Type Selections
  chartTypeSelections: Map<string, ChartType>;

  // Data Cleaning
  originalData: SurveyData | null;
  cleaningReport: CleaningReport | null;
  cleaningSettings: CleaningSettings | null;
  cleaningMode: CleaningMode | null;
  isCleaningInProgress: boolean;

  setSurveyData: (data: SurveyData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedPalette: (palette: ColorPalette) => void;
  setSortOrder: (order: SortOrder) => void;
  setAISummary: (columnName: string, summary: AISummaryResponse) => void;
  setIsGeneratingAI: (isGenerating: boolean) => void;
  setFilter: (columnName: string, values: string[]) => void;
  clearFilter: (columnName: string) => void;
  clearAllFilters: () => void;
  setCustomTitle: (columnName: string, title: string) => void;
  clearCustomTitle: (columnName: string) => void;
  setFigmaToken: (token: string | null) => void;
  setInsights: (insights: Insight[]) => void;
  setExecutiveSummary: (summary: ExecutiveSummary) => void;
  setIsGeneratingInsights: (isGenerating: boolean) => void;
  setSurveyType: (type: 'regular' | 'screener') => void;

  // Chart Type Actions
  setChartType: (columnName: string, type: ChartType) => void;
  getChartType: (columnName: string) => ChartType | undefined; // Use chartTypeSelections.get() directly instead

  // Data Cleaning Actions
  setOriginalData: (data: SurveyData) => void;
  setCleaningReport: (report: CleaningReport | null) => void;
  setCleaningSettings: (settings: CleaningSettings | null) => void;
  setCleaningMode: (mode: CleaningMode | null) => void;
  setIsCleaningInProgress: (isInProgress: boolean) => void;
  revertToOriginal: () => void;

  clearSurvey: () => void;
}

export const useSurveyStore = create<SurveyStore>((set) => ({
  surveyData: null,
  isLoading: false,
  error: null,
  selectedPalette: DEFAULT_PALETTE,
  sortOrder: 'desc',
  aiSummaries: new Map(),
  isGeneratingAI: false,
  filters: new Map(),
  customTitles: new Map(),
  figmaToken: localStorage.getItem('figma_token') || null,
  insights: [],
  executiveSummary: null,
  isGeneratingInsights: false,
  surveyType: 'regular',

  // Chart Type Selections
  chartTypeSelections: new Map(),

  // Data Cleaning State
  originalData: null,
  cleaningReport: null,
  cleaningSettings: null,
  cleaningMode: null,
  isCleaningInProgress: false,
  setSurveyData: (data) => set({ surveyData: data, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  setSelectedPalette: (palette) => set({ selectedPalette: palette }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setAISummary: (columnName, summary) =>
    set((state) => {
      const newSummaries = new Map(state.aiSummaries);
      newSummaries.set(columnName, summary);
      return { aiSummaries: newSummaries };
    }),
  setIsGeneratingAI: (isGenerating) => set({ isGeneratingAI: isGenerating }),
  setFilter: (columnName, values) =>
    set((state) => {
      const newFilters = new Map(state.filters);
      if (values.length === 0) {
        newFilters.delete(columnName);
      } else {
        newFilters.set(columnName, values);
      }
      return { filters: newFilters };
    }),
  clearFilter: (columnName) =>
    set((state) => {
      const newFilters = new Map(state.filters);
      newFilters.delete(columnName);
      return { filters: newFilters };
    }),
  clearAllFilters: () => set({ filters: new Map() }),
  setCustomTitle: (columnName, title) =>
    set((state) => {
      const newTitles = new Map(state.customTitles);
      newTitles.set(columnName, title);
      return { customTitles: newTitles };
    }),
  clearCustomTitle: (columnName) =>
    set((state) => {
      const newTitles = new Map(state.customTitles);
      newTitles.delete(columnName);
      return { customTitles: newTitles };
    }),
  setFigmaToken: (token) => {
    if (token) {
      localStorage.setItem('figma_token', token);
    } else {
      localStorage.removeItem('figma_token');
    }
    set({ figmaToken: token });
  },
  setInsights: (insights) => set({ insights }),
  setExecutiveSummary: (summary) => set({ executiveSummary: summary }),
  setIsGeneratingInsights: (isGenerating) => set({ isGeneratingInsights: isGenerating }),
  setSurveyType: (type) => set({ surveyType: type }),

  // Chart Type Actions
  setChartType: (columnName, type) =>
    set((state) => {
      const newSelections = new Map(state.chartTypeSelections);
      newSelections.set(columnName, type);
      return { chartTypeSelections: newSelections };
    }),
  // Note: Use chartTypeSelections.get() directly instead of this getter
  getChartType: (_: string): ChartType | undefined => undefined,

  // Data Cleaning Actions
  setOriginalData: (data) => set({ originalData: data }),
  setCleaningReport: (report) => set({ cleaningReport: report }),
  setCleaningSettings: (settings) => set({ cleaningSettings: settings }),
  setCleaningMode: (mode) => set({ cleaningMode: mode }),
  setIsCleaningInProgress: (isInProgress) => set({ isCleaningInProgress: isInProgress }),
  revertToOriginal: () =>
    set((state) => ({
      surveyData: state.originalData,
      cleaningReport: null,
      cleaningSettings: null,
    })),

  clearSurvey: () =>
    set({
      surveyData: null,
      error: null,
      isLoading: false,
      aiSummaries: new Map(),
      filters: new Map(),
      customTitles: new Map(),
      insights: [],
      executiveSummary: null,
      originalData: null,
      cleaningReport: null,
      cleaningSettings: null,
      cleaningMode: null,
      isCleaningInProgress: false,
      surveyType: 'regular',
    }),
}));






