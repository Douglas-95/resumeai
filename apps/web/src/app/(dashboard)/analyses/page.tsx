'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Calendar, Eye, Trash2, Loader2, AlertTriangle, Inbox, Sparkles } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

interface ResumeItem {
  id: string
  fileName: string
  fileType: string
  status: string
  createdAt: string
  analysisId: string | null
}

export default function AnalysesHistoryPage() {
  const [resumes, setResumes] = useState<ResumeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadResumes = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await axios.get(`${apiUrl}/api/v1/resumes`)
      if (response.data.success) {
        setResumes(response.data.data)
      }
    } catch (err) {
      console.error(err)
      setError('Não foi possível carregar o histórico de análises.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadResumes()
  }, [])

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      await axios.delete(`${apiUrl}/api/v1/resumes/${id}`)
      setResumes((prev) => prev.filter((r) => r.id !== id))
      setDeleteId(null)
    } catch (err) {
      console.error(err)
      alert('Erro ao excluir a análise. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando histórico de análises...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suas Análises</h1>
          <p className="mt-2 text-muted-foreground">
            Acesse o histórico de todos os currículos enviados e as respectivas pontuações.
          </p>
        </div>

        <Link
          href="/upload"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4" />
          <span>Nova Análise</span>
        </Link>
      </motion.div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resumes.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-16 text-center max-w-lg mx-auto space-y-6 mt-12"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Inbox className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Histórico Vazio</h2>
            <p className="text-sm text-muted-foreground">
              Você ainda não enviou nenhum currículo para avaliação. Seus arquivos analisados aparecerão listados aqui.
            </p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
          >
            Analisar Primeiro Currículo
          </Link>
        </motion.div>
      ) : (
        /* Card Grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {resumes.map((resume, i) => {
              const statusColors: Record<string, string> = {
                DONE: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                PARTIAL_ERROR: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                PENDING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                PROCESSING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                ERROR: 'bg-destructive/10 text-destructive border-destructive/20',
              }

              const statusLabels: Record<string, string> = {
                DONE: 'Concluído',
                PARTIAL_ERROR: 'Concluído com Alertas',
                PENDING: 'Aguardando Fila',
                PROCESSING: 'Analisando...',
                ERROR: 'Falhou',
              }

              const isFinished = resume.status === 'DONE' || resume.status === 'PARTIAL_ERROR'

              return (
                <motion.div
                  key={resume.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="glass p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-border transition-all duration-200"
                >
                  <div className="space-y-3">
                    {/* Header: Icon & Type */}
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border/50 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors[resume.status] || ''}`}>
                        {statusLabels[resume.status] || resume.status}
                      </span>
                    </div>

                    {/* File Name */}
                    <div>
                      <h3 className="font-bold text-sm text-foreground line-clamp-1" title={resume.fileName}>
                        {resume.fileName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-2xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(resume.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="flex items-center justify-between border-t border-border/30 pt-3.5 mt-2">
                    {isFinished && resume.analysisId ? (
                      <Link
                        href={`/analysis/${resume.analysisId}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Ver Relatório</span>
                      </Link>
                    ) : (
                      <span className="text-2xs text-muted-foreground italic">
                        {resume.status === 'ERROR' ? 'Processamento indisponível' : 'Aguarde finalizar...'}
                      </span>
                    )}

                    <button
                      onClick={() => setDeleteId(resume.id)}
                      className="rounded-lg p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Excluir currículo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeleteId(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            {/* Card Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass relative max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="text-base font-bold">Excluir Currículo?</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Esta ação é irreversível. O currículo, o relatório de análise e todos os resultados de compatibilidade de vagas serão excluídos permanentemente.
              </p>
              <div className="flex gap-2 justify-end border-t border-border/30 pt-4">
                <button
                  disabled={isDeleting}
                  onClick={() => setDeleteId(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  disabled={isDeleting}
                  onClick={() => handleDelete(deleteId)}
                  className="rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Excluindo...</span>
                    </>
                  ) : (
                    <span>Excluir</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
