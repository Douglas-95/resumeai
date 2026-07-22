'use client'

import { STARRewrite as STARRewriteType } from '@resumeai/shared-types'
import { Sparkles, ArrowRight, BookOpen, Target, Shield, CheckCircle } from 'lucide-react'

interface STARRewriteProps {
  rewrites: STARRewriteType[]
}

export function STARRewrite({ rewrites }: STARRewriteProps) {
  if (!rewrites || rewrites.length === 0) {
    return (
      <div className="glass p-8 text-center rounded-2xl">
        <p className="text-muted-foreground text-sm">Nenhuma experiência reescrita no formato STAR.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Melhoria com Método STAR
        </h3>
        <p className="text-sm text-muted-foreground">
          Descrições de experiência reescritas focando em Situação, Tarefa, Ação e Resultado.
        </p>
      </div>

      <div className="space-y-6">
        {rewrites.map((rewrite, idx) => (
          <div key={idx} className="glass p-6 rounded-2xl space-y-4">
            {/* Before */}
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                Antes (Original)
              </span>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                "{rewrite.original}"
              </p>
            </div>

            <div className="flex justify-center text-muted-foreground/30">
              <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
            </div>

            {/* After (STAR columns/blocks) */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Depois (Método STAR)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    Situação (Contexto)
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                    {rewrite.situation}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    Tarefa (Desafio)
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                    {rewrite.task}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    Ação (Iniciativa)
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                    {rewrite.action}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    Resultado (Métrica)
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-5 font-medium">
                    {rewrite.result}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
