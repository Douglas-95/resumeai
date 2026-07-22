import { IAnalysisRepository } from '../../../domain/repositories/IAnalysisRepository.js'
import { Analysis } from '../../../domain/entities/Analysis.js'

export class InMemoryAnalysisRepository implements IAnalysisRepository {
  private analyses: Map<string, Analysis> = new Map()

  async findById(id: string): Promise<Analysis | null> {
    const analysis = this.analyses.get(id)
    return analysis ?? null
  }

  async findByResumeId(resumeId: string): Promise<Analysis | null> {
    return Array.from(this.analyses.values()).find((a) => a.resumeId === resumeId) ?? null
  }

  async findByUserId(userId: string): Promise<Analysis[]> {
    return Array.from(this.analyses.values()).filter((a) => a.userId === userId)
  }

  async save(analysis: Analysis): Promise<void> {
    this.analyses.set(analysis.id, analysis)
  }

  async update(analysis: Analysis): Promise<void> {
    this.analyses.set(analysis.id, analysis)
  }
}
