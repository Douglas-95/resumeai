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

export interface IAIPort {
  /** Extract structured data from raw resume text */
  extractResumeData(text: string): Promise<ResumeParsedData>

  /** Generate all 10 scores with justifications */
  generateScores(resumeText: string, parsedData: ResumeParsedData): Promise<AnalysisScores>

  /** Generate insights (strengths, weaknesses, issues) */
  generateInsights(resumeText: string, parsedData: ResumeParsedData): Promise<Insight[]>

  /** Run ATS compatibility analysis */
  analyzeATS(resumeText: string): Promise<ATSAnalysis>

  /** Rewrite experiences using STAR method */
  generateSTARRewrites(resumeText: string, parsedData: ResumeParsedData): Promise<STARRewrite[]>

  /** Rewrite experiences using XYZ (Google) method */
  generateXYZRewrites(resumeText: string, parsedData: ResumeParsedData): Promise<XYZRewrite[]>

  /** Generate improvement suggestions (headline, summary, versions) */
  generateImprovements(
    resumeText: string,
    parsedData: ResumeParsedData,
  ): Promise<Improvements>

  /** Calculate match score between resume and a job description */
  matchJobDescription(
    resumeText: string,
    jobDescription: string,
  ): Promise<Omit<JobMatch, 'id' | 'analysisId' | 'createdAt'>>
}
