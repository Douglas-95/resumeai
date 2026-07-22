import { IQueuePort } from '../../application/ports/IQueuePort.js'
import { logger } from '../logger/logger.js'

export class InMemoryQueueAdapter implements IQueuePort {
  async enqueueAnalysisJob(payload: {
    resumeId: string
    analysisId: string
    userId: string
  }): Promise<string> {
    logger.info(payload, 'InMemoryQueueAdapter: Enfileirando análise em background local síncrona...')

    // Lazy resolve and execute on next event loop tick to simulate async queuing
    setTimeout(() => {
      import('tsyringe').then(({ container }) => {
        import('../../application/use-cases/AnalyzeResume/AnalyzeResumeUseCase.js').then(({ AnalyzeResumeUseCase }) => {
          const useCase = container.resolve(AnalyzeResumeUseCase)
          useCase.execute(payload).catch((e) => {
            logger.error({ err: e }, 'InMemoryQueueAdapter: Erro ao executar análise em background')
          })
        })
      })
    }, 50)

    return `in-memory-job-${payload.analysisId}`
  }

  async getJobStatus(jobId: string): Promise<{
    state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed'
    progress: number
    failReason?: string
  } | null> {
    return {
      state: 'completed',
      progress: 100,
    }
  }
}
