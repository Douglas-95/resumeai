'use client'

import { motion } from 'framer-motion'
import { FileText, TrendingUp, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const stats = [
  { label: 'Currículos Analisados', value: '0', icon: FileText, color: 'text-brand-400' },
  { label: 'Score Médio', value: '—', icon: TrendingUp, color: 'text-emerald-400' },
  { label: 'Análises Este Mês', value: '0', icon: Zap, color: 'text-amber-400' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo ao{' '}
          <span className="gradient-text">ResumeAI</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Analise seu currículo com IA e se destaque no mercado.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-xl p-5 transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg bg-card p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* CTA — Upload */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass rounded-2xl p-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Faça sua primeira análise</h2>
        <p className="mb-6 text-muted-foreground">
          Envie seu currículo em PDF ou DOCX e receba um relatório completo em instantes.
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
        >
          Analisar Currículo
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </div>
  )
}
