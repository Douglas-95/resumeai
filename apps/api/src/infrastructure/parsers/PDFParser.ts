import pdf from 'pdf-parse'
import { logger } from '../logger/logger.js'

export class PDFParser {
  static async extractText(buffer: Buffer): Promise<string> {
    try {
      const data = await pdf(buffer)
      const text = data.text ? data.text.trim() : ''
      if (!text) {
        throw new Error('Nenhum texto extraído do arquivo PDF.')
      }
      return text
    } catch (err) {
      logger.error({ err }, 'Erro ao extrair texto do PDF')
      throw new Error(`Falha na extração de texto do PDF: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}
