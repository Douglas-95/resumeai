'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, AlertTriangle, Target, CheckCircle2, Sparkles, Loader2 } from 'lucide-react'
import { CircularScore } from '@/components/features/scores/CircularScore'
import axios from 'axios'

interface JobMatcherProps {
  analysisId: string
}

interface Suggestion {
  section: string
  suggestion: string
  reason: string
}

interface MatchResult {
  matchScore: number
  missingKeywords: string[]
  missingCompetencies: string[]
  suggestions: Suggestion[]
}

export function JobMatcher({ analysisId }: JobMatcherProps) {
  const [jobDescription, setJobDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<MatchResult | null>(null)

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobDescription.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await axios.post(`${apiUrl}/api/v1/analyses/${analysisId}/job-match`, {
        jobDescription,
      })

      if (response.data.success) {
        setResult(response.data.data)
      } else {
        setError('Ocorreu um erro ao processar o matching da vaga.')
      }
    } catch (err: any) {
      console.error(err)
      setError(
        err.response?.data?.error?.message || 
        'Erro ao conectar com o servidor de inteligência artificial.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Compatibilidade com Vagas</h2>
        <p className="text-sm text-muted-foreground">
          Cole a descrição da vaga desejada abaixo e veja a compatibilidade do seu currículo com as exigências do recrutador.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Form Input Column */}
        <div className="md:col-span-7 space-y-4">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="job-desc" className="text-sm font-semibold text-muted-foreground">
                Descrição da Vaga
              </label>
              <textarea
                id="job-desc"
                placeholder="Cole aqui o texto completo dos requisitos e descrição da vaga de emprego..."
                className="h-60 w-full rounded-xl border border-border/50 bg-muted/30 p-4 text-sm text-foreground placeholder-muted-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !jobDescription.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analisando Compatibilidade...</span>
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  <span>Analisar Compatibilidade</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
            >
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </div>

        {/* Results Column */}
        <div className="md:col-span-5 flex flex-col justify-start">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-border/50 bg-card p-6 text-center"
              >
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute h-12 w-12 animate-ping rounded-full bg-primary/20" />
                  <Sparkles className="h-8 w-8 animate-pulse text-primary" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">Cruzando dados de recrutamento</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-[280px]">
                  O Gemini está lendo os requisitos da vaga e comparando com as competências do seu currículo...
                </p>
              </motion.div>
            )}

            {!isLoading && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 p-6 text-center"
              >
                <Briefcase className="h-10 w-10 text-muted-foreground/60" />
                <h3 className="mt-4 text-sm font-bold text-foreground">Nenhum Match Executado</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
                  Insira os dados da vaga ao lado para avaliar a aderência do seu currículo.
                </p>
              </motion.div>
            )}

            {!isLoading && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Match Score Card */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                  <CircularScore score={result.matchScore} size={130} strokeWidth={12} />
                  <h3 className="mt-4 text-base font-bold text-foreground">Score de Aderência</h3>
                  <p className="mt-1 text-center text-xs text-muted-foreground max-w-[280px]">
                    {result.matchScore >= 80
                      ? 'Excelente compatibilidade! Seu currículo possui forte sinergia com os requisitos.'
                      : result.matchScore >= 60
                        ? 'Boa compatibilidade. Algumas alterações pontuais aumentarão suas chances.'
                        : 'Compatibilidade baixa. Recomendamos reescrever seções usando as sugestões abaixo.'}
                  </p>
                </div>

                {/* Missing Keywords & Competencies */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Termos Faltantes</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingKeywords.length > 0 ? (
                        result.missingKeywords.map((kw, i) => (
                          <span key={i} className="rounded-lg bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                            {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Nenhuma keyword faltante
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Foco de Melhoria</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingCompetencies.length > 0 ? (
                        result.missingCompetencies.map((skill, i) => (
                          <span key={i} className="rounded-lg bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Competências em dia
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Rationale & Suggestions Accordion Grid */}
      <AnimatePresence>
        {!isLoading && result && result.suggestions && result.suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="border-t border-border/50 pt-4">
              <h3 className="text-sm font-bold text-foreground">Alterações Sugeridas no Currículo</h3>
              <p className="text-xs text-muted-foreground">
                Incorpore estas sugestões de palavras e reescritas para otimizar a leitura do ATS e do recrutador.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {result.suggestions.map((sug, i) => (
                <div key={i} className="flex flex-col justify-between rounded-xl border border-border/50 bg-card p-4 hover:border-border transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                        {sug.section}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      &quot;{sug.suggestion}&quot;
                    </p>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground border-t border-border/30 pt-2">
                    <span className="font-semibold text-foreground/80">Por que alterar:</span> {sug.reason}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
