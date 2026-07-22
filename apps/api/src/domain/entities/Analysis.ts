import { randomUUID } from 'crypto'
import {
  ResumeStatus,
  AnalysisScores,
  Insight,
  ATSAnalysis,
  STARRewrite,
  XYZRewrite,
  Improvements,
} from '@resumeai/shared-types'

interface AnalysisErrorRecord {
  message: string
  retryable: boolean
}

export interface AnalysisProps {
  id?: string
  resumeId: string
  userId: string
  status?: ResumeStatus
  scores?: AnalysisScores | null
  insights?: Insight[] | null
  atsAnalysis?: ATSAnalysis | null
  starRewrites?: STARRewrite[] | null
  xyzRewrites?: XYZRewrite[] | null
  improvements?: Improvements | null
  errors?: Record<string, AnalysisErrorRecord> | null
  createdAt?: Date
  updatedAt?: Date
}

export class Analysis {
  readonly id: string
  readonly resumeId: string
  readonly userId: string
  status: ResumeStatus
  scores: AnalysisScores | null
  insights: Insight[] | null
  atsAnalysis: ATSAnalysis | null
  starRewrites: STARRewrite[] | null
  xyzRewrites: XYZRewrite[] | null
  improvements: Improvements | null
  errors: Record<string, AnalysisErrorRecord> | null
  readonly createdAt: Date
  updatedAt: Date

  private constructor(props: AnalysisProps) {
    this.id = props.id ?? randomUUID()
    this.resumeId = props.resumeId
    this.userId = props.userId
    this.status = props.status ?? 'PENDING'
    this.scores = props.scores ?? null
    this.insights = props.insights ?? null
    this.atsAnalysis = props.atsAnalysis ?? null
    this.starRewrites = props.starRewrites ?? null
    this.xyzRewrites = props.xyzRewrites ?? null
    this.improvements = props.improvements ?? null
    this.errors = props.errors ?? null
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  static create(props: AnalysisProps): Analysis {
    if (!props.resumeId) throw new Error('Analysis must have a resumeId')
    if (!props.userId) throw new Error('Analysis must have a userId')
    return new Analysis(props)
  }

  static reconstitute(props: Required<AnalysisProps>): Analysis {
    return new Analysis(props)
  }

  /**
   * Records a section-level error without failing the entire analysis.
   * This enables graceful degradation: other sections remain valid.
   */
  recordSectionError(section: string, message: string, retryable = true): void {
    this.errors = {
      ...(this.errors ?? {}),
      [section]: { message, retryable },
    }
    this.updatedAt = new Date()
  }

  /**
   * Determines final status based on what completed.
   * If some sections failed → PARTIAL_ERROR. If none completed → ERROR.
   */
  computeFinalStatus(): void {
    const hasAnyResult =
      this.scores !== null ||
      this.insights !== null ||
      this.atsAnalysis !== null ||
      this.starRewrites !== null ||
      this.xyzRewrites !== null ||
      this.improvements !== null

    const hasErrors = this.errors !== null && Object.keys(this.errors).length > 0

    if (!hasAnyResult && hasErrors) {
      this.status = 'ERROR'
    } else if (hasErrors) {
      this.status = 'PARTIAL_ERROR'
    } else {
      this.status = 'DONE'
    }
    this.updatedAt = new Date()
  }
}
