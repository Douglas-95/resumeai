import 'reflect-metadata'
import { buildServer } from './presentation/http/server.js'
import { env } from './infrastructure/config/env.js'
import { logger } from './infrastructure/logger/logger.js'

async function bootstrap() {
  const server = await buildServer()

  try {
    await server.listen({ port: env.PORT, host: '0.0.0.0' })
    logger.info(`🚀 ResumeAI API running on port ${env.PORT}`)
    logger.info(`📚 Swagger UI: http://localhost:${env.PORT}/docs`)
    logger.info(`🤖 AI Provider: ${env.AI_PROVIDER}`)
  } catch (err) {
    logger.error(err, 'Failed to start server')
    process.exit(1)
  }
}

bootstrap()
