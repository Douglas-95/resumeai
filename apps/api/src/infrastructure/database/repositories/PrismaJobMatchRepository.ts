import { PrismaClient } from '@prisma/client'
import { IJobMatchRepository } from '../../../domain/repositories/IJobMatchRepository.js'
import { JobMatch } from '../../../domain/entities/JobMatch.js'

export class PrismaJobMatchRepository implements IJobMatchRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(jobMatch: JobMatch): Promise<void> {
    await this.prisma.jobMatch.create({
      data: {
        id: jobMatch.id,
        analysisId: jobMatch.analysisId,
        jobDescription: jobMatch.jobDescription,
        matchScore: jobMatch.matchScore,
        missingKeywords: jobMatch.missingKeywords,
        missingCompetencies: jobMatch.missingCompetencies,
        suggestions: jobMatch.suggestions as any,
      },
    })
  }

  async findByAnalysisId(analysisId: string): Promise<JobMatch[]> {
    const records = await this.prisma.jobMatch.findMany({
      where: { analysisId },
      orderBy: { createdAt: 'desc' },
    })

    return records.map((record) =>
      JobMatch.create({
        id: record.id,
        analysisId: record.analysisId,
        jobDescription: record.jobDescription,
        matchScore: record.matchScore,
        missingKeywords: record.missingKeywords as string[],
        missingCompetencies: record.missingCompetencies as string[],
        suggestions: record.suggestions as Array<{
          section: string
          suggestion: string
          reason: string
        }>,
        createdAt: record.createdAt,
      })
    )
  }
}
