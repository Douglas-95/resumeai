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
  private isMockMode: boolean = false

  constructor() {
    const apiKey = env.ANTHROPIC_API_KEY
    if (apiKey && !apiKey.includes('your-') && !apiKey.includes('sk-ant-...')) {
      this.client = new Anthropic({ apiKey })
    } else {
      this.isMockMode = true
      logger.warn('⚠️ ANTHROPIC_API_KEY ausente ou invalida. Executando Claude em modo MOCK.')
    }
  }

  private async callClaude(prompt: string, systemPrompt?: string): Promise<string> {
    if (this.isMockMode) {
      throw new Error('Chave de API nao configurada')
    }

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
    if (this.isMockMode) {
      return {
        name: 'Douglas Silva',
        currentRole: 'Engenheiro de Software Sênior',
        email: 'douglas.silva@email.com',
        phone: '(11) 98765-4321',
        location: 'São Paulo - SP',
        linkedin: 'https://linkedin.com/in/douglas-silva',
        github: 'https://github.com/douglas-silva',
        portfolio: 'https://douglassilva.dev',
        summary: 'Engenheiro de Software com mais de 6 anos de experiência desenvolvendo aplicações web escaláveis usando React, Node.js e TypeScript. Focado em boas práticas, testes e arquitetura limpa.',
        experiences: [
          {
            company: 'Tech Solutions',
            role: 'Engenheiro de Software Sênior',
            startDate: 'Jan/2022',
            endDate: 'Presente',
            isCurrent: true,
            description: 'Liderei a migração de um sistema legado para Next.js 14, melhorando a performance de carregamento e otimizando SEO. Fui responsável pela definição da arquitetura do projeto e mentoria de desenvolvedores juniores.'
          },
          {
            company: 'Code Creators',
            role: 'Desenvolvedor Full Stack',
            startDate: 'Mar/2020',
            endDate: 'Dez/2021',
            isCurrent: false,
            description: 'Trabalhei no desenvolvimento de APIs REST e integrações usando Node.js, Express e PostgreSQL. Desenvolvi telas responsivas com React e Tailwind CSS.'
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
        certifications: [
          {
            name: 'AWS Certified Cloud Practitioner',
            issuer: 'Amazon Web Services',
            date: '2023'
          }
        ],
        hardSkills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS'],
        softSkills: ['Liderança Técnica', 'Trabalho em Equipe', 'Resolução de Problemas', 'Comunicação Clara'],
        languages: [
          {
            language: 'Português',
            level: 'Nativo'
          },
          {
            language: 'Inglês',
            level: 'Avançado'
          }
        ]
      }
    }

    try {
      const response = await this.callClaude(EXTRACTION_USER_PROMPT(text), EXTRACTION_SYSTEM_PROMPT)
      return this.parseJSON<ResumeParsedData>(response)
    } catch (err) {
      logger.error({ err }, 'Erro no ClaudeAIAdapter.extractResumeData')
      throw err
    }
  }

  async generateScores(resumeText: string, parsedData: ResumeParsedData): Promise<AnalysisScores> {
    if (this.isMockMode) {
      return {
        overall: { value: 82, justification: 'O currículo possui excelente apresentação técnica e foco em stacks modernas, mas peca um pouco pela ausência de mais métricas de impacto nas experiências.' },
        ats: { value: 90, justification: 'Boa estrutura em coluna única e seções lógicas fáceis de rastrear. Sem elementos gráficos que impeçam a leitura.' },
        recruiter: { value: 85, justification: 'Apresentação direta e profissional, com resumo executivo bem estruturado.' },
        impact: { value: 65, justification: 'Faltam métricas de negócio e resultados percentuais nas realizações descritas.' },
        clarity: { value: 92, justification: 'Linguagem fluida, ortografia correta e parágrafos curtos bem definidos.' },
        formatting: { value: 88, justification: 'Consistente, limpo e com bom uso de espaços em branco.' },
        keyword: { value: 80, justification: 'Boa presença de termos chave da stack de desenvolvimento Javascript/TypeScript.' },
        professionalism: { value: 95, justification: 'Tom corporativo adequado e ausência de clichês.' },
        leadership: { value: 70, justification: 'Evidência clara de liderança técnica e mentoria de desenvolvedores.' },
        technical: { value: 88, justification: 'Descrição profunda e clara de hard skills relevantes para a área.' }
      }
    }

    const response = await this.callClaude(SCORING_USER_PROMPT(resumeText, parsedData), SCORING_SYSTEM_PROMPT)
    return this.parseJSON<AnalysisScores>(response)
  }

  async generateInsights(resumeText: string, parsedData: ResumeParsedData): Promise<Insight[]> {
    if (this.isMockMode) {
      return [
        {
          type: 'STRENGTH',
          problem: 'Perfil de Competências Fortes',
          explanation: 'O currículo lista hard skills altamente demandadas no mercado atual de desenvolvimento Web.',
          impact: 'Aumenta consideravelmente as chances de ser pré-selecionado para entrevistas técnicas.',
          howToFix: 'Mantenha as habilidades agrupadas de forma clara e visível nas primeiras seções.',
          improvementExample: null
        },
        {
          type: 'FEW_METRICS',
          problem: 'Ausência de Resultados Mensuráveis',
          explanation: 'As realizações nas experiências não possuem números, porcentagens ou métricas de impacto no negócio.',
          impact: 'Dificulta a percepção do tamanho e valor real das suas contribuições por recrutadores seniores.',
          howToFix: 'Substitua descrições passivas de tarefas por frases orientadas a metas alcançadas (Ex: reduzi custo, aumentei velocidade).',
          improvementExample: 'Antes: "Responsável pela migração de sistema legado."\nDepois: "Reduzi o tempo de carregamento da página principal em 35% ao migrar o sistema legado para Next.js 14."'
        },
        {
          type: 'GENERIC_WORDS',
          problem: 'Uso de Clichês e Palavras Comuns',
          explanation: 'Uso excessivo de termos comuns como "fui responsável por" ou "ajudei no desenvolvimento".',
          impact: 'Torna as descrições genéricas e reduz o tom de protagonismo da sua atuação.',
          howToFix: 'Substitua termos passivos por verbos de ação expressivos no início de cada descrição (Ex: Implementei, Liderei, Arquitetou).',
          improvementExample: 'Antes: "Responsável pelo desenvolvimento de APIs REST."\nDepois: "Liderei o desenho e implementação de 12 APIs REST escaláveis para sistemas de alta concorrência."'
        }
      ]
    }

    const response = await this.callClaude(INSIGHTS_USER_PROMPT(resumeText, parsedData), INSIGHTS_SYSTEM_PROMPT)
    const data = this.parseJSON<{ insights: Insight[] } | Insight[]>(response)
    return Array.isArray(data) ? data : data.insights
  }

  async analyzeATS(resumeText: string): Promise<ATSAnalysis> {
    if (this.isMockMode) {
      return {
        score: 88,
        isReadable: true,
        keywordCount: 18,
        sectionOrder: 'Cronológico Tradicional (Cabeçalho, Resumo, Experiência, Educação, Habilidades)',
        hasTables: false,
        hasImages: false,
        hasColumns: false,
        isPDFCompatible: true,
        issues: [],
        recommendations: [
          'Garanta que os títulos das seções usem nomenclaturas comuns (ex: "Experiência Profissional" em vez de "Minha Jornada").'
        ]
      }
    }

    const response = await this.callClaude(ATS_USER_PROMPT(resumeText), ATS_SYSTEM_PROMPT)
    return this.parseJSON<ATSAnalysis>(response)
  }

  async generateSTARRewrites(resumeText: string, parsedData: ResumeParsedData): Promise<STARRewrite[]> {
    if (this.isMockMode) {
      return [
        {
          original: 'Liderei a migração de um sistema legado para Next.js 14, melhorando a performance de carregamento.',
          situation: 'O sistema legado em React sofria com lentidão no carregamento inicial e prejudicava o SEO da plataforma.',
          task: 'Liderar a modernização tecnológica para Next.js 14 e melhorar a performance geral das páginas.',
          action: 'Migrei a aplicação utilizando Server Components do Next.js e configurei cache granular de requests.',
          result: 'Redução de 40% no First Contentful Paint (FCP) e um aumento de 15% na taxa de conversão orgânica.'
        }
      ]
    }

    const response = await this.callClaude(STAR_USER_PROMPT(parsedData), STAR_SYSTEM_PROMPT)
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
          note: 'Métrica de performance sugerida. Adapte o valor de 40% para a métrica real do seu projeto.'
        },
        {
          original: 'Trabalhei no desenvolvimento de APIs REST e integrações usando Node.js.',
          rewritten: 'Aumentei a velocidade de resposta de 4 microsserviços em 20% refatorando e indexando consultas no PostgreSQL.',
          hasRealMetrics: false,
          note: 'Métrica de otimização de banco sugerida.'
        }
      ]
    }

    const response = await this.callClaude(XYZ_USER_PROMPT(parsedData), XYZ_SYSTEM_PROMPT)
    const data = this.parseJSON<{ rewrites: XYZRewrite[] } | XYZRewrite[]>(response)
    return Array.isArray(data) ? data : data.rewrites
  }

  async generateImprovements(resumeText: string, parsedData: ResumeParsedData): Promise<Improvements> {
    if (this.isMockMode) {
      return {
        professionalTitle: 'Engenheiro de Software Sênior | Frontend Specialist | Tech Lead',
        professionalSummary: 'Engenheiro de Software Sênior com mais de 6 anos de experiência focado em soluções Web eficientes e escaláveis. Especialista em TypeScript, React, Next.js e Node.js. Liderança técnica com histórico comprovado de otimização de performance de aplicações e mentoria de times ágeis.',
        linkedinHeadline: 'Senior Software Engineer | Tech Lead | Next.js & Node.js Specialist | Cloud Systems',
        gupySummary: 'Engenheiro de Software especialista em Javascript, TypeScript, React.js, Next.js, Node.js, SQL, PostgreSQL, Docker, AWS Certified Cloud Practitioner. Liderança técnica e desenvolvimento de arquiteturas modernas.',
        indeedSummary: 'Engenheiro de Software Sênior com sólida trajetória em stack web moderna. Ampla vivência no desenvolvimento de APIs de alta performance e aplicações frontend otimizadas para SEO.',
        cathoSummary: 'Engenheiro de Software Sênior experiente em React, Node.js e TypeScript. Definição de arquitetura técnica e integração contínua.',
        internationalSummary: 'Senior Software Engineer specializing in modern JavaScript stack (Next.js, TypeScript, Node.js). Experienced in system migrations, front-end optimization, and engineering leadership.',
        atsFriendlyVersion: 'DOUGLAS SILVA\nSão Paulo, SP | (11) 98765-4321 | douglas.silva@email.com\n\nRESUMO PROFISSIONAL\nSenior Software Engineer with 6+ years experience in TypeScript, React, Next.js and Node.js.\n\nEXPERIÊNCIA PROFISSIONAL\nTech Solutions - Engenheiro de Software Sênior (Jan/2022 - Presente)\n- Led system migration to Next.js 14, improving load speeds by 40%.\n- Mentored junior engineers and defined front-end architecture.',
        modernVersion: 'Douglas Silva\nSenior Software Engineer\n\nExperience:\n- Tech Solutions: Led migration of monolithic app to Next.js, achieving 40% FCP improvement.\n- Code Creators: Engineered REST APIs using Node.js/PostgreSQL.',
        executiveVersion: 'Douglas Silva\nTechnology Leader & Senior Engineer\n\nExecutive profile with deep expertise in leading digital product modernizations, cloud migrations, and front-end optimization.',
        internationalVersion: 'DOUGLAS SILVA\nSenior Software Engineer\n\nSummary:\nTech Lead and Senior Developer with over 6 years of expertise building highly scalable web systems.'
      }
    }

    const response = await this.callClaude(IMPROVEMENTS_USER_PROMPT(parsedData), IMPROVEMENTS_SYSTEM_PROMPT)
    return this.parseJSON<Improvements>(response)
  }

  async matchJobDescription(resumeText: string, jobDescription: string): Promise<Omit<JobMatch, 'id' | 'analysisId' | 'createdAt'>> {
    if (this.isMockMode) {
      return {
        matchScore: 82,
        missingKeywords: ['CI/CD', 'GraphQL', 'Kubernetes'],
        missingCompetencies: ['Testes de Integração', 'Arquitetura de Microsserviços'],
        suggestions: [
          {
            section: 'Habilidades',
            suggestion: 'Adicione ferramentas de CI/CD (como GitHub Actions) e Kubernetes caso possua vivência.',
            reason: 'A descrição da vaga cita CI/CD e infraestrutura como diferenciais importantes.'
          }
        ]
      }
    }

    const prompt = `Compare o currículo com a descrição da vaga e calcule o matchScore (0-100), missingKeywords, missingCompetencies, e suggestions: [{ section, suggestion, reason }].
    Retorne JSON.

    Currículo: ${resumeText}
    Vaga: ${jobDescription}`

    const response = await this.callClaude(prompt)
    return this.parseJSON<Omit<JobMatch, 'id' | 'analysisId' | 'createdAt'>>(response)
  }
}
