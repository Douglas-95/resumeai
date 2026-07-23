import { IJobMatchRepository } from '../../../domain/repositories/IJobMatchRepository.js'
import { JobMatch } from '../../../domain/entities/JobMatch.js'

export class InMemoryJobMatchRepository implements IJobMatchRepository {
  private jobMatches: Map<string, JobMatch> = new Map()

  async save(jobMatch: JobMatch): Promise<void> {
    this.jobMatches.set(jobMatch.id, jobMatch)
  }

  async findByAnalysisId(analysisId: string): Promise<JobMatch[]> {
    return Array.from(this.jobMatches.values()).filter(
      (jm) => jm.analysisId === analysisId
    )
  }
}
