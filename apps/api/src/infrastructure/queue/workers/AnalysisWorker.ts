import { Worker, Job } from 'bullmq'
import { container } from 'tsyringe'
import { AnalyzeResumeUseCase } from '../../application/use-cases/AnalyzeResume/AnalyzeResumeUseCase.js'
import { logger } from '../logger/logger.js'
import { env } from '../config/env.js'

export const ANALYSIS_QUEUE_NAME = 'resume-analysis'

interface AnalysisJobData {
  resumeId: string
  analysisId: string
  userId: string
}

export function startAnalysisWorker() {
  const worker = new Worker<AnalysisJobData>(
    ANALYSIS_QUEUE_NAME,
    async (job: Job<AnalysisJobData>) => {
      logger.info({ jobId: job.id, ...job.data }, 'Starting analysis job')

      const useCase = container.resolve(AnalyzeResumeUseCase)
      await useCase.execute(job.data)

      logger.info({ jobId: job.id }, 'Analysis job completed')
    },
    {
      connection: { url: env.REDIS_URL },
      concurrency: env.WORKER_CONCURRENCY,
      // Retry with exponential backoff — fulfills the resilience requirement
      // If the AI is down, BullMQ retries automatically (configured per-job on enqueue)
    },
  )

  worker.on('failed', (job, err) => {
    logger.error(
      { jobId: job?.id, err, attempts: job?.attemptsMade },
      'Analysis job failed after all retries',
    )
  })

  worker.on('error', (err) => {
    logger.error({ err }, 'Worker error')
  })

  logger.info(
    `🔄 Analysis worker started (concurrency: ${env.WORKER_CONCURRENCY})`,
  )

  return worker
}
