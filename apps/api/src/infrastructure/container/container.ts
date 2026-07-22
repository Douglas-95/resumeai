import { container } from 'tsyringe'
import { PrismaClient } from '@prisma/client'
import { env } from '../config/env.js'

import { PrismaResumeRepository } from '../database/repositories/PrismaResumeRepository.js'
import { PrismaAnalysisRepository } from '../database/repositories/PrismaAnalysisRepository.js'
import { InMemoryResumeRepository } from '../database/repositories/InMemoryResumeRepository.js'
import { InMemoryAnalysisRepository } from '../database/repositories/InMemoryAnalysisRepository.js'

// Adapters
import { SupabaseStorageAdapter } from '../storage/SupabaseStorageAdapter.js'
import { BullMQAdapter } from '../queue/BullMQAdapter.js'
import { ClaudeAIAdapter } from '../ai/adapters/ClaudeAIAdapter.js'
import { OpenAIAdapter } from '../ai/adapters/OpenAIAdapter.js'
import { AIGateway } from '../ai/AIGateway.js'

export function setupContainer(): void {
  const useInMemory = env.DATABASE_URL.startsWith('file:') || process.env.USE_IN_MEMORY_DB === 'true'

  if (useInMemory) {
    console.warn('⚠️ Utilizando banco de dados Em Memória (In-Memory) para testes locais.')
    container.registerInstance('IResumeRepository', new InMemoryResumeRepository())
    container.registerInstance('IAnalysisRepository', new InMemoryAnalysisRepository())
  } else {
    const prisma = new PrismaClient()
    container.registerInstance(PrismaClient, prisma)
    container.registerInstance('IResumeRepository', new PrismaResumeRepository(prisma))
    container.registerInstance('IAnalysisRepository', new PrismaAnalysisRepository(prisma))
  }

  // Storage & Queue
  container.registerSingleton('IStoragePort', SupabaseStorageAdapter)
  container.registerSingleton('IQueuePort', BullMQAdapter)
  container.registerInstance('StorageBucket', env.SUPABASE_STORAGE_BUCKET)

  // AI Provider Injection based strictly on env.AI_PROVIDER
  if (env.AI_PROVIDER === 'openai') {
    container.registerSingleton('ConcreteAIAdapter', OpenAIAdapter)
  } else {
    container.registerSingleton('ConcreteAIAdapter', ClaudeAIAdapter)
  }

  // AI Gateway as the main IAIPort implementation
  container.registerSingleton('IAIPort', AIGateway)
}
