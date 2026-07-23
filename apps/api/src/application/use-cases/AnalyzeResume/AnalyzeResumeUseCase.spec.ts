import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AnalyzeResumeUseCase, AnalyzeResumeInput } from './AnalyzeResumeUseCase.js'
import { IResumeRepository } from '../../../domain/repositories/IResumeRepository.js'
import { IAnalysisRepository } from '../../../domain/repositories/IAnalysisRepository.js'
import { IAIPort } from '../../ports/IAIPort.js'
import { Resume } from '../../../domain/entities/Resume.js'
import { Analysis } from '../../../domain/entities/Analysis.js'

describe('AnalyzeResumeUseCase', () => {
  let resumeRepository: IResumeRepository
  let analysisRepository: IAnalysisRepository
  let aiPort: IAIPort
  let useCase: AnalyzeResumeUseCase

  const mockParsedData = {
    name: 'Douglas Silva',
    currentRole: 'Engenheiro de Software',
    email: 'douglas@test.com',
    phone: '11999999999',
    location: 'São Paulo',
    linkedin: '',
    github: '',
    portfolio: '',
    summary: 'Resumo profissional',
    experiences: [],
    education: [],
    certifications: [],
    hardSkills: ['React', 'Node.js'],
    softSkills: [],
    languages: [],
  }

  const mockScores = {
    overall: { value: 80, justification: 'Nota geral' },
    ats: { value: 85, justification: 'Leitura ATS' },
    recruiter: { value: 75, justification: 'Recrutador' },
    textual: { value: 90, justification: 'Justification' },
    clarity: { value: 90, justification: 'Justification' },
    formatting: { value: 80, justification: 'Justification' },
    keyword: { value: 85, justification: 'Justification' },
    professionalism: { value: 90, justification: 'Justification' },
    leadership: { value: 60, justification: 'Justification' },
    technical: { value: 80, justification: 'Justification' },
    impact: { value: 70, justification: 'Justification' },
  }

  const mockInsights = [
    {
      type: 'STRENGTH' as const,
      problem: 'Competências fortes',
      explanation: '...',
      impact: '...',
      howToFix: '...',
      improvementExample: '',
    },
  ]

  const mockATSAnalysis = {
    score: 85,
    isReadable: true,
    keywordCount: 10,
    sectionOrder: 'Chronological',
    hasTables: false,
    hasImages: false,
    hasColumns: false,
    isPDFCompatible: true,
    issues: [],
    recommendations: [],
  }

  const mockStarRewrites = [
    {
      original: 'Original text',
      situation: 'S',
      task: 'T',
      action: 'A',
      result: 'R',
    },
  ]

  const mockXyzRewrites = [
    {
      original: 'Original text',
      rewritten: 'X by Y doing Z',
      hasRealMetrics: true,
      note: 'Note',
    },
  ]

  const mockImprovements = {
    professionalTitle: 'Engenheiro Sênior',
    professionalSummary: 'Novo resumo',
    linkedinHeadline: 'Headline',
    gupySummary: 'Gupy',
    indeedSummary: 'Indeed',
    cathoSummary: 'Catho',
    internationalSummary: 'Intl',
    atsFriendlyVersion: 'ATS',
    modernVersion: 'Modern',
    executiveVersion: 'Exec',
    internationalVersion: 'Intl layout',
  }

  beforeEach(() => {
    resumeRepository = {
      save: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
    }

    analysisRepository = {
      save: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
    }

    aiPort = {
      extractResumeData: vi.fn().mockResolvedValue(mockParsedData),
      generateScores: vi.fn().mockResolvedValue(mockScores),
      generateInsights: vi.fn().mockResolvedValue(mockInsights),
      analyzeATS: vi.fn().mockResolvedValue(mockATSAnalysis),
      generateSTARRewrites: vi.fn().mockResolvedValue(mockStarRewrites),
      generateXYZRewrites: vi.fn().mockResolvedValue(mockXyzRewrites),
      generateImprovements: vi.fn().mockResolvedValue(mockImprovements),
      matchJobDescription: vi.fn(),
    }

    useCase = new AnalyzeResumeUseCase(resumeRepository, analysisRepository, aiPort)
  })

  it('should run the entire AI pipeline successfully and save results in the database', async () => {
    const resume = Resume.create({
      userId: 'user-123',
      fileName: 'resume.pdf',
      fileUrl: 'https://mock.url',
      fileType: 'PDF',
      extractedText: 'Raw PDF content text',
      status: 'PENDING',
    })

    const analysis = Analysis.create({
      resumeId: resume.id,
      userId: 'user-123',
      status: 'PENDING',
    })

    vi.spyOn(resumeRepository, 'findById').mockResolvedValue(resume)
    vi.spyOn(analysisRepository, 'findById').mockResolvedValue(analysis)

    const input: AnalyzeResumeInput = {
      resumeId: resume.id,
      analysisId: analysis.id,
      userId: 'user-123',
    }

    await useCase.execute(input)

    // Verify initial update to PROCESSING
    expect(resumeRepository.update).toHaveBeenCalled()
    expect(analysisRepository.update).toHaveBeenCalled()

    // Verify AI calls
    expect(aiPort.extractResumeData).toHaveBeenCalledWith('Raw PDF content text')
    expect(aiPort.generateScores).toHaveBeenCalledWith('Raw PDF content text', mockParsedData)
    expect(aiPort.generateInsights).toHaveBeenCalledWith('Raw PDF content text', mockParsedData)
    expect(aiPort.analyzeATS).toHaveBeenCalledWith('Raw PDF content text')
    expect(aiPort.generateSTARRewrites).toHaveBeenCalledWith('Raw PDF content text', mockParsedData)
    expect(aiPort.generateXYZRewrites).toHaveBeenCalledWith('Raw PDF content text', mockParsedData)
    expect(aiPort.generateImprovements).toHaveBeenCalledWith('Raw PDF content text', mockParsedData)

    // Verify final state is saved
    expect(analysis.status).toBe('DONE')
    expect(analysis.scores).toEqual(mockScores)
    expect(analysis.insights).toEqual(mockInsights)
    expect(analysis.atsAnalysis).toEqual(mockATSAnalysis)
    expect(analysis.starRewrites).toEqual(mockStarRewrites)
    expect(analysis.xyzRewrites).toEqual(mockXyzRewrites)
    expect(analysis.improvements).toEqual(mockImprovements)
    expect(analysis.errors).toBeNull()

    expect(resume.status).toBe('DONE')
  })

  it('should implement graceful degradation: continue when non-critical AI steps fail', async () => {
    const resume = Resume.create({
      userId: 'user-123',
      fileName: 'resume.pdf',
      fileUrl: 'https://mock.url',
      fileType: 'PDF',
      extractedText: 'Raw PDF content text',
      status: 'PENDING',
      parsedData: mockParsedData, // Parsed data already exists on resume
    })

    const analysis = Analysis.create({
      resumeId: resume.id,
      userId: 'user-123',
      status: 'PENDING',
    })

    vi.spyOn(resumeRepository, 'findById').mockResolvedValue(resume)
    vi.spyOn(analysisRepository, 'findById').mockResolvedValue(analysis)

    // Mock scores step to throw an error
    vi.spyOn(aiPort, 'generateScores').mockRejectedValue(new Error('Scores API Error'))

    const input: AnalyzeResumeInput = {
      resumeId: resume.id,
      analysisId: analysis.id,
      userId: 'user-123',
    }

    await useCase.execute(input)

    // Pipeline should complete
    expect(analysis.status).toBe('PARTIAL_ERROR')
    
    // Scores should be null and contain error record
    expect(analysis.scores).toBeNull()
    expect(analysis.errors).toEqual(
      expect.objectContaining({
        scores: { message: 'Scores API Error', retryable: true },
      })
    )

    // Other steps should still run and be populated
    expect(analysis.insights).toEqual(mockInsights)
    expect(analysis.atsAnalysis).toEqual(mockATSAnalysis)
  })

  it('should abort immediately and throw error if the critical text extraction / parse step fails', async () => {
    const resume = Resume.create({
      userId: 'user-123',
      fileName: 'resume.pdf',
      fileUrl: 'https://mock.url',
      fileType: 'PDF',
      extractedText: 'Raw PDF content text',
      status: 'PENDING',
      parsedData: null, // Critical step needs to run
    })

    const analysis = Analysis.create({
      resumeId: resume.id,
      userId: 'user-123',
      status: 'PENDING',
    })

    vi.spyOn(resumeRepository, 'findById').mockResolvedValue(resume)
    vi.spyOn(analysisRepository, 'findById').mockResolvedValue(analysis)

    // Mock extractResumeData to reject
    vi.spyOn(aiPort, 'extractResumeData').mockRejectedValue(new Error('Extraction Critical Error'))

    const input: AnalyzeResumeInput = {
      resumeId: resume.id,
      analysisId: analysis.id,
      userId: 'user-123',
    }

    await expect(useCase.execute(input)).rejects.toThrow('Extraction Critical Error')

    // AI steps 2-7 should NOT have been called
    expect(aiPort.generateScores).not.toHaveBeenCalled()
  })
})
