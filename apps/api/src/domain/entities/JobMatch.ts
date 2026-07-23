import { randomUUID } from 'crypto'

export interface JobMatchProps {
  id?: string
  analysisId: string
  jobDescription: string
  matchScore: number
  missingKeywords: string[]
  missingCompetencies: string[]
  suggestions: Array<{
    section: string
    suggestion: string
    reason: string
  }>
  createdAt?: Date
}

export class JobMatch {
  readonly id: string
  readonly analysisId: string
  readonly jobDescription: string
  readonly matchScore: number
  readonly missingKeywords: string[]
  readonly missingCompetencies: string[]
  readonly suggestions: Array<{
    section: string
    suggestion: string
    reason: string
  }>
  readonly createdAt: Date

  private constructor(props: JobMatchProps) {
    this.id = props.id ?? randomUUID()
    this.analysisId = props.analysisId
    this.jobDescription = props.jobDescription
    this.matchScore = props.matchScore
    this.missingKeywords = props.missingKeywords
    this.missingCompetencies = props.missingCompetencies
    this.suggestions = props.suggestions
    this.createdAt = props.createdAt ?? new Date()
  }

  static create(props: JobMatchProps): JobMatch {
    if (!props.analysisId) throw new Error('JobMatch must have an analysisId')
    if (!props.jobDescription) throw new Error('JobMatch must have a jobDescription')
    return new JobMatch(props)
  }
}
