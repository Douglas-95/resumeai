'use client'

import { useParams } from 'next/navigation'
import { useAnalysis } from '@/hooks/useAnalysis'
import { CircularScore } from '@/components/features/scores/CircularScore'
import { ScoreRadarChart } from '@/components/features/dashboard/ScoreRadarChart'
import { InsightCard } from '@/components/features/analysis/InsightCard'
import { ATSReport } from '@/components/features/analysis/ATSReport'
import { STARRewrite } from '@/components/features/analysis/STARRewrite'
import { XYZRewrite } from '@/components/features/analysis/XYZRewrite'
import { ImprovementsView } from '@/components/features/analysis/ImprovementsView'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  AlertTriangle,
  LayoutDashboard,
  ShieldAlert,
  Activity,
  FileText,
  CopyCheck,
  CheckCircle,
  Lightbulb,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type TabType = 'overview' | 'insights' | 'ats' | 'rewrites' | 'improvements'

export default function AnalysisPage() {
  const params = useParams()
  const analysisId = params.id as string
  const { analysis, loading, error } = useAnalysis(analysisId)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Loading / Processing state UI
  if (loading || !analysis || analysis.status === 'PENDING' || analysis.status === 'PROCESSING') {
    const isProcessing = analysis?.status === 'PROCESSING'
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            {isProcessing ? 'Analisando Currículo...' : 'Aguardando na fila...'}
          </h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Nossa Inteligência Artificial está avaliando seu currículo linha por linha como um recrutador técnico sênior. Isso pode levar alguns segundos.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-xs text-muted-foreground bg-muted/30 border border-border/30 rounded-xl px-4 py-3 min-w-[280px]">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span>Upload do arquivo concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span>Texto bruto extraído com sucesso</span>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            <span>Gerando scores e reescritas...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state UI
  if (error || analysis.status === 'ERROR') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
        <div className="rounded-2xl bg-destructive/10 p-4 text-destructive">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-destructive">Falha na análise</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            {error || 'Não foi possível completar a análise deste arquivo currículo. Por favor, tente fazer o upload novamente.'}
          </p>
        </div>
      </div>
    )
  }

  // Graceful degradation warning banner
  const hasPartialErrors = analysis.status === 'PARTIAL_ERROR'

  const tabItems: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'ats', label: 'ATS Analysis', icon: Activity },
    { id: 'rewrites', label: 'STAR / XYZ', icon: CopyCheck },
    { id: 'improvements', label: 'Melhorias', icon: FileText },
  ]

  return (
    <div className="space-y-8">
      {/* Graceful Degradation Alert Banner */}
      {hasPartialErrors && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-amber-500 text-sm">
          <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Análise Parcial</span>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Algumas etapas da análise de IA apresentaram instabilidades temporárias e foram puladas para não bloquear seu acesso. Os dados disponíveis estão sendo exibidos abaixo.
            </p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-border/50 overflow-x-auto pb-px">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            id={`tab-btn-${tab.id}`}
            className={cn(
              'flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-medium transition-all focus:outline-none whitespace-nowrap',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            {/* 1. OVERVIEW PANEL */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {analysis.scores ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Overall metrics */}
                    <div className="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                      <CircularScore score={analysis.scores.overall.value} size={150} strokeWidth={12} label="Score Geral" />
                      <p className="text-xs text-muted-foreground mt-4 px-4">
                        {analysis.scores.overall.justification}
                      </p>
                    </div>

                    {/* Radar graphic */}
                    <div className="glass p-6 rounded-2xl flex flex-col justify-between">
                      <h3 className="text-sm font-bold text-muted-foreground">Distribuição de Notas</h3>
                      <ScoreRadarChart scores={analysis.scores} />
                    </div>

                    {/* Other scores progress bars */}
                    <div className="glass p-6 rounded-2xl space-y-4">
                      <h3 className="text-sm font-bold text-muted-foreground">Detalhamento das Métricas</h3>
                      <div className="space-y-3">
                        {Object.entries(analysis.scores)
                          .filter(([key]) => key !== 'overall')
                          .map(([key, score]: [string, any]) => (
                            <div key={key} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold capitalize">{key}</span>
                                <span className="text-muted-foreground font-bold">{score.value}/100</span>
                              </div>
                              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all duration-500"
                                  style={{ width: `${score.value}%` }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass p-8 text-center rounded-2xl">
                    <p className="text-muted-foreground text-sm">Os scores gerais de IA estão indisponíveis temporariamente.</p>
                  </div>
                )}
              </div>
            )}

            {/* 2. INSIGHTS PANEL */}
            {activeTab === 'insights' && (
              <div className="space-y-4">
                {analysis.insights && analysis.insights.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {analysis.insights.map((insight, idx) => (
                      <InsightCard key={idx} insight={insight} />
                    ))}
                  </div>
                ) : (
                  <div className="glass p-8 text-center rounded-2xl">
                    <p className="text-muted-foreground text-sm">Os insights analíticos estão indisponíveis temporariamente.</p>
                  </div>
                )}
              </div>
            )}

            {/* 3. ATS COMPATIBILITY PANEL */}
            {activeTab === 'ats' && (
              <div>
                {analysis.atsAnalysis ? (
                  <ATSReport report={analysis.atsAnalysis} />
                ) : (
                  <div className="glass p-8 text-center rounded-2xl">
                    <p className="text-muted-foreground text-sm">A análise de compatibilidade ATS está indisponível temporariamente.</p>
                  </div>
                )}
              </div>
            )}

            {/* 4. STAR / XYZ REWRITE PANEL */}
            {activeTab === 'rewrites' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <STARRewrite rewrites={analysis.starRewrites || []} />
                </div>
                <div>
                  <XYZRewrite rewrites={analysis.xyzRewrites || []} />
                </div>
              </div>
            )}

            {/* 5. SUGGESTIONS PANEL */}
            {activeTab === 'improvements' && (
              <div>
                {analysis.improvements ? (
                  <ImprovementsView improvements={analysis.improvements} />
                ) : (
                  <div className="glass p-8 text-center rounded-2xl">
                    <p className="text-muted-foreground text-sm font-medium">As sugestões de plataformas e currículos alternativos estão indisponíveis temporariamente.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
