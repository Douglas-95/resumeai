import { useEffect, useRef } from 'react'
import { useAnalysisStore } from '../stores/analysisStore'
import { Analysis } from '@resumeai/shared-types'

export function useAnalysis(analysisId: string) {
  const { currentAnalysis, loading, error, setCurrentAnalysis, setLoading, setError } =
    useAnalysisStore()
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAnalysis = async (isPoll = false) => {
    if (!isPoll) setLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/analyses/${analysisId}`,
      )
      if (!response.ok) {
        throw new Error('Falha ao carregar a análise do currículo.')
      }

      const { data } = await response.json()
      setCurrentAnalysis(data)
      setError(null)
      return data as Analysis
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar análise')
      return null
    } finally {
      if (!isPoll) setLoading(false)
    }
  };

  useEffect(() => {
    if (!analysisId) return

    fetchAnalysis()

    // Setup polling if the analysis is still pending or processing
    const startPolling = () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)

      pollingIntervalRef.current = setInterval(async () => {
        const data = await fetchAnalysis(true)
        if (
          data &&
          data.status !== 'PENDING' &&
          data.status !== 'PROCESSING'
        ) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
        }
      }, 3000) // Poll every 3 seconds
    }

    if (
      currentAnalysis?.status === 'PENDING' ||
      currentAnalysis?.status === 'PROCESSING'
    ) {
      startPolling()
    } else {
      // Re-evaluate if status changed inside local state
      const checkStatus = async () => {
        const initialData = await fetchAnalysis()
        if (
          initialData &&
          (initialData.status === 'PENDING' || initialData.status === 'PROCESSING')
        ) {
          startPolling()
        }
      }
      checkStatus()
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [analysisId, currentAnalysis?.status])

  return {
    analysis: currentAnalysis,
    loading,
    error,
    refetch: () => fetchAnalysis(false),
  }
}
