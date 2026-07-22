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
    const prompt = `Extraia as informações do currículo em JSON:
    name, currentRole, email, phone, location, linkedin, github, portfolio, summary,
    experiences: [{ company, role, startDate, endDate, isCurrent, description }],
    education: [{ institution, degree, field, startDate, endDate }],
    certifications: [{ name, issuer, date }],
    hardSkills: [], softSkills: [], languages: [{ language, level }]

    Currículo:
    ${text}`

    const response = await this.callOpenAI(prompt)
    return this.parseJSON<ResumeParsedData>(response)
  }

  async generateScores(resumeText: string, parsedData: ResumeParsedData): Promise<AnalysisScores> {
    const prompt = `Avalie o currículo (0-100) em 10 dimensões com justificativa:
    overall, ats, recruiter, impact, clarity, formatting, keyword, professionalism, leadership, technical.
    Formato JSON: { "overall": { "value": 85, "justification": "..." }, ... }

    Dados: ${JSON.stringify(parsedData)}`

    const response = await this.callOpenAI(prompt)
    return this.parseJSON<AnalysisScores>(response)
  }

  async generateInsights(resumeText: string, parsedData: ResumeParsedData): Promise<Insight[]> {
    const prompt = `Gere insights do currículo em um objeto JSON contendo "insights": [{ type, problem, explanation, impact, howToFix, improvementExample }].
    
    Dados: ${JSON.stringify(parsedData)}`

    const response = await this.callOpenAI(prompt)
    const data = this.parseJSON<{ insights: Insight[] } | Insight[]>(response)
    return Array.isArray(data) ? data : data.insights
  }

  async analyzeATS(resumeText: string): Promise<ATSAnalysis> {
    const prompt = `Análise ATS em JSON: { score, isReadable, keywordCount, sectionOrder, hasTables, hasImages, hasColumns, isPDFCompatible, issues: [], recommendations: [] }
    
    Texto: ${resumeText}`

    const response = await this.callOpenAI(prompt)
    return this.parseJSON<ATSAnalysis>(response)
  }

  async generateSTARRewrites(resumeText: string, parsedData: ResumeParsedData): Promise<STARRewrite[]> {
    const prompt = `Reescreva as experiências em STAR. Retorne JSON { "rewrites": [{ original, situation, task, action, result }] }
    
    Experiências: ${JSON.stringify(parsedData.experiences)}`

    const response = await this.callOpenAI(prompt)
    const data = this.parseJSON<{ rewrites: STARRewrite[] } | STARRewrite[]>(response)
    return Array.isArray(data) ? data : data.rewrites
  }

  async generateXYZRewrites(resumeText: string, parsedData: ResumeParsedData): Promise<XYZRewrite[]> {
    const prompt = `Reescreva em formato Google XYZ. Retorne JSON { "rewrites": [{ original, rewritten, hasRealMetrics, note }] }
    
    Experiências: ${JSON.stringify(parsedData.experiences)}`

    const response = await this.callOpenAI(prompt)
    const data = this.parseJSON<{ rewrites: XYZRewrite[] } | XYZRewrite[]>(response)
    return Array.isArray(data) ? data : data.rewrites
  }

  async generateImprovements(resumeText: string, parsedData: ResumeParsedData): Promise<Improvements> {
    const prompt = `Melhorias em JSON: professionalTitle, professionalSummary, linkedinHeadline, gupySummary, indeedSummary, cathoSummary, internationalSummary, atsFriendlyVersion, modernVersion, executiveVersion, internationalVersion.
    
    Dados: ${JSON.stringify(parsedData)}`

    const response = await this.callOpenAI(prompt)
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
