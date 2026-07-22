import OpenAI from 'openai'
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

export class OpenAIAdapter implements IAIPort {
  private client?: OpenAI

  constructor() {
    if (env.OPENAI_API_KEY) {
      this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY })
    }
  }

  private async callOpenAI(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.client) {
      throw new Error('OPENAI_API_KEY não configurada no arquivo .env')
    }

    const response = await this.client.chat.completions.create({
      model: env.OPENAI_MODEL,
      max_tokens: env.OPENAI_MAX_TOKENS,
      messages: [
        { role: 'system', content: systemPrompt ?? 'Você é um Recrutador Sênior e Especialista em ATS. Responda estritamente em JSON válido.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Retorno da API da OpenAI está vazio.')
    }

    return content
  }

  private parseJSON<T>(text: string): T {
    return JSON.parse(text) as T
  }

  async extractResumeData(text: string): Promise<ResumeParsedData> {
    const response = await this.callOpenAI(EXTRACTION_USER_PROMPT(text), EXTRACTION_SYSTEM_PROMPT)
    return this.parseJSON<ResumeParsedData>(response)
  }

  async generateScores(resumeText: string, parsedData: ResumeParsedData): Promise<AnalysisScores> {
    const response = await this.callOpenAI(SCORING_USER_PROMPT(resumeText, parsedData), SCORING_SYSTEM_PROMPT)
    return this.parseJSON<AnalysisScores>(response)
  }

  async generateInsights(resumeText: string, parsedData: ResumeParsedData): Promise<Insight[]> {
    const response = await this.callOpenAI(INSIGHTS_USER_PROMPT(resumeText, parsedData), INSIGHTS_SYSTEM_PROMPT)
    const data = this.parseJSON<{ insights: Insight[] } | Insight[]>(response)
    return Array.isArray(data) ? data : data.insights
  }

  async analyzeATS(resumeText: string): Promise<ATSAnalysis> {
    const response = await this.callOpenAI(ATS_USER_PROMPT(resumeText), ATS_SYSTEM_PROMPT)
    return this.parseJSON<ATSAnalysis>(response)
  }

  async generateSTARRewrites(resumeText: string, parsedData: ResumeParsedData): Promise<STARRewrite[]> {
    const response = await this.callOpenAI(STAR_USER_PROMPT(parsedData), STAR_SYSTEM_PROMPT)
    const data = this.parseJSON<{ rewrites: STARRewrite[] } | STARRewrite[]>(response)
    return Array.isArray(data) ? data : data.rewrites
  }

  async generateXYZRewrites(resumeText: string, parsedData: ResumeParsedData): Promise<XYZRewrite[]> {
    const response = await this.callOpenAI(XYZ_USER_PROMPT(parsedData), XYZ_SYSTEM_PROMPT)
    const data = this.parseJSON<{ rewrites: XYZRewrite[] } | XYZRewrite[]>(response)
    return Array.isArray(data) ? data : data.rewrites
  }

  async generateImprovements(resumeText: string, parsedData: ResumeParsedData): Promise<Improvements> {
    const response = await this.callOpenAI(IMPROVEMENTS_USER_PROMPT(parsedData), IMPROVEMENTS_SYSTEM_PROMPT)
    return this.parseJSON<Improvements>(response)
  }

  async matchJobDescription(resumeText: string, jobDescription: string): Promise<Omit<JobMatch, 'id' | 'analysisId' | 'createdAt'>> {
    const prompt = `Match de vaga em JSON: { matchScore, missingKeywords: [], missingCompetencies: [], suggestions: [{ section, suggestion, reason }] }
    
    Currículo: ${resumeText}
    Vaga: ${jobDescription}`

    const response = await this.callOpenAI(prompt)
    return this.parseJSON<Omit<JobMatch, 'id' | 'analysisId' | 'createdAt'>>(response)
  }
}
