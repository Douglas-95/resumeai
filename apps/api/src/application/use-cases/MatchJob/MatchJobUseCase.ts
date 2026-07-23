import { inject, injectable } from 'tsyringe'
import { IAnalysisRepository } from '../../../domain/repositories/IAnalysisRepository.js'
import { IResumeRepository } from '../../../domain/repositories/IResumeRepository.js'
import { IJobMatchRepository } from '../../../domain/repositories/IJobMatchRepository.js'
import { IAIPort } from '../../ports/IAIPort.js'
import { JobMatch } from '../../../domain/entities/JobMatch.js'

export interface MatchJobInput {
  analysisId: string
  userId: string
  jobDescription: string
}

export interface MatchJobOutput {
  id: string
  matchScore: number
  missingKeywords: string[]
  missingCompetencies: string[]
  suggestions: Array<{
    section: string
    suggestion: string
    reason: string
  }>
  createdAt: Date
}

@injectable()
export class MatchJobUseCase {
  constructor(
    @inject('IAnalysisRepository') private readonly analysisRepository: IAnalysisRepository,
    @inject('IResumeRepository') private readonly resumeRepository: IResumeRepository,
    @inject('IJobMatchRepository') private readonly jobMatchRepository: IJobMatchRepository,
    @inject('IAIPort') private readonly ai: IAIPort,
  ) {}

  async execute(input: MatchJobInput): Promise<MatchJobOutput> {
    const analysis = await this.analysisRepository.findById(input.analysisId)
    if (!analysis) {
      throw new Error(`Análise com ID ${input.analysisId} não encontrada.`)
    }

    if (analysis.userId !== input.userId) {
      throw new Error('Acesso negado: esta análise pertence a outro usuário.')
    }

    const resume = await this.resumeRepository.findById(analysis.resumeId)
    if (!resume) {
      throw new Error(`Currículo com ID ${analysis.resumeId} não encontrado.`)
    }

    const resumeText = resume.extractedText ?? ''

    // Call AI to match
    const aiResult = await this.ai.matchJobDescription(resumeText, input.jobDescription)

    const jobMatch = JobMatch.create({
      analysisId: analysis.id,
      jobDescription: input.jobDescription,
      matchScore: aiResult.matchScore,
      missingKeywords: aiResult.missingKeywords,
      missingCompetencies: aiResult.missingCompetencies,
      suggestions: aiResult.suggestions,
    })

    await this.jobMatchRepository.save(jobMatch)

    return {
      id: jobMatch.id,
      matchScore: jobMatch.matchScore,
      missingKeywords: jobMatch.missingKeywords,
      missingCompetencies: jobMatch.missingCompetencies,
      suggestions: jobMatch.suggestions,
      createdAt: jobMatch.createdAt,
    }
  }
}
