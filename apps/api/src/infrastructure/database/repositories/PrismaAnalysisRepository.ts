import { PrismaClient } from '@prisma/client'
import { IAnalysisRepository } from '../../../domain/repositories/IAnalysisRepository.js'
import { Analysis } from '../../../domain/entities/Analysis.js'
import {
  AnalysisScores,
  ATSAnalysis,
  Improvements,
  Insight,
  ResumeStatus,
  STARRewrite,
  XYZRewrite,
} from '@resumeai/shared-types'

export class PrismaAnalysisRepository implements IAnalysisRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Analysis | null> {
    const raw = await this.prisma.analysis.findUnique({ where: { id } })
    if (!raw) return null

    return Analysis.reconstitute({
      id: raw.id,
      resumeId: raw.resumeId,
      userId: raw.userId,
      status: raw.status as ResumeStatus,
      scores: raw.scores as unknown as AnalysisScores | null,
      insights: raw.insights as unknown as Insight[] | null,
      atsAnalysis: raw.atsAnalysis as unknown as ATSAnalysis | null,
      starRewrites: raw.starRewrites as unknown as STARRewrite[] | null,
      xyzRewrites: raw.xyzRewrites as unknown as XYZRewrite[] | null,
      improvements: raw.improvements as unknown as Improvements | null,
      errors: raw.errors as any,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    })
  }

  async findByResumeId(resumeId: string): Promise<Analysis | null> {
    const raw = await this.prisma.analysis.findUnique({ where: { resumeId } })
    if (!raw) return null

    return Analysis.reconstitute({
      id: raw.id,
      resumeId: raw.resumeId,
      userId: raw.userId,
      status: raw.status as ResumeStatus,
      scores: raw.scores as unknown as AnalysisScores | null,
      insights: raw.insights as unknown as Insight[] | null,
      atsAnalysis: raw.atsAnalysis as unknown as ATSAnalysis | null,
      starRewrites: raw.starRewrites as unknown as STARRewrite[] | null,
      xyzRewrites: raw.xyzRewrites as unknown as XYZRewrite[] | null,
      improvements: raw.improvements as unknown as Improvements | null,
      errors: raw.errors as any,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    })
  }

  async findByUserId(userId: string): Promise<Analysis[]> {
    const rawList = await this.prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return rawList.map((raw) =>
      Analysis.reconstitute({
        id: raw.id,
        resumeId: raw.resumeId,
        userId: raw.userId,
        status: raw.status as ResumeStatus,
        scores: raw.scores as unknown as AnalysisScores | null,
        insights: raw.insights as unknown as Insight[] | null,
        atsAnalysis: raw.atsAnalysis as unknown as ATSAnalysis | null,
        starRewrites: raw.starRewrites as unknown as STARRewrite[] | null,
        xyzRewrites: raw.xyzRewrites as unknown as XYZRewrite[] | null,
        improvements: raw.improvements as unknown as Improvements | null,
        errors: raw.errors as any,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      }),
    )
  }

  async save(analysis: Analysis): Promise<void> {
    await this.prisma.analysis.create({
      data: {
        id: analysis.id,
        resumeId: analysis.resumeId,
        userId: analysis.userId,
        status: analysis.status,
        scores: analysis.scores ? (analysis.scores as any) : undefined,
        insights: analysis.insights ? (analysis.insights as any) : undefined,
        atsAnalysis: analysis.atsAnalysis ? (analysis.atsAnalysis as any) : undefined,
        starRewrites: analysis.starRewrites ? (analysis.starRewrites as any) : undefined,
        xyzRewrites: analysis.xyzRewrites ? (analysis.xyzRewrites as any) : undefined,
        improvements: analysis.improvements ? (analysis.improvements as any) : undefined,
        errors: analysis.errors ? (analysis.errors as any) : undefined,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      },
    })
  }

  async update(analysis: Analysis): Promise<void> {
    await this.prisma.analysis.update({
      where: { id: analysis.id },
      data: {
        status: analysis.status,
        scores: analysis.scores ? (analysis.scores as any) : undefined,
        insights: analysis.insights ? (analysis.insights as any) : undefined,
        atsAnalysis: analysis.atsAnalysis ? (analysis.atsAnalysis as any) : undefined,
        starRewrites: analysis.starRewrites ? (analysis.starRewrites as any) : undefined,
        xyzRewrites: analysis.xyzRewrites ? (analysis.xyzRewrites as any) : undefined,
        improvements: analysis.improvements ? (analysis.improvements as any) : undefined,
        errors: analysis.errors ? (analysis.errors as any) : undefined,
        updatedAt: analysis.updatedAt,
      },
    })
  }
}
