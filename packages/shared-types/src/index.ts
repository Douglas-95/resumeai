import { z } from 'zod'

// ─── Enums ──────────────────────────────────────────────────────────────────

export const ResumeStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'DONE',
  'PARTIAL_ERROR',
  'ERROR',
])
export type ResumeStatus = z.infer<typeof ResumeStatusSchema>

export const FileTypeSchema = z.enum(['PDF', 'DOCX'])
export type FileType = z.infer<typeof FileTypeSchema>

export const AIProviderSchema = z.enum(['claude', 'openai'])
export type AIProvider = z.infer<typeof AIProviderSchema>

// ─── Resume Parsed Data ──────────────────────────────────────────────────────

export const ResumeParsedDataSchema = z.object({
  name: z.string().nullable(),
  currentRole: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  linkedin: z.string().url().nullable(),
  github: z.string().url().nullable(),
  portfolio: z.string().url().nullable(),
  summary: z.string().nullable(),
  experiences: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
      isCurrent: z.boolean(),
      description: z.string(),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string().nullable(),
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
    }),
  ),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string().nullable(),
      date: z.string().nullable(),
    }),
  ),
  hardSkills: z.array(z.string()),
  softSkills: z.array(z.string()),
  languages: z.array(
    z.object({
      language: z.string(),
      level: z.string().nullable(),
    }),
  ),
})
export type ResumeParsedData = z.infer<typeof ResumeParsedDataSchema>

// ─── Scores ──────────────────────────────────────────────────────────────────

export const ScoreItemSchema = z.object({
  value: z.number().min(0).max(100),
  justification: z.string(),
})
export type ScoreItem = z.infer<typeof ScoreItemSchema>

export const AnalysisScoresSchema = z.object({
  overall: ScoreItemSchema,
  ats: ScoreItemSchema,
  recruiter: ScoreItemSchema,
  impact: ScoreItemSchema,
  clarity: ScoreItemSchema,
  formatting: ScoreItemSchema,
  keyword: ScoreItemSchema,
  professionalism: ScoreItemSchema,
  leadership: ScoreItemSchema,
  technical: ScoreItemSchema,
})
export type AnalysisScores = z.infer<typeof AnalysisScoresSchema>

// ─── Insights ────────────────────────────────────────────────────────────────

export const InsightTypeSchema = z.enum([
  'STRENGTH',
  'WEAKNESS',
  'MISSING_INFO',
  'REDUNDANT_INFO',
  'LONG_PARAGRAPH',
  'POOR_EXPERIENCE_DESC',
  'EXCESSIVE_TEXT',
  'LACK_OBJECTIVITY',
  'FEW_ACTION_VERBS',
  'FEW_METRICS',
  'ATS_UNFRIENDLY',
  'GENERIC_WORDS',
  'OUTDATED_INFO',
])
export type InsightType = z.infer<typeof InsightTypeSchema>

export const InsightSchema = z.object({
  type: InsightTypeSchema,
  problem: z.string(),
  explanation: z.string(),
  impact: z.string(),
  howToFix: z.string(),
  improvementExample: z.string().nullable(),
})
export type Insight = z.infer<typeof InsightSchema>

// ─── ATS Analysis ────────────────────────────────────────────────────────────

export const ATSAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  isReadable: z.boolean(),
  keywordCount: z.number(),
  sectionOrder: z.string(),
  hasTables: z.boolean(),
  hasImages: z.boolean(),
  hasColumns: z.boolean(),
  isPDFCompatible: z.boolean(),
  issues: z.array(z.string()),
  recommendations: z.array(z.string()),
})
export type ATSAnalysis = z.infer<typeof ATSAnalysisSchema>

// ─── STAR / XYZ ──────────────────────────────────────────────────────────────

export const STARRewriteSchema = z.object({
  original: z.string(),
  situation: z.string(),
  task: z.string(),
  action: z.string(),
  result: z.string(),
})
export type STARRewrite = z.infer<typeof STARRewriteSchema>

export const XYZRewriteSchema = z.object({
  original: z.string(),
  rewritten: z.string(),
  hasRealMetrics: z.boolean(),
  note: z.string().nullable(),
})
export type XYZRewrite = z.infer<typeof XYZRewriteSchema>

// ─── Improvements ────────────────────────────────────────────────────────────

export const ImprovementsSchema = z.object({
  professionalTitle: z.string().nullable(),
  professionalSummary: z.string().nullable(),
  linkedinHeadline: z.string().nullable(),
  gupySummary: z.string().nullable(),
  indeedSummary: z.string().nullable(),
  cathoSummary: z.string().nullable(),
  internationalSummary: z.string().nullable(),
  atsFriendlyVersion: z.string().nullable(),
  modernVersion: z.string().nullable(),
  executiveVersion: z.string().nullable(),
  internationalVersion: z.string().nullable(),
})
export type Improvements = z.infer<typeof ImprovementsSchema>

// ─── Full Analysis ────────────────────────────────────────────────────────────

export const AnalysisSchema = z.object({
  id: z.string().uuid(),
  resumeId: z.string().uuid(),
  userId: z.string().uuid(),
  status: ResumeStatusSchema,
  scores: AnalysisScoresSchema.nullable(),
  insights: z.array(InsightSchema).nullable(),
  atsAnalysis: ATSAnalysisSchema.nullable(),
  starRewrites: z.array(STARRewriteSchema).nullable(),
  xyzRewrites: z.array(XYZRewriteSchema).nullable(),
  improvements: ImprovementsSchema.nullable(),
  errors: z
    .record(
      z.string(),
      z.object({
        message: z.string(),
        retryable: z.boolean(),
      }),
    )
    .nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Analysis = z.infer<typeof AnalysisSchema>

// ─── Job Match ────────────────────────────────────────────────────────────────

export const JobMatchSchema = z.object({
  id: z.string().uuid(),
  analysisId: z.string().uuid(),
  jobDescription: z.string(),
  matchScore: z.number().min(0).max(100),
  missingKeywords: z.array(z.string()),
  missingCompetencies: z.array(z.string()),
  suggestions: z.array(
    z.object({
      section: z.string(),
      suggestion: z.string(),
      reason: z.string(),
    }),
  ),
  createdAt: z.string().datetime(),
})
export type JobMatch = z.infer<typeof JobMatchSchema>

// ─── API Response Wrappers ───────────────────────────────────────────────────

export const ApiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  })

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().nullable(),
  }),
})

export type ApiError = z.infer<typeof ApiErrorSchema>
