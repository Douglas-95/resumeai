'use client'

import { Improvements } from '@resumeai/shared-types'
import { Sparkles, Copy, Check, Info } from 'lucide-react'
import { useState } from 'react'

interface ImprovementsViewProps {
  improvements: Improvements
}

export function ImprovementsView({ improvements }: ImprovementsViewProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copyToClipboard = (text: string | null, key: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const sections = [
    { key: 'professionalTitle', title: 'Título Sugerido', content: improvements.professionalTitle, desc: 'Título profissional otimizado para busca e SEO de recrutadores.' },
    { key: 'professionalSummary', title: 'Resumo Profissional', content: improvements.professionalSummary, desc: 'Resumo executivo de impacto para a introdução do seu currículo.' },
    { key: 'linkedinHeadline', title: 'Headline LinkedIn', content: improvements.linkedinHeadline, desc: 'Sua descrição de perfil para aumentar a atração passiva no LinkedIn.' },
    { key: 'gupySummary', title: 'Perfil Gupy', content: improvements.gupySummary, desc: 'Otimização com foco em competências exatas para passar pela IA da Gupy.' },
    { key: 'indeedSummary', title: 'Perfil Indeed', content: improvements.indeedSummary, desc: 'Resumo compacto formatado para a plataforma Indeed.' },
    { key: 'cathoSummary', title: 'Perfil Catho', content: improvements.cathoSummary, desc: 'Resumo focado para a triagem da plataforma Catho.' },
    { key: 'internationalSummary', title: 'Perfil Vagas Internacionais', content: improvements.internationalSummary, desc: 'Resumo estruturado em inglês para vagas de fora do país.' },
  ]

  const versions = [
    { key: 'atsFriendlyVersion', title: 'Versão ATS Friendly', content: improvements.atsFriendlyVersion, desc: 'Layout limpo de coluna única sem adornos visuais.' },
    { key: 'modernVersion', title: 'Versão Moderna', content: improvements.modernVersion, desc: 'Layout visual focado em legibilidade e design contemporâneo.' },
    { key: 'executiveVersion', title: 'Versão Executiva', content: improvements.executiveVersion, desc: 'Tom formal e estrutura clean focada em seniores e liderança.' },
    { key: 'internationalVersion', title: 'Versão Internacional', content: improvements.internationalVersion, desc: 'Currículo traduzido e estruturado para o padrão de contratação estrangeira.' },
  ]

  return (
    <div className="space-y-8">
      {/* Platform Suggestions */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Melhorias Automáticas de Perfil
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((sec) => {
            if (!sec.content) return null
            const isCopied = copiedKey === sec.key
            return (
              <div key={sec.key} className="glass p-5 rounded-2xl flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-foreground">{sec.title}</h4>
                    <button
                      onClick={() => copyToClipboard(sec.content, sec.key)}
                      id={`copy-btn-${sec.key}`}
                      className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Copiar texto"
                    >
                      {isCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-2xs text-muted-foreground leading-normal">{sec.desc}</p>
                </div>
                <div className="bg-card/50 border border-border/30 rounded-xl p-3.5 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {sec.content}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Suggested Layout Formats */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Sugestão de Estrutura por Estilo de Vaga
        </h3>
        <div className="grid grid-cols-1 gap-6">
          {versions.map((ver) => {
            if (!ver.content) return null
            const isCopied = copiedKey === ver.key
            return (
              <div key={ver.key} className="glass p-6 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{ver.title}</h4>
                    <p className="text-2xs text-muted-foreground mt-0.5">{ver.desc}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(ver.content, ver.key)}
                    id={`copy-btn-${ver.key}`}
                    className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Copiar texto"
                  >
                    {isCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="bg-card/50 border border-border/30 rounded-xl p-4 font-mono text-2xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {ver.content}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
