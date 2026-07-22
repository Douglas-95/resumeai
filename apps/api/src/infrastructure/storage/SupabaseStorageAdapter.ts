import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { IStoragePort } from '../../application/ports/IStoragePort.js'
import { env } from '../config/env.js'
import { logger } from '../logger/logger.js'

export class SupabaseStorageAdapter implements IStoragePort {
  private client: SupabaseClient

  constructor() {
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  }

  async upload(params: {
    bucket: string
    path: string
    buffer: Buffer
    mimeType: string
  }): Promise<string> {
    try {
      const { data, error } = await this.client.storage
        .from(params.bucket)
        .upload(params.path, params.buffer, {
          contentType: params.mimeType,
          upsert: true,
        })

      if (error) {
        throw error
      }

      const { data: publicUrlData } = this.client.storage
        .from(params.bucket)
        .getPublicUrl(data.path)

      return publicUrlData.publicUrl
    } catch (err) {
      logger.error({ err, path: params.path }, 'Erro ao fazer upload no Supabase Storage')
      // Fallback url simulation if supabase credentials are mock/local testing
      if (env.NODE_ENV === 'development' && (env.SUPABASE_URL.includes('your-project') || env.SUPABASE_URL.includes('localhost'))) {
        logger.warn('Modo desenvolvimento/mock: retornando URL local mock para storage.')
        return `http://localhost:${env.PORT}/mock-storage/${params.bucket}/${params.path}`
      }
      throw err
    }
  }

  async delete(params: { bucket: string; path: string }): Promise<void> {
    const { error } = await this.client.storage.from(params.bucket).remove([params.path])
    if (error) {
      logger.error({ error, path: params.path }, 'Erro ao remover arquivo do Supabase Storage')
      throw error
    }
  }

  async getSignedUrl(params: { bucket: string; path: string; expiresIn: number }): Promise<string> {
    const { data, error } = await this.client.storage
      .from(params.bucket)
      .createSignedUrl(params.path, params.expiresIn)

    if (error || !data?.signedUrl) {
      throw error ?? new Error('Falha ao gerar URL assinada.')
    }

    return data.signedUrl
  }
}
