import { FastifyInstance } from 'fastify'

export async function analysisRoutes(app: FastifyInstance) {
  /**
   * GET /api/v1/analyses/:id
   * Get analysis by ID. Returns partial results if status is PARTIAL_ERROR.
   */
  app.get('/:id', async (request, reply) => {
    // TODO: wire GetAnalysisUseCase
    const { id } = request.params as { id: string }
    return reply.send({
      success: true,
      data: { id, status: 'PENDING', message: 'Use case to be wired in Phase 3' },
    })
  })

  /**
   * GET /api/v1/analyses/:id/status
   * Lightweight polling endpoint — returns only status + progress.
   */
  app.get('/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string }
    // TODO: wire repository query
    return reply.send({
      success: true,
      data: { id, status: 'PENDING', completedSections: [] },
    })
  })

  /**
   * POST /api/v1/analyses/:id/job-match
   * Match a resume against a job description.
   */
  app.post('/:id/job-match', async (request, reply) => {
    // TODO: wire MatchJobDescriptionUseCase
    return reply.status(501).send({
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Coming in Phase 5', details: null },
    })
  })
}
