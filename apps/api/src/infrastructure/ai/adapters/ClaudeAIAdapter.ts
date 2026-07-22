import Anthropic from '@anthropic-ai/sdk'
import { IAIPort } from '../../../application/ports/IAIPort.js'
import { env } from '../../config/env.js'
import { logger } from '../../logger/logger.js'
import {
  AnalysisScores,
  ATSAnalysis,
  Improvements,
  Insight,
  JobMatch,
  ResumeParsedData,
  STARRewrite,
  XYZRewrite,
} from '@resumeai/shared-types'

// Prompt imports
import { EXTRACTION_SYSTEM_PROMPT, EXTRACTION_USER_PROMPT } from '../prompts/extraction.prompt.js'
import { SCORING_SYSTEM_PROMPT, SCORING_USER_PROMPT } from '../prompts/scoring.prompt.js'
import { INSIGHTS_SYSTEM_PROMPT, INSIGHTS_USER_PROMPT } from '../prompts/insights.prompt.js'
import { ATS_SYSTEM_PROMPT, ATS_USER_PROMPT } from '../prompts/ats.prompt.js'
import { STAR_SYSTEM_PROMPT, STAR_USER_PROMPT } from '../prompts/star.prompt.js'
import { XYZ_SYSTEM_PROMPT, XYZ_USER_PROMPT } from '../prompts/xyz.prompt.js'
import { IMPROVEMENTS_SYSTEM_PROMPT, IMPROVEMENTS_USER_PROMPT } from '../prompts/improvements.prompt.js'

export class ClaudeAIAdapter implements IAIPort {
  private client?: Anthropic

  constructor() {
    if (env.ANTHROPIC_API_KEY) {
      this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
    }
  }

  private async callClaude(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.client) {
      throw new Error('ANTHROPIC_API_KEY não configurada no arquivo .env')
    }

    const response = await this.client.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: env.ANTHROPIC_MAX_TOKENS,
      system: systemPrompt ?? 'Você é um Recrutador Sênior e Especialista em ATS. Responda estritamente no formato JSON válido solicitado.',
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = response.content.find((c) => c.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Retorno da API da Anthropic não contém texto.')
    }

    return textBlock.text
  }

  private parseJSON<T>(text: string): T {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned) as T
  }

  async extractResumeData(text: string): Promise<ResumeParsedData> {
    try {
      const response = await this.callClaude(EXTRACTION_USER_PROMPT(text), EXTRACTION_SYSTEM_PROMPT)
      return this.parseJSON<ResumeParsedData>(response)
    } catch (err) {
      logger.error({ err }, 'Erro no ClaudeAIAdapter.extractResumeData')
      throw err
    }
  }

  async generateScores(resumeText: string, parsedData: ResumeParsedData): Promise<AnalysisScores> {
    const response = await this.callClaude(SCORING_USER_PROMPT(resumeText, parsedData), SCORING_SYSTEM_PROMPT)
    return this.parseJSON<AnalysisScores>(response)
  }

  async generateInsights(resumeText: string, parsedData: ResumeParsedData): Promise<Insight[]> {
    const response = await this.callClaude(INSIGHTS_USER_PROMPT(resumeText, parsedData), INSIGHTS_SYSTEM_PROMPT)
    const data = this.parseJSON<{ insights: Insight[] } | Insight[]>(response)
    return Array.isArray(data) ? data : data.insights
  }

  async analyzeATS(resumeText: string): Promise<ATSAnalysis> {
    const response = await this.callClaude(ATS_USER_PROMPT(resumeText), ATS_SYSTEM_PROMPT)
    return this.parseJSON<ATSAnalysis>(response)
  }

  async generateSTARRewrites(resumeText: string, parsedData: ResumeParsedData): Promise<STARRewrite[]> {
    const response = await this.callClaude(STAR_USER_PROMPT(parsedData), STAR_SYSTEM_PROMPT)
    const data = this.parseJSON<{ rewrites: STARRewrite[] } | STARRewrite[]>(response)
    return Array.isArray(data) ? data : data.rewrites
  }

  async generateXYZRewrites(resumeText: string, parsedData: ResumeParsedData): Promise<XYZRewrite[]> {
    const response = await this.callClaude(XYZ_USER_PROMPT(parsedData), XYZ_SYSTEM_PROMPT)
    const data = this.parseJSON<{ rewrites: XYZRewrite[] } | XYZRewrite[]>(response)
    return Array.isArray(data) ? data : data.rewrites
  }

  async generateImprovements(resumeText: string, parsedData: ResumeParsedData): Promise<Improvements> {
    const response = await this.callClaude(IMPROVEMENTS_USER_PROMPT(parsedData), IMPROVEMENTS_SYSTEM_PROMPT)
    return this.parseJSON<Improvements>(response)
  }

  async matchJobDescription(resumeText: string, jobDescription: string): Promise<Omit<JobMatch, 'id' | 'analysisId' | 'createdAt'>> {
    const prompt = `Compare o currículo com a descrição da vaga e calcule o matchScore (0-100), missingKeywords, missingCompetencies, e suggestions: [{ section, suggestion, reason }].
    Retorne JSON.

    Currículo: ${resumeText}
    Vaga: ${jobDescription}`

    const response = await this.callClaude(prompt)
    return this.parseJSON<Omit<JobMatch, 'id' | 'analysisId' | 'createdAt'>>(response)
  }
}
