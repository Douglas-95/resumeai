import { randomUUID } from 'crypto'
import { ResumeStatus, FileType, ResumeParsedData } from '@resumeai/shared-types'

export interface ResumeProps {
  id?: string
  userId: string
  fileName: string
  fileUrl: string
  fileType: FileType
  extractedText?: string | null
  parsedData?: ResumeParsedData | null
  status?: ResumeStatus
  createdAt?: Date
  updatedAt?: Date
}

export class Resume {
  readonly id: string
  readonly userId: string
  readonly fileName: string
  readonly fileUrl: string
  readonly fileType: FileType
  extractedText: string | null
  parsedData: ResumeParsedData | null
  status: ResumeStatus
  readonly createdAt: Date
  updatedAt: Date

  private constructor(props: ResumeProps) {
    this.id = props.id ?? randomUUID()
    this.userId = props.userId
    this.fileName = props.fileName
    this.fileUrl = props.fileUrl
    this.fileType = props.fileType
    this.extractedText = props.extractedText ?? null
    this.parsedData = props.parsedData ?? null
    this.status = props.status ?? 'PENDING'
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  static create(props: ResumeProps): Resume {
    if (!props.userId) throw new Error('Resume must have a userId')
    if (!props.fileName) throw new Error('Resume must have a fileName')
    if (!props.fileUrl) throw new Error('Resume must have a fileUrl')
    return new Resume(props)
  }

  static reconstitute(props: Required<ResumeProps>): Resume {
    return new Resume(props)
  }

  markAsProcessing(): void {
    this.status = 'PROCESSING'
    this.updatedAt = new Date()
  }

  markAsDone(): void {
    this.status = 'DONE'
    this.updatedAt = new Date()
  }

  markAsPartialError(): void {
    this.status = 'PARTIAL_ERROR'
    this.updatedAt = new Date()
  }

  markAsError(): void {
    this.status = 'ERROR'
    this.updatedAt = new Date()
  }

  setExtractedText(text: string): void {
    this.extractedText = text
    this.updatedAt = new Date()
  }

  setParsedData(data: ResumeParsedData): void {
    this.parsedData = data
    this.updatedAt = new Date()
  }
}
