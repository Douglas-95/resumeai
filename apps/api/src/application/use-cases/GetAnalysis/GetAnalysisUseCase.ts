import { inject, injectable } from 'tsyringe'
import { IAnalysisRepository } from '../../../domain/repositories/IAnalysisRepository.js'
import { Analysis } from '../../../domain/entities/Analysis.js'

export interface GetAnalysisInput {
  analysisId: string
  userId: string
}

@injectable()
export class GetAnalysisUseCase {
  constructor(
    @inject('IAnalysisRepository') private readonly analysisRepository: IAnalysisRepository,
  ) {}

  async execute(input: GetAnalysisInput): Promise<Analysis> {
    const analysis = await this.analysisRepository.findById(input.analysisId)
    if (!analysis) {
      throw new Error(`Análise com ID ${input.analysisId} não encontrada.`)
    }

    // Security check: ensure analysis belongs to the user requesting it
    if (analysis.userId !== input.userId) {
      throw new Error('Acesso negado: esta análise pertence a outro usuário.')
    }

    return analysis
  }
}
