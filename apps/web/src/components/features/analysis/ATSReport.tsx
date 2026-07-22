'use client'

import { ATSAnalysis } from '@resumeai/shared-types'
import { CircularScore } from '../scores/CircularScore'
import { Check, X, AlertTriangle, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ATSReportProps {
  report: ATSAnalysis
}

export function ATSReport({ report }: ATSReportProps) {
  const checkItems = [
    { label: 'Leitura por ATS', value: report.isReadable, desc: 'O texto pôde ser lido de forma linear.' },
    { label: 'Uso de Tabelas', value: !report.hasTables, desc: 'Evitar tabelas ajuda no rastreamento de texto.' },
    { label: 'Uso de Imagens', value: !report.hasImages, desc: 'Imagens e gráficos são ignorados por robôs ATS.' },
    { label: 'Uso de Colunas', value: !report.hasColumns, desc: 'Múltiplas colunas podem embaralhar a ordem de leitura.' },
    { label: 'Compatibilidade PDF', value: report.isPDFCompatible, desc: 'O arquivo possui texto selecionável (não é imagem).' },
  ]

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass flex flex-col items-center justify-center p-6 rounded-2xl text-center">
          <CircularScore score={report.score} size={130} strokeWidth={10} label="Pontuação ATS" />
        </div>

        <div className="glass md:col-span-2 p-6 rounded-2xl flex flex-col justify-center space-y-4">
          <h3 className="text-lg font-bold">Ordem de Leitura e Estrutura</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card/40 border border-border/30 rounded-xl p-4">
              <span className="text-xs text-muted-foreground">Ordem das Seções</span>
              <p className="font-semibold text-sm mt-1">{report.sectionOrder || 'Tradicional'}</p>
            </div>
            <div className="bg-card/40 border border-border/30 rounded-xl p-4">
              <span className="text-xs text-muted-foreground">Palavras-chave Encontradas</span>
              <p className="font-semibold text-sm mt-1">{report.keywordCount} palavras</p>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="glass p-6 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold">Checklist de Estrutura do Arquivo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checkItems.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 p-3 bg-card/25 border border-border/30 rounded-xl"
            >
              <div className="mt-0.5">
                {item.value ? (
                  <div className="rounded-full bg-emerald-500/10 p-1 text-emerald-500">
                    <Check className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="rounded-full bg-rose-500/10 p-1 text-rose-500">
                    <X className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issues & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Issues */}
        <div className="glass p-6 rounded-2xl space-y-4 border border-rose-500/10">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-lg font-bold">Problemas Críticos detectados</h3>
          </div>
          {report.issues.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum problema crítico detectado no arquivo.</p>
          ) : (
            <ul className="space-y-2">
              {report.issues.map((issue, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recommendations */}
        <div className="glass p-6 rounded-2xl space-y-4 border border-brand-500/10">
          <div className="flex items-center gap-2 text-primary">
            <Lightbulb className="h-5 w-5" />
            <h3 className="text-lg font-bold">Como Adequar seu Currículo</h3>
          </div>
          {report.recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Seu currículo já atende às boas práticas.</p>
          ) : (
            <ul className="space-y-2">
              {report.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
