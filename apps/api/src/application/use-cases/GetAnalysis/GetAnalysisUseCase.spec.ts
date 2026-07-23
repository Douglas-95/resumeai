import 'reflect-metadata'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetAnalysisUseCase } from './GetAnalysisUseCase.js'
import { IAnalysisRepository } from '../../../domain/repositories/IAnalysisRepository.js'
import { Analysis } from '../../../domain/entities/Analysis.js'

describe('GetAnalysisUseCase', () => {
  let analysisRepository: IAnalysisRepository
  let useCase: GetAnalysisUseCase

  beforeEach(() => {
    analysisRepository = {
      save: vi.fn(),
      update: vi.fn(),
      findById: vi.fn(),
    }

    useCase = new GetAnalysisUseCase(analysisRepository)
  })

  it('should successfully return the analysis when found and user is authorized', async () => {
    const mockAnalysis = Analysis.create({
      resumeId: 'resume-123',
      userId: 'user-123',
      status: 'DONE',
    })

    vi.spyOn(analysisRepository, 'findById').mockResolvedValue(mockAnalysis)

    const result = await useCase.execute({
      analysisId: mockAnalysis.id,
      userId: 'user-123',
    })

    expect(result).toBe(mockAnalysis)
    expect(analysisRepository.findById).toHaveBeenCalledWith(mockAnalysis.id)
  })

  it('should throw an error when analysis is not found', async () => {
    vi.spyOn(analysisRepository, 'findById').mockResolvedValue(null)

    await expect(
      useCase.execute({
        analysisId: 'missing-id',
        userId: 'user-123',
      })
    ).rejects.toThrow('Análise com ID missing-id não encontrada.')
  })

  it('should throw an error when analysis belongs to another user', async () => {
    const mockAnalysis = Analysis.create({
      resumeId: 'resume-123',
      userId: 'user-other',
      status: 'DONE',
    })

    vi.spyOn(analysisRepository, 'findById').mockResolvedValue(mockAnalysis)

    await expect(
      useCase.execute({
        analysisId: mockAnalysis.id,
        userId: 'user-123', // Authorized requesting user differs from owner
      })
    ).rejects.toThrow('Acesso negado: esta análise pertence a outro usuário.')
  })
})
