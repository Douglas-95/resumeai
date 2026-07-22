import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { env } from '../../infrastructure/config/env.js'
import { logger } from '../../infrastructure/logger/logger.js'
import { resumeRoutes } from './routes/resume.routes.js'
import { analysisRoutes } from './routes/analysis.routes.js'

export async function buildServer() {
  const server = Fastify({
    logger: false, // We use our own pino logger
  })

  // ── Plugins ──────────────────────────────────────────────────────────────

  await server.register(cors, {
    origin: env.NODE_ENV === 'production' ? ['https://resumeai.com'] : true,
    credentials: true,
  })

  await server.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 1,
    },
  })

  await server.register(jwt, {
    secret: env.JWT_SECRET,
  })

  await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })

  await server.register(swagger, {
    openapi: {
      info: {
        title: 'ResumeAI API',
        description: 'Plataforma inteligente de análise de currículos com IA',
        version: '1.0.0',
      },
    },
  })

  await server.register(swaggerUi, {
    routePrefix: '/docs',
  })

  // ── Routes ────────────────────────────────────────────────────────────────

  await server.register(resumeRoutes, { prefix: '/api/v1/resumes' })
  await server.register(analysisRoutes, { prefix: '/api/v1/analyses' })

  // ── Health Check ─────────────────────────────────────────────────────────

  server.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiProvider: env.AI_PROVIDER,
  }))

  // ── Error Handler ─────────────────────────────────────────────────────────

  server.setErrorHandler((error, request, reply) => {
    logger.error({ err: error, url: request.url }, 'Unhandled error')
    reply.status(error.statusCode ?? 500).send({
      success: false,
      error: {
        code: error.code ?? 'INTERNAL_ERROR',
        message: error.message,
        details: null,
      },
    })
  })

  return server
}
