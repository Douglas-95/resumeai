import { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { GetAnalysisUseCase } from '../../../application/use-cases/GetAnalysis/GetAnalysisUseCase.js'
import { MatchJobUseCase } from '../../../application/use-cases/MatchJob/MatchJobUseCase.js'

export async function analysisRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/analyses/:id
   * Get full analysis by ID. Returns partial results if status is PARTIAL_ERROR.
   */
  app.get(
    '/:id',
    {
      schema: {
        description: 'Get analysis by ID',
        tags: ['analyses'],
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
      // await request.jwtVerify()
      const userId = 'temp-user-id' // Replace with request.user.id
      const { id } = request.params as { id: string }

      const useCase = container.resolve(GetAnalysisUseCase)
      const result = await useCase.execute({ analysisId: id, userId })

      return reply.send({ success: true, data: result })
    },
  )

  /**
   * GET /api/v1/analyses/:id/status
   * Lightweight polling endpoint — returns only status + any section errors.
   */
  app.get(
    '/:id/status',
    {
      schema: {
        description: 'Get lightweight analysis status and error log',
        tags: ['analyses'],
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
      // await request.jwtVerify()
      const userId = 'temp-user-id'
      const { id } = request.params as { id: string }

      const useCase = container.resolve(GetAnalysisUseCase)
      const result = await useCase.execute({ analysisId: id, userId })

      const completedSections = []
      if (result.scores) completedSections.push('scores')
      if (result.insights) completedSections.push('insights')
      if (result.atsAnalysis) completedSections.push('ats')
      if (result.starRewrites) completedSections.push('star')
      if (result.xyzRewrites) completedSections.push('xyz')
      if (result.improvements) completedSections.push('improvements')

      return reply.send({
        success: true,
        data: {
          id: result.id,
          status: result.status,
          completedSections,
          errors: result.errors,
          updatedAt: result.updatedAt,
        },
      })
    },
  )

  app.post(
    '/:id/job-match',
    {
      schema: {
        description: 'Match a resume against a job description',
        tags: ['analyses'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            jobDescription: { type: 'string' },
          },
          required: ['jobDescription'],
        },
      },
    },
    async (request, reply) => {
      // await request.jwtVerify()
      const userId = 'temp-user-id'
      const { id } = request.params as { id: string }
      const { jobDescription } = request.body as { jobDescription: string }

      const useCase = container.resolve(MatchJobUseCase)
      const result = await useCase.execute({
        analysisId: id,
        userId,
        jobDescription,
      })

      return reply.send({ success: true, data: result })
    }
  )
}
