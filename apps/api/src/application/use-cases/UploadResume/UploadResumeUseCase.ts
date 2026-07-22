import { injectable, inject } from 'tsyringe'
import { Resume } from '../../domain/entities/Resume.js'
import { Analysis } from '../../domain/entities/Analysis.js'
import { IResumeRepository } from '../../domain/repositories/IResumeRepository.js'
import { IAnalysisRepository } from '../../domain/repositories/IAnalysisRepository.js'
import { IStoragePort } from '../ports/IStoragePort.js'
import { IQueuePort } from '../ports/IQueuePort.js'
import { FileType } from '@resumeai/shared-types'

export interface UploadResumeInput {
  userId: string
  fileName: string
  fileBuffer: Buffer
  mimeType: string
  fileType: FileType
}

export interface UploadResumeOutput {
  resumeId: string
  analysisId: string
  jobId: string
  status: 'PENDING'
  message: string
}

@injectable()
export class UploadResumeUseCase {
  constructor(
    @inject('IResumeRepository') private readonly resumeRepository: IResumeRepository,
    @inject('IAnalysisRepository') private readonly analysisRepository: IAnalysisRepository,
    @inject('IStoragePort') private readonly storage: IStoragePort,
    @inject('IQueuePort') private readonly queue: IQueuePort,
    @inject('StorageBucket') private readonly bucket: string,
  ) {}

  /**
   * Upload ALWAYS succeeds independently of AI availability.
   * The file is stored, resume and analysis records created,
   * and the analysis job is enqueued for async processing.
   */
  async execute(input: UploadResumeInput): Promise<UploadResumeOutput> {
    // 1. Upload file to storage — this must never fail silently
    const storagePath = `${input.userId}/${Date.now()}-${input.fileName}`
    const fileUrl = await this.storage.upload({
      bucket: this.bucket,
      path: storagePath,
      buffer: input.fileBuffer,
      mimeType: input.mimeType,
    })

    // 2. Create Resume entity
    const resume = Resume.create({
      userId: input.userId,
      fileName: input.fileName,
      fileUrl,
      fileType: input.fileType,
      status: 'PENDING',
    })
    await this.resumeRepository.save(resume)

    // 3. Create Analysis entity (empty, will be populated by the worker)
    const analysis = Analysis.create({
      resumeId: resume.id,
      userId: input.userId,
      status: 'PENDING',
    })
    await this.analysisRepository.save(analysis)

    // 4. Enqueue async analysis job — decoupled from upload response
    const jobId = await this.queue.enqueueAnalysisJob({
      resumeId: resume.id,
      analysisId: analysis.id,
      userId: input.userId,
    })

    // 5. Return immediately — client polls or subscribes for results
    return {
      resumeId: resume.id,
      analysisId: analysis.id,
      jobId,
      status: 'PENDING',
      message: 'Currículo recebido com sucesso. A análise foi iniciada.',
    }
  }
}
