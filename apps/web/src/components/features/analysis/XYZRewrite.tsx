'use client'

import { XYZRewrite as XYZRewriteType } from '@resumeai/shared-types'
import { Sparkles, HelpCircle, ArrowRight } from 'lucide-react'

interface XYZRewriteProps {
  rewrites: XYZRewriteType[]
}

export function XYZRewrite({ rewrites }: XYZRewriteProps) {
  if (!rewrites || rewrites.length === 0) {
    return (
      <div className="glass p-8 text-center rounded-2xl">
        <p className="text-muted-foreground text-sm">Nenhuma frase reescrita no formato XYZ do Google.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Fórmula Google XYZ
        </h3>
        <p className="text-sm text-muted-foreground">
          Transforme tarefas simples no formato de alto impacto: <strong>"Conquistei X, medido por Y, fazendo Z"</strong>.
        </p>
      </div>

      <div className="space-y-4">
        {rewrites.map((rewrite, idx) => (
          <div key={idx} className="glass p-5 rounded-xl space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Before / After */}
              <div className="flex-1 space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>Antes:</span>
                  <span className="line-through">"{rewrite.original}"</span>
                </div>
                <div className="text-sm font-semibold text-foreground flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-emerald-500">"{rewrite.rewritten}"</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2">
                {rewrite.hasRealMetrics ? (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-2xs font-semibold text-emerald-500">
                    Métrica Real
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-2xs font-semibold text-amber-500">
                    Métrica Sugerida
                  </span>
                )}
              </div>
            </div>

            {/* Explanatory notes for mock metrics */}
            {rewrite.note && (
              <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground border border-border/30">
                <HelpCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">{rewrite.note}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
