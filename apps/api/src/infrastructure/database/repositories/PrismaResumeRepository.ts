import { PrismaClient } from '@prisma/client'
import { IResumeRepository } from '../../../domain/repositories/IResumeRepository.js'
import { Resume } from '../../../domain/entities/Resume.js'
import { FileType, ResumeParsedData, ResumeStatus } from '@resumeai/shared-types'

export class PrismaResumeRepository implements IResumeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Resume | null> {
    const raw = await this.prisma.resume.findUnique({ where: { id } })
    if (!raw) return null

    return Resume.reconstitute({
      id: raw.id,
      userId: raw.userId,
      fileName: raw.fileName,
      fileUrl: raw.fileUrl,
      fileType: raw.fileType as FileType,
      extractedText: raw.extractedText,
      parsedData: raw.parsedData as unknown as ResumeParsedData | null,
      status: raw.status as ResumeStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    })
  }

  async findByUserId(userId: string): Promise<Resume[]> {
    const rawList = await this.prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return rawList.map((raw) =>
      Resume.reconstitute({
        id: raw.id,
        userId: raw.userId,
        fileName: raw.fileName,
        fileUrl: raw.fileUrl,
        fileType: raw.fileType as FileType,
        extractedText: raw.extractedText,
        parsedData: raw.parsedData as unknown as ResumeParsedData | null,
        status: raw.status as ResumeStatus,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      }),
    )
  }

  async save(resume: Resume): Promise<void> {
    await this.prisma.resume.create({
      data: {
        id: resume.id,
        userId: resume.userId,
        fileName: resume.fileName,
        fileUrl: resume.fileUrl,
        fileType: resume.fileType,
        extractedText: resume.extractedText,
        parsedData: resume.parsedData ? (resume.parsedData as any) : undefined,
        status: resume.status,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      },
    })
  }

  async update(resume: Resume): Promise<void> {
    await this.prisma.resume.update({
      where: { id: resume.id },
      data: {
        fileName: resume.fileName,
        fileUrl: resume.fileUrl,
        extractedText: resume.extractedText,
        parsedData: resume.parsedData ? (resume.parsedData as any) : undefined,
        status: resume.status,
        updatedAt: resume.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.resume.delete({ where: { id } })
  }
}
