'use client'

import { Insight, InsightType } from '@resumeai/shared-types'
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface InsightCardProps {
  insight: Insight
}

const configMap: Record<
  InsightType,
  { icon: any; colorClass: string; bgClass: string; label: string }
> = {
  STRENGTH: { icon: CheckCircle2, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10', label: 'Ponto Forte' },
  WEAKNESS: { icon: AlertTriangle, colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10', label: 'Ponto Fraco' },
  MISSING_INFO: { icon: Info, colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10', label: 'Info Ausente' },
  REDUNDANT_INFO: { icon: HelpCircle, colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10', label: 'Redundância' },
  LONG_PARAGRAPH: { icon: HelpCircle, colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10', label: 'Texto Longo' },
  POOR_EXPERIENCE_DESC: { icon: AlertTriangle, colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10', label: 'Descrição Fraca' },
  EXCESSIVE_TEXT: { icon: HelpCircle, colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10', label: 'Excesso Texto' },
  LACK_OBJECTIVITY: { icon: HelpCircle, colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10', label: 'Pouco Objetivo' },
  FEW_ACTION_VERBS: { icon: AlertTriangle, colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10', label: 'Falta Verbos de Ação' },
  FEW_METRICS: { icon: AlertTriangle, colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10', label: 'Pouca Métrica' },
  ATS_UNFRIENDLY: { icon: AlertTriangle, colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10', label: 'Incompatível ATS' },
  GENERIC_WORDS: { icon: HelpCircle, colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10', label: 'Termos Genéricos' },
  OUTDATED_INFO: { icon: Info, colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10', label: 'Desatualizado' },
}

export function InsightCard({ insight }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false)
  const config = configMap[insight.type] || {
    icon: HelpCircle,
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted/10',
    label: 'Análise',
  }
  const Icon = config.icon

  return (
    <div className="glass overflow-hidden rounded-xl border border-border/50 transition-all duration-200 hover:scale-[1.005]">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-5 text-left focus:outline-none"
        id={`insight-btn-${insight.type.toLowerCase()}`}
      >
        <div className="flex items-center gap-4">
          <div className={cn('rounded-lg p-2.5', config.bgClass, config.colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <span className={cn('text-xs font-bold uppercase tracking-wider', config.colorClass)}>
              {config.label}
            </span>
            <h3 className="text-base font-semibold leading-tight mt-0.5">{insight.problem}</h3>
          </div>
        </div>
        <div>{expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}</div>
      </button>

      {/* Expandable Body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50 bg-muted/20 p-5 space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-foreground">O Problema</h4>
                <p className="mt-1 text-muted-foreground leading-relaxed">{insight.explanation}</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Impacto no Processo</h4>
                <p className="mt-1 text-muted-foreground leading-relaxed">{insight.impact}</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Como Corrigir</h4>
                <p className="mt-1 text-muted-foreground leading-relaxed">{insight.howToFix}</p>
              </div>

              {insight.improvementExample && (
                <div className="rounded-lg border border-border/50 bg-card p-4 space-y-2">
                  <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider text-primary">
                    Exemplo de Melhoria
                  </h4>
                  <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {insight.improvementExample}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
