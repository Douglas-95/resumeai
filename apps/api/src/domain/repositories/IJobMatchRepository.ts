import { JobMatch } from '../entities/JobMatch.js'

export interface IJobMatchRepository {
  save(jobMatch: JobMatch): Promise<void>
  findByAnalysisId(analysisId: string): Promise<JobMatch[]>
}
