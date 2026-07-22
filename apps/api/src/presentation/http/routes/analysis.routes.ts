import { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { GetAnalysisUseCase } from '../../../application/use-cases/GetAnalysis/GetAnalysisUseCase.js'

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

  /**
   * POST /api/v1/analyses/:id/job-match
   * Match a resume against a job description.
   */
  app.post('/:id/job-match', async (request, reply) => {
    return reply.status(501).send({
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Coming in Phase 5', details: null },
    })
  })
}
