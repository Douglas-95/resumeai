import { injectable, inject } from 'tsyringe'
import { Resume } from '../../../domain/entities/Resume.js'
import { Analysis } from '../../../domain/entities/Analysis.js'
import { IResumeRepository } from '../../../domain/repositories/IResumeRepository.js'
import { IAnalysisRepository } from '../../../domain/repositories/IAnalysisRepository.js'
import { IStoragePort } from '../../ports/IStoragePort.js'
import { IQueuePort } from '../../ports/IQueuePort.js'
import { FileType } from '@resumeai/shared-types'
import { PDFParser } from '../../../infrastructure/parsers/PDFParser.js'
import { DOCXParser } from '../../../infrastructure/parsers/DOCXParser.js'
import { logger } from '../../../infrastructure/logger/logger.js'

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
   * Text extraction runs locally without LLM dependencies.
   */
  async execute(input: UploadResumeInput): Promise<UploadResumeOutput> {
    // 1. Upload file to storage
    const storagePath = `${input.userId}/${Date.now()}-${input.fileName}`
    const fileUrl = await this.storage.upload({
      bucket: this.bucket,
      path: storagePath,
      buffer: input.fileBuffer,
      mimeType: input.mimeType,
    })

    // 2. Extract plain text locally (no LLM dependency, fast)
    let extractedText = ''
    try {
      if (input.fileType === 'PDF') {
        extractedText = await PDFParser.extractText(input.fileBuffer)
      } else if (input.fileType === 'DOCX') {
        extractedText = await DOCXParser.extractText(input.fileBuffer)
      }
    } catch (err) {
      logger.warn({ err }, 'Aviso: Falha na extração direta de texto. O worker tentará ler durante o processamento.')
    }

    // 3. Create Resume entity
    const resume = Resume.create({
      userId: input.userId,
      fileName: input.fileName,
      fileUrl,
      fileType: input.fileType,
      extractedText,
      status: 'PENDING',
    })
    await this.resumeRepository.save(resume)

    // 4. Create Analysis entity
    const analysis = Analysis.create({
      resumeId: resume.id,
      userId: input.userId,
      status: 'PENDING',
    })
    await this.analysisRepository.save(analysis)

    // 5. Enqueue async analysis job
    const jobId = await this.queue.enqueueAnalysisJob({
      resumeId: resume.id,
      analysisId: analysis.id,
      userId: input.userId,
    })

    return {
      resumeId: resume.id,
      analysisId: analysis.id,
      jobId,
      status: 'PENDING',
      message: 'Currículo recebido com sucesso. Extração concluída e análise iniciada.',
    }
  }
}
