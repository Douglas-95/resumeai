import { Queue } from 'bullmq'
import { IQueuePort } from '../../application/ports/IQueuePort.js'
import { ANALYSIS_QUEUE_NAME } from './workers/AnalysisWorker.js'
import { env } from '../config/env.js'
import { logger } from '../logger/logger.js'

export class BullMQAdapter implements IQueuePort {
  private queue: Queue

  constructor() {
    this.queue = new Queue(ANALYSIS_QUEUE_NAME, {
      connection: {
        url: env.REDIS_URL,
        maxRetriesPerRequest: 0, // Fail fast when Redis is offline instead of blocking the promise
        enableOfflineQueue: false, // Do not buffer commands when offline
      },
      defaultJobOptions: {
        attempts: env.AI_JOB_RETRY_ATTEMPTS,
        backoff: {
          type: 'exponential',
          delay: env.AI_JOB_RETRY_DELAY_MS,
        },
        removeOnComplete: { age: 3600 * 24 }, // keep completed jobs for 24h
        removeOnFail: { age: 3600 * 24 * 7 }, // keep failed jobs for 7 days
      },
    })
  }

  async enqueueAnalysisJob(payload: {
    resumeId: string
    analysisId: string
    userId: string
  }): Promise<string> {
    try {
      const job = await this.queue.add('analyze-resume', payload)
      logger.info({ jobId: job.id, payload }, 'Job de análise enfileirado no BullMQ')
      return job.id ?? payload.analysisId
    } catch (err) {
      logger.error({ err, payload }, 'Erro ao enfileirar job no BullMQ')
      if (env.NODE_ENV === 'development') {
        logger.warn('Redis/BullMQ indisponível. Executando análise em background local síncrona de fallback...')
        
        // Lazy resolve to avoid circular dependencies
        import('tsyringe').then(({ container }) => {
          import('../../../application/use-cases/AnalyzeResume/AnalyzeResumeUseCase.js').then(({ AnalyzeResumeUseCase }) => {
            const useCase = container.resolve(AnalyzeResumeUseCase)
            useCase.execute(payload).catch((e) => {
              logger.error({ err: e }, 'Erro na execução da análise local de fallback')
            })
          })
        })

        return `mock-job-${payload.analysisId}`
      }
      throw err
    }
  }

  async getJobStatus(jobId: string): Promise<{
    state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed'
    progress: number
    failReason?: string
  } | null> {
    try {
      const job = await this.queue.getJob(jobId)
      if (!job) return null

      const state = await job.getState()
      const progress = typeof job.progress === 'number' ? job.progress : 0

      return {
        state: state as 'waiting' | 'active' | 'completed' | 'failed' | 'delayed',
        progress,
        failReason: job.failedReason,
      }
    } catch (err) {
      logger.error({ err, jobId }, 'Erro ao obter status do job no BullMQ')
      return null
    }
  }
}
