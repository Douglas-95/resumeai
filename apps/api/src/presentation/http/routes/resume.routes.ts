import { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { UploadResumeUseCase } from '../../../application/use-cases/UploadResume/UploadResumeUseCase.js'
import { FileType } from '@resumeai/shared-types'
import { IResumeRepository } from '../../../domain/repositories/IResumeRepository.js'
import { IAnalysisRepository } from '../../../domain/repositories/IAnalysisRepository.js'

export async function resumeRoutes(app: FastifyInstance) {
  /**
   * POST /api/v1/resumes/upload
   * Upload a resume file (PDF or DOCX).
   * Returns immediately with PENDING status — analysis is async.
   */
  app.post(
    '/upload',
    {
      schema: {
        description: 'Upload a resume for AI analysis',
        tags: ['resumes'],
        consumes: ['multipart/form-data'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  resumeId: { type: 'string' },
                  analysisId: { type: 'string' },
                  jobId: { type: 'string' },
                  status: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // Auth: extract userId from JWT
      // await request.jwtVerify()  // Enable when auth is wired
      const userId = 'temp-user-id' // Replace with request.user.id

      const data = await request.file()
      if (!data) {
        return reply.status(400).send({
          success: false,
          error: { code: 'NO_FILE', message: 'No file uploaded', details: null },
        })
      }

      const allowedMimeTypes: Record<string, FileType> = {
        'application/pdf': 'PDF',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      }

      const fileType = allowedMimeTypes[data.mimetype]
      if (!fileType) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Only PDF and DOCX files are accepted',
            details: null,
          },
        })
      }

      const buffer = await data.toBuffer()
      const useCase = container.resolve(UploadResumeUseCase)

      const result = await useCase.execute({
        userId,
        fileName: data.filename,
        fileBuffer: buffer,
        mimeType: data.mimetype,
        fileType,
      })

      return reply.send({ success: true, data: result })
    },
  )

  /**
   * GET /api/v1/resumes
   * List resumes for the authenticated user.
   */
  app.get('/', async (request, reply) => {
    const userId = 'temp-user-id' // Replace with request.user.id
    
    const resumeRepository = container.resolve<IResumeRepository>('IResumeRepository')
    const analysisRepository = container.resolve<IAnalysisRepository>('IAnalysisRepository')

    const resumes = await resumeRepository.findByUserId(userId)
    const data = await Promise.all(
      resumes.map(async (resume) => {
        const analysis = await analysisRepository.findByResumeId(resume.id)
        return {
          id: resume.id,
          fileName: resume.fileName,
          fileType: resume.fileType,
          status: resume.status,
          createdAt: resume.createdAt,
          analysisId: analysis?.id ?? null,
        }
      })
    )

    return reply.send({ success: true, data })
  })

  /**
   * DELETE /api/v1/resumes/:id
   * Delete a resume and its associated analysis (cascading).
   */
  app.delete(
    '/:id',
    {
      schema: {
        description: 'Delete a resume and its analysis history',
        tags: ['resumes'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
      },
    },
    async (request, reply) => {
      const userId = 'temp-user-id' // Replace with request.user.id
      const { id } = request.params as { id: string }

      const resumeRepository = container.resolve<IResumeRepository>('IResumeRepository')

      const resume = await resumeRepository.findById(id)
      if (!resume) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Currículo não encontrado.' },
        })
      }

      if (resume.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Acesso negado: este currículo pertence a outro usuário.' },
        })
      }

      await resumeRepository.delete(id)
      return reply.send({ success: true, message: 'Currículo e análise excluídos com sucesso.' })
    }
  )
}
