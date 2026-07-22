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
    const prompt = `Extraia todas as informações relevantes do currículo abaixo em um objeto JSON válido.
    Campos necessários:
    name, currentRole, email, phone, location, linkedin, github, portfolio, summary,
    experiences: [{ company, role, startDate, endDate, isCurrent, description }],
    education: [{ institution, degree, field, startDate, endDate }],
    certifications: [{ name, issuer, date }],
    hardSkills: [], softSkills: [], languages: [{ language, level }]

    Currículo:
    ${text}`

    try {
      const response = await this.callClaude(prompt)
      return this.parseJSON<ResumeParsedData>(response)
    } catch (err) {
      logger.error({ err }, 'Erro no ClaudeAIAdapter.extractResumeData')
      throw err
    }
  }

  async generateScores(resumeText: string, parsedData: ResumeParsedData): Promise<AnalysisScores> {
    const prompt = `Avalie o currículo abaixo de 0 a 100 em 10 dimensões com justificativa detalhada para cada uma:
    overall, ats, recruiter, impact, clarity, formatting, keyword, professionalism, leadership, technical.
    Formato JSON:
    { "overall": { "value": 85, "justification": "..." }, ... }

    Dados: ${JSON.stringify(parsedData)}`

    const response = await this.callClaude(prompt)
    return this.parseJSON<AnalysisScores>(response)
  }

  async generateInsights(resumeText: string, parsedData: ResumeParsedData): Promise<Insight[]> {
    const prompt = `Identifique pontos fortes, pontos fracos, informações ausentes, redundantes, falta de métricas, verbos de ação fracos, etc.
    Retorne uma lista JSON de objetos com: type, problem, explanation, impact, howToFix, improvementExample.

    Dados: ${JSON.stringify(parsedData)}`

    const response = await this.callClaude(prompt)
    return this.parseJSON<Insight[]>(response)
  }

  async analyzeATS(resumeText: string): Promise<ATSAnalysis> {
    const prompt = `Analise a compatibilidade ATS deste texto de currículo.
    Retorne JSON: { score, isReadable, keywordCount, sectionOrder, hasTables, hasImages, hasColumns, isPDFCompatible, issues: [], recommendations: [] }

    Texto: ${resumeText}`

    const response = await this.callClaude(prompt)
    return this.parseJSON<ATSAnalysis>(response)
  }

  async generateSTARRewrites(resumeText: string, parsedData: ResumeParsedData): Promise<STARRewrite[]> {
    const prompt = `Reescreva as experiências profissionais no formato STAR (Situação, Tarefa, Ação, Resultado).
    Retorne JSON array: [{ original, situation, task, action, result }]

    Experiências: ${JSON.stringify(parsedData.experiences)}`

    const response = await this.callClaude(prompt)
    return this.parseJSON<STARRewrite[]>(response)
  }

  async generateXYZRewrites(resumeText: string, parsedData: ResumeParsedData): Promise<XYZRewrite[]> {
    const prompt = `Reescreva as frases de impacto no formato Google XYZ ("Conquistei X medido por Y fazendo Z").
    Se não houver métricas reais, sugira métricas plausíveis informando na propriedade note.
    Retorne JSON array: [{ original, rewritten, hasRealMetrics, note }]

    Experiências: ${JSON.stringify(parsedData.experiences)}`

    const response = await this.callClaude(prompt)
    return this.parseJSON<XYZRewrite[]>(response)
  }

  async generateImprovements(resumeText: string, parsedData: ResumeParsedData): Promise<Improvements> {
    const prompt = `Gere sugestões de melhorias: professionalTitle, professionalSummary, linkedinHeadline, gupySummary, indeedSummary, cathoSummary, internationalSummary, atsFriendlyVersion, modernVersion, executiveVersion, internationalVersion.
    Retorne JSON com estas propriedades.

    Dados: ${JSON.stringify(parsedData)}`

    const response = await this.callClaude(prompt)
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
