'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type UploadState = 'idle' | 'uploading' | 'success' | 'error'

export function ResumeDropzone() {
  const router = useRouter()
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setSelectedFile(file)
      setUploadState('uploading')
      setProgress(0)
      setErrorMessage(null)

      try {
        const formData = new FormData()
        formData.append('file', file)

        // Simulated progress — real progress via XHR onUploadProgress
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 15, 85))
        }, 200)

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/resumes/upload`,
          {
            method: 'POST',
            body: formData,
          },
        )

        clearInterval(progressInterval)
        setProgress(100)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error?.message ?? 'Erro ao fazer upload')
        }

        const { data } = await response.json()
        setUploadState('success')

        // Redirect to analysis page after short delay
        setTimeout(() => {
          router.push(`/analysis/${data.analysisId}`)
        }, 1500)
      } catch (err) {
        setUploadState('error')
        setErrorMessage(err instanceof Error ? err.message : 'Erro inesperado')
        setProgress(0)
      }
    },
    [router],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: uploadState === 'uploading',
  })

  const resetUpload = () => {
    setUploadState('idle')
    setSelectedFile(null)
    setProgress(0)
    setErrorMessage(null)
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        id="resume-dropzone"
        className={cn(
          'relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isDragActive && !isDragReject && 'border-primary bg-primary/5 scale-[1.01]',
          isDragReject && 'border-destructive bg-destructive/5',
          uploadState === 'idle' && !isDragActive && 'border-border hover:border-primary/50 hover:bg-muted/50',
          uploadState === 'uploading' && 'cursor-not-allowed opacity-80 border-primary/30',
          uploadState === 'success' && 'border-score-excellent bg-score-excellent/5',
          uploadState === 'error' && 'border-destructive bg-destructive/5',
        )}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {uploadState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Upload className={cn('h-8 w-8 transition-all', isDragActive ? 'text-primary scale-110' : 'text-muted-foreground')} />
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {isDragActive ? 'Solte aqui!' : 'Arraste seu currículo'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  ou{' '}
                  <span className="font-medium text-primary underline-offset-4 hover:underline">
                    clique para selecionar
                  </span>
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  PDF ou DOCX • Máximo 10MB
                </p>
              </div>
            </motion.div>
          )}

          {uploadState === 'uploading' && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <div>
                <p className="font-semibold">Enviando currículo...</p>
                <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
              </div>
              {/* Progress bar */}
              <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {uploadState === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-3"
            >
              <CheckCircle className="mx-auto h-12 w-12 text-score-excellent" />
              <div>
                <p className="font-semibold text-score-excellent">Upload concluído!</p>
                <p className="text-sm text-muted-foreground">Redirecionando para a análise...</p>
              </div>
            </motion.div>
          )}

          {uploadState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-3"
            >
              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Erro no upload</p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* File info + reset */}
      <AnimatePresence>
        {selectedFile && uploadState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/50 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {uploadState !== 'uploading' && (
              <button
                onClick={resetUpload}
                id="reset-upload-btn"
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
