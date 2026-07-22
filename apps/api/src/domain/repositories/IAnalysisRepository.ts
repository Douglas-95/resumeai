import { Analysis } from '../entities/Analysis.js'

export interface IAnalysisRepository {
  findById(id: string): Promise<Analysis | null>
  findByResumeId(resumeId: string): Promise<Analysis | null>
  findByUserId(userId: string): Promise<Analysis[]>
  save(analysis: Analysis): Promise<void>
  update(analysis: Analysis): Promise<void>
}
