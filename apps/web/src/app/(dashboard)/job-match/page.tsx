'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Upload, Loader2, FileText, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { JobMatcher } from '@/components/features/analysis/JobMatcher'

interface ResumeItem {
  id: string
  fileName: string
  fileType: string
  status: string
  analysisId: string | null
}

export default function JobMatchPage() {
  const [resumes, setResumes] = useState<ResumeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedResumeId, setSelectedResumeId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadResumes() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await axios.get(`${apiUrl}/api/v1/resumes`)
        if (response.data.success) {
          const list = response.data.data as ResumeItem[]
          setResumes(list)
          if (list.length > 0) {
            // Select first resume by default
            setSelectedResumeId(list[0].id)
          }
        }
      } catch (err) {
        console.error(err)
        setError('Não foi possível carregar a lista de currículos.')
      } finally {
        setIsLoading(false)
      }
    }

    loadResumes()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando seus currículos...</p>
      </div>
    )
  }

  const selectedResume = resumes.find((r) => r.id === selectedResumeId)
  const activeAnalysisId = selectedResume?.analysisId

  return (
    <div className="space-y-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Match de Vagas</h1>
        <p className="mt-2 text-muted-foreground">
          Compare seu currículo analisado com qualquer vaga e receba dicas de otimização instantaneamente.
        </p>
      </motion.div>

      {resumes.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-12 text-center max-w-xl mx-auto space-y-6 mt-8"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Nenhum currículo encontrado</h2>
            <p className="text-sm text-muted-foreground">
              Você precisa fazer o upload e concluir a análise de ao menos um currículo antes de realizar o matching com vagas.
            </p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
          >
            Fazer Upload de Currículo
          </Link>
        </motion.div>
      ) : (
        /* Main Selection and Matching UI */
        <div className="space-y-6">
          {/* Selector Card */}
          <div className="glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <label htmlFor="resume-select" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Selecione o Currículo para o Match
                </label>
                <span className="text-xs text-muted-foreground mt-0.5 block">
                  Escolha qual dos seus arquivos deseja comparar com a vaga.
                </span>
              </div>
            </div>

            <div className="w-full sm:w-72">
              <select
                id="resume-select"
                className="w-full rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fileName} ({r.fileType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Render JobMatcher once selected and ready */}
          <div className="glass p-6 rounded-2xl">
            {activeAnalysisId ? (
              <JobMatcher key={activeAnalysisId} analysisId={activeAnalysisId} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Aguardando a conclusão da análise do currículo...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
