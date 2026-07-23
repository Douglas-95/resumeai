import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UploadResumeUseCase, UploadResumeInput } from './UploadResumeUseCase.js'
import { IResumeRepository } from '../../../domain/repositories/IResumeRepository.js'
import { IAnalysisRepository } from '../../../domain/repositories/IAnalysisRepository.js'
import { IStoragePort } from '../../ports/IStoragePort.js'
import { IQueuePort } from '../../ports/IQueuePort.js'
import { PDFParser } from '../../../infrastructure/parsers/PDFParser.js'
import { DOCXParser } from '../../../infrastructure/parsers/DOCXParser.js'
import { Resume } from '../../../domain/entities/Resume.js'
import { Analysis } from '../../../domain/entities/Analysis.js'

describe('UploadResumeUseCase', () => {
  let resumeRepository: IResumeRepository
  let analysisRepository: IAnalysisRepository
  let storagePort: IStoragePort
  let queuePort: IQueuePort
  let useCase: UploadResumeUseCase
  const bucket = 'test-bucket'

  beforeEach(() => {
    vi.restoreAllMocks()

    resumeRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
    }

    analysisRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
    }

    storagePort = {
      upload: vi.fn().mockResolvedValue('https://storage.mock/test-file.pdf'),
    }

    queuePort = {
      enqueueAnalysisJob: vi.fn().mockResolvedValue('mock-job-id'),
      getJobStatus: vi.fn(),
    }

    useCase = new UploadResumeUseCase(
      resumeRepository,
      analysisRepository,
      storagePort,
      queuePort,
      bucket
    )
  })

  it('should successfully upload a PDF resume, extract text, save entities, and enqueue job', async () => {
    const pdfSpy = vi.spyOn(PDFParser, 'extractText').mockResolvedValue('Extracted PDF Text')
    
    const input: UploadResumeInput = {
      userId: 'user-123',
      fileName: 'resume.pdf',
      fileBuffer: Buffer.from('mock-pdf-buffer'),
      mimeType: 'application/pdf',
      fileType: 'PDF',
    }

    const result = await useCase.execute(input)

    expect(storagePort.upload).toHaveBeenCalledWith({
      bucket: 'test-bucket',
      path: expect.stringContaining('user-123/'),
      buffer: input.fileBuffer,
      mimeType: 'application/pdf',
    })

    expect(pdfSpy).toHaveBeenCalledWith(input.fileBuffer)
    
    expect(resumeRepository.save).toHaveBeenCalledWith(expect.any(Resume))
    expect(analysisRepository.save).toHaveBeenCalledWith(expect.any(Analysis))
    
    expect(queuePort.enqueueAnalysisJob).toHaveBeenCalledWith({
      resumeId: result.resumeId,
      analysisId: result.analysisId,
      userId: 'user-123',
    })

    expect(result).toEqual({
      resumeId: expect.any(String),
      analysisId: expect.any(String),
      jobId: 'mock-job-id',
      status: 'PENDING',
      message: expect.any(String),
    })
  })

  it('should successfully upload a DOCX resume and extract text using DOCXParser', async () => {
    const docxSpy = vi.spyOn(DOCXParser, 'extractText').mockResolvedValue('Extracted DOCX Text')

    const input: UploadResumeInput = {
      userId: 'user-123',
      fileName: 'resume.docx',
      fileBuffer: Buffer.from('mock-docx-buffer'),
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileType: 'DOCX',
    }

    const result = await useCase.execute(input)

    expect(docxSpy).toHaveBeenCalledWith(input.fileBuffer)
    expect(resumeRepository.save).toHaveBeenCalled()
    expect(result.jobId).toBe('mock-job-id')
  })

  it('should fallback to empty string and log warning if text extraction fails, but still succeed upload', async () => {
    vi.spyOn(PDFParser, 'extractText').mockRejectedValue(new Error('Extraction failed'))

    const input: UploadResumeInput = {
      userId: 'user-123',
      fileName: 'resume.pdf',
      fileBuffer: Buffer.from('mock-pdf-buffer'),
      mimeType: 'application/pdf',
      fileType: 'PDF',
    }

    const result = await useCase.execute(input)

    expect(resumeRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        extractedText: '',
      })
    )
    expect(result.jobId).toBe('mock-job-id')
  })
})
