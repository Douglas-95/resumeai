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
  private isMockMode: boolean = false

  constructor() {
    const apiKey = env.OPENAI_API_KEY
    if (apiKey && !apiKey.includes('your-') && !apiKey.startsWith('sk-...')) {
      this.client = new OpenAI({ apiKey })
    } else {
      this.isMockMode = true
      logger.warn('⚠️ OPENAI_API_KEY ausente ou invalida. Executando OpenAI em modo MOCK.')
    }
  }

  private async callOpenAI(prompt: string, systemPrompt?: string): Promise<string> {
    if (this.isMockMode) {
      throw new Error('Chave de API nao configurada')
    }

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
    if (this.isMockMode) {
      // Return same standard mock data
      return {
        name: 'Douglas Silva',
        currentRole: 'Engenheiro de Software Sênior',
        email: 'douglas.silva@email.com',
        phone: '(11) 98765-4321',
        location: 'São Paulo - SP',
        linkedin: 'https://linkedin.com/in/douglas-silva',
        github: 'https://github.com/douglas-silva',
        portfolio: 'https://douglassilva.dev',
        summary: 'Engenheiro de Software com mais de 6 anos de experiência desenvolvendo aplicações web escaláveis usando React, Node.js e TypeScript.',
        experiences: [
          {
            company: 'Tech Solutions',
            role: 'Engenheiro de Software Sênior',
            startDate: 'Jan/2022',
            endDate: 'Presente',
            isCurrent: true,
            description: 'Liderei a migração de um sistema legado para Next.js 14, melhorando a performance de carregamento e otimizando SEO.'
          }
        ],
        education: [
          {
            institution: 'Universidade de São Paulo',
            degree: 'Bacharelado',
            field: 'Ciência da Computação',
            startDate: '2016',
            endDate: '2020'
          }
        ],
        certifications: [],
        hardSkills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL'],
        softSkills: ['Liderança Técnica', 'Trabalho em Equipe'],
        languages: []
      }
    }

    const response = await this.callOpenAI(EXTRACTION_USER_PROMPT(text), EXTRACTION_SYSTEM_PROMPT)
    return this.parseJSON<ResumeParsedData>(response)
  }

  async generateScores(resumeText: string, parsedData: ResumeParsedData): Promise<AnalysisScores> {
    if (this.isMockMode) {
      return {
        overall: { value: 82, justification: 'O currículo possui excelente apresentação técnica e foco em stacks modernas.' },
        ats: { value: 90, justification: 'Boa estrutura em coluna única e seções lógicas fáceis de rastrear.' },
        recruiter: { value: 85, justification: 'Apresentação direta e profissional, com resumo executivo bem estruturado.' },
        impact: { value: 65, justification: 'Faltam métricas de negócio nas realizações descritas.' },
        clarity: { value: 92, justification: 'Linguagem fluida e parágrafos curtos.' },
        formatting: { value: 88, justification: 'Consistente, limpo e bem formatado.' },
        keyword: { value: 80, justification: 'Boa presença de termos chave da stack de desenvolvimento.' },
        professionalism: { value: 95, justification: 'Tom corporativo adequado.' },
        leadership: { value: 70, justification: 'Evidência clara de liderança técnica.' },
        technical: { value: 88, justification: 'Descrição profunda e clara de hard skills relevantes.' }
      }
    }

    const response = await this.callOpenAI(SCORING_USER_PROMPT(resumeText, parsedData), SCORING_SYSTEM_PROMPT)
    return this.parseJSON<AnalysisScores>(response)
  }

  async generateInsights(resumeText: string, parsedData: ResumeParsedData): Promise<Insight[]> {
    if (this.isMockMode) {
      return [
        {
          type: 'STRENGTH',
          problem: 'Perfil de Competências Fortes',
          explanation: 'O currículo lista hard skills altamente demandadas no mercado atual.',
          impact: 'Aumenta consideravelmente as chances de ser selecionado para entrevistas.',
          howToFix: 'Mantenha as habilidades agrupadas de forma clara.',
          improvementExample: null
        }
      ]
    }

    const response = await this.callOpenAI(INSIGHTS_USER_PROMPT(resumeText, parsedData), INSIGHTS_SYSTEM_PROMPT)
    const data = this.parseJSON<{ insights: Insight[] } | Insight[]>(response)
    return Array.isArray(data) ? data : data.insights
  }

  async analyzeATS(resumeText: string): Promise<ATSAnalysis> {
    if (this.isMockMode) {
      return {
        score: 88,
        isReadable: true,
        keywordCount: 18,
        sectionOrder: 'Cronológico Tradicional',
        hasTables: false,
        hasImages: false,
        hasColumns: false,
        isPDFCompatible: true,
        issues: [],
        recommendations: ['Mantenha os títulos das seções tradicionais.']
      }
    }

    const response = await this.callOpenAI(ATS_USER_PROMPT(resumeText), ATS_SYSTEM_PROMPT)
    return this.parseJSON<ATSAnalysis>(response)
  }

  async generateSTARRewrites(resumeText: string, parsedData: ResumeParsedData): Promise<STARRewrite[]> {
    if (this.isMockMode) {
      return [
        {
          original: 'Liderei a migração de um sistema legado para Next.js 14.',
          situation: 'O sistema legado em React sofria com lentidão no carregamento inicial.',
          task: 'Liderar a modernização tecnológica para Next.js 14.',
          action: 'Migrei a aplicação utilizando Server Components do Next.js.',
          result: 'Redução de 40% no First Contentful Paint (FCP).'
        }
      ]
    }

    const response = await this.callOpenAI(STAR_USER_PROMPT(parsedData), STAR_SYSTEM_PROMPT)
    const data = this.parseJSON<{ rewrites: STARRewrite[] } | STARRewrite[]>(response)
    return Array.isArray(data) ? data : data.rewrites
  }

  async generateXYZRewrites(resumeText: string, parsedData: ResumeParsedData): Promise<XYZRewrite[]> {
    if (this.isMockMode) {
      return [
        {
          original: 'Liderei a migração de um sistema legado para Next.js 14.',
          rewritten: 'Reduzi o tempo de carregamento inicial em 40% migrando o portal legado da empresa para Next.js 14.',
          hasRealMetrics: false,
          note: 'Métrica de performance sugerida.'
        }
      ]
    }

    const response = await this.callOpenAI(XYZ_USER_PROMPT(parsedData), XYZ_SYSTEM_PROMPT)
    const data = this.parseJSON<{ rewrites: XYZRewrite[] } | XYZRewrite[]>(response)
    return Array.isArray(data) ? data : data.rewrites
  }

  async generateImprovements(resumeText: string, parsedData: ResumeParsedData): Promise<Improvements> {
    if (this.isMockMode) {
      return {
        professionalTitle: 'Engenheiro de Software Sênior',
        professionalSummary: 'Engenheiro de Software Sênior com mais de 6 anos de experiência focado em soluções Web eficientes e escaláveis.',
        linkedinHeadline: 'Senior Software Engineer | Tech Lead',
        gupySummary: 'Engenheiro de Software especialista em Javascript, TypeScript, React.js, Next.js, Node.js.',
        indeedSummary: 'Engenheiro de Software Sênior com sólida trajetória em stack web moderna.',
        cathoSummary: 'Engenheiro de Software Sênior experiente em React, Node.js e TypeScript.',
        internationalSummary: 'Senior Software Engineer specializing in modern JavaScript stack.',
        atsFriendlyVersion: 'DOUGLAS SILVA\nSão Paulo, SP | (11) 98765-4321 | douglas.silva@email.com',
        modernVersion: 'Douglas Silva\nSenior Software Engineer',
        executiveVersion: 'Douglas Silva\nTechnology Leader & Senior Engineer',
        internationalVersion: 'DOUGLAS SILVA\nSenior Software Engineer'
      }
    }

    const response = await this.callOpenAI(IMPROVEMENTS_USER_PROMPT(parsedData), IMPROVEMENTS_SYSTEM_PROMPT)
    return this.parseJSON<Improvements>(response)
  }

  async matchJobDescription(resumeText: string, jobDescription: string): Promise<Omit<JobMatch, 'id' | 'analysisId' | 'createdAt'>> {
    if (this.isMockMode) {
      return {
        matchScore: 82,
        missingKeywords: ['CI/CD', 'GraphQL'],
        missingCompetencies: ['Testes de Integração'],
        suggestions: [
          {
            section: 'Habilidades',
            suggestion: 'Adicione ferramentas de CI/CD.',
            reason: 'Destaque diferencial citado na vaga.'
          }
        ]
      }
    }

    const prompt = `Match de vaga em JSON: { matchScore, missingKeywords: [], missingCompetencies: [], suggestions: [{ section, suggestion, reason }] }
    
    Currículo: ${resumeText}
    Vaga: ${jobDescription}`

    const response = await this.callOpenAI(prompt)
    return this.parseJSON<Omit<JobMatch, 'id' | 'analysisId' | 'createdAt'>>(response)
  }
}
