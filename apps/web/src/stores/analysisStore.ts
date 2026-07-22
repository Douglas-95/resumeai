import { create } from 'zustand'
import { Analysis } from '@resumeai/shared-types'

interface AnalysisState {
  currentAnalysis: Analysis | null
  loading: boolean
  error: string | null
  setCurrentAnalysis: (analysis: Analysis | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentAnalysis: null,
  loading: false,
  error: null,
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
