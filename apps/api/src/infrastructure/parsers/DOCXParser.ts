import mammoth from 'mammoth'
import { logger } from '../logger/logger.js'

export class DOCXParser {
  static async extractText(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer })
      const text = result.value ? result.value.trim() : ''
      if (!text) {
        throw new Error('Nenhum texto extraído do arquivo DOCX.')
      }
      return text
    } catch (err) {
      logger.error({ err }, 'Erro ao extrair texto do DOCX')
      throw new Error(`Falha na extração de texto do DOCX: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}
