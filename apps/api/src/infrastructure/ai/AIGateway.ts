import { injectable, inject } from 'tsyringe'
import { IAIPort } from '../../../application/ports/IAIPort.js'
import {
  ResumeParsedData,
  AnalysisScores,
  Insight,
  ATSAnalysis,
  STARRewrite,
  XYZRewrite,
  Improvements,
  JobMatch,
} from '@resumeai/shared-types'

/**
 * AIGateway delegates all calls to the concrete adapter
 * selected at runtime via the AI_PROVIDER environment variable.
 *
 * Use cases only depend on IAIPort — they never instantiate adapters directly.
 */
@injectable()
export class AIGateway implements IAIPort {
  constructor(
    // Injected by the DI container based on env.AI_PROVIDER
    @inject('ConcreteAIAdapter') private readonly adapter: IAIPort,
  ) {}

  extractResumeData(text: string): Promise<ResumeParsedData> {
    return this.adapter.extractResumeData(text)
  }

  generateScores(resumeText: string, parsedData: ResumeParsedData): Promise<AnalysisScores> {
    return this.adapter.generateScores(resumeText, parsedData)
  }

  generateInsights(resumeText: string, parsedData: ResumeParsedData): Promise<Insight[]> {
    return this.adapter.generateInsights(resumeText, parsedData)
  }

  analyzeATS(resumeText: string): Promise<ATSAnalysis> {
    return this.adapter.analyzeATS(resumeText)
  }

  generateSTARRewrites(
    resumeText: string,
    parsedData: ResumeParsedData,
  ): Promise<STARRewrite[]> {
    return this.adapter.generateSTARRewrites(resumeText, parsedData)
  }

  generateXYZRewrites(
    resumeText: string,
    parsedData: ResumeParsedData,
  ): Promise<XYZRewrite[]> {
    return this.adapter.generateXYZRewrites(resumeText, parsedData)
  }

  generateImprovements(
    resumeText: string,
    parsedData: ResumeParsedData,
  ): Promise<Improvements> {
    return this.adapter.generateImprovements(resumeText, parsedData)
  }

  matchJobDescription(
    resumeText: string,
    jobDescription: string,
  ): Promise<Omit<JobMatch, 'id' | 'analysisId' | 'createdAt'>> {
    return this.adapter.matchJobDescription(resumeText, jobDescription)
  }
}
