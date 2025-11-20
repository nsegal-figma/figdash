import { create } from 'zustand';
import type { SurveyData } from '../types/survey';
import { DEFAULT_PALETTE, type ColorPalette } from '../lib/colorPalettes';
import type { AISummaryResponse } from '../lib/ai/openai';

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
  clearSurvey: () => set({ surveyData: null, error: null, isLoading: false, aiSummaries: new Map(), filters: new Map(), customTitles: new Map() }),
}));





