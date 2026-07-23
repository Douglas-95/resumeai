'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Copy, Check, Printer, FileText } from 'lucide-react'

interface VersionExporterModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  description: string
}

export function VersionExporterModal({ isOpen, onClose, title, content, description }: VersionExporterModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/85 backdrop-blur-md"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="glass relative flex h-[85vh] w-full max-w-5xl flex-col rounded-2xl shadow-2xl overflow-hidden border border-border/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base leading-none">{title}</h3>
              <p className="text-2xs text-muted-foreground mt-1.5">{description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Inner Content Grid */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* Main Visualizer Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-card/10">
            {/* The Print Sheet - Styled professionally */}
            <div
              id="print-section"
              className="mx-auto max-w-[800px] rounded-xl border border-border/30 bg-background p-8 font-serif text-sm text-foreground shadow-sm leading-relaxed whitespace-pre-wrap select-text print:border-0 print:p-0 print:shadow-none"
            >
              {content}
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-border/40 bg-muted/20 p-5 flex flex-col gap-3 justify-center md:justify-start">
            <h4 className="text-2xs font-extrabold uppercase tracking-wider text-muted-foreground mb-1 hidden md:block">
              Ações de Exportação
            </h4>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-card border border-border/50 px-4 py-3 text-xs font-semibold hover:border-border hover:bg-muted text-foreground transition-all duration-200 active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Copiado com Sucesso</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copiar Texto</span>
                </>
              )}
            </button>

            {/* Print/PDF Button */}
            <button
              onClick={handlePrint}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all duration-200 active:scale-[0.98]"
            >
              <Printer className="h-4 w-4" />
              <span>Salvar como PDF</span>
            </button>

            <div className="mt-4 rounded-xl border border-border/30 bg-card/40 p-3.5 text-3xs text-muted-foreground leading-normal hidden md:block">
              <span className="font-bold text-foreground block mb-1">Dica de Impressão</span>
              Ao abrir a janela de impressão, marque a opção &quot;Simplificado&quot; e remova os cabeçalhos/rodapés do navegador para obter o PDF profissional perfeito.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
