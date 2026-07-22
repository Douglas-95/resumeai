'use client'

import { motion } from 'framer-motion'
import { ResumeDropzone } from '@/components/features/upload/ResumeDropzone'

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">
          Analisar <span className="gradient-text">Currículo</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Faça upload do seu currículo em PDF ou DOCX. A análise é iniciada automaticamente.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ResumeDropzone />
      </motion.div>
    </div>
  )
}
