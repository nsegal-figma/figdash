import { create } from 'zustand';
import type { SurveyData } from '../types/survey';

interface SurveyStore {
  surveyData: SurveyData | null;
  isLoading: boolean;
  error: string | null;
  setSurveyData: (data: SurveyData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSurvey: () => void;
}

export const useSurveyStore = create<SurveyStore>((set) => ({
  surveyData: null,
  isLoading: false,
  error: null,
  setSurveyData: (data) => set({ surveyData: data, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  clearSurvey: () => set({ surveyData: null, error: null, isLoading: false }),
}));




