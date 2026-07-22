import { injectable, inject } from 'tsyringe'
import { IResumeRepository } from '../../domain/repositories/IResumeRepository.js'
import { IAnalysisRepository } from '../../domain/repositories/IAnalysisRepository.js'
import { IAIPort } from '../ports/IAIPort.js'
import { logger } from '../../infrastructure/logger/logger.js'

export interface AnalyzeResumeInput {
  resumeId: string
  analysisId: string
  userId: string
}

@injectable()
export class AnalyzeResumeUseCase {
  constructor(
    @inject('IResumeRepository') private readonly resumeRepository: IResumeRepository,
    @inject('IAnalysisRepository') private readonly analysisRepository: IAnalysisRepository,
    @inject('IAIPort') private readonly ai: IAIPort,
  ) {}

  /**
   * Runs the full AI analysis pipeline.
   *
   * RESILIENCE RULES:
   * - Each AI step is wrapped in try/catch independently.
   * - A failure in one step does NOT cancel the others.
   * - The analysis entity records per-section errors.
   * - computeFinalStatus() derives DONE | PARTIAL_ERROR | ERROR.
   */
  async execute(input: AnalyzeResumeInput): Promise<void> {
    const resume = await this.resumeRepository.findById(input.resumeId)
    if (!resume) throw new Error(`Resume not found: ${input.resumeId}`)

    const analysis = await this.analysisRepository.findById(input.analysisId)
    if (!analysis) throw new Error(`Analysis not found: ${input.analysisId}`)

    // Mark as processing
    resume.markAsProcessing()
    analysis.status = 'PROCESSING'
    await this.resumeRepository.update(resume)
    await this.analysisRepository.update(analysis)

    const rawText = resume.extractedText ?? ''

    // ── Step 1: Extract structured data (required — no try/catch) ────────────
    // This step is fundamental. If it fails, the whole analysis fails.
    let parsedData = resume.parsedData
    if (!parsedData) {
      parsedData = await this.ai.extractResumeData(rawText)
      resume.setParsedData(parsedData)
      await this.resumeRepository.update(resume)
    }

    // ── Step 2: Scores ────────────────────────────────────────────────────────
    try {
      const scores = await this.ai.generateScores(rawText, parsedData)
      analysis.scores = scores
    } catch (err) {
      logger.warn({ err, section: 'scores' }, 'AI scoring failed — continuing without scores')
      analysis.recordSectionError('scores', this.toErrorMessage(err))
    }
    await this.analysisRepository.update(analysis)

    // ── Step 3: Insights ──────────────────────────────────────────────────────
    try {
      const insights = await this.ai.generateInsights(rawText, parsedData)
      analysis.insights = insights
    } catch (err) {
      logger.warn({ err, section: 'insights' }, 'AI insights failed — continuing')
      analysis.recordSectionError('insights', this.toErrorMessage(err))
    }
    await this.analysisRepository.update(analysis)

    // ── Step 4: ATS Analysis ──────────────────────────────────────────────────
    try {
      const atsAnalysis = await this.ai.analyzeATS(rawText)
      analysis.atsAnalysis = atsAnalysis
    } catch (err) {
      logger.warn({ err, section: 'ats' }, 'ATS analysis failed — continuing')
      analysis.recordSectionError('ats', this.toErrorMessage(err))
    }
    await this.analysisRepository.update(analysis)

    // ── Step 5: STAR Rewrites ─────────────────────────────────────────────────
    try {
      const starRewrites = await this.ai.generateSTARRewrites(rawText, parsedData)
      analysis.starRewrites = starRewrites
    } catch (err) {
      logger.warn({ err, section: 'star' }, 'STAR rewrite failed — continuing')
      analysis.recordSectionError('star', this.toErrorMessage(err))
    }
    await this.analysisRepository.update(analysis)

    // ── Step 6: XYZ Rewrites ──────────────────────────────────────────────────
    try {
      const xyzRewrites = await this.ai.generateXYZRewrites(rawText, parsedData)
      analysis.xyzRewrites = xyzRewrites
    } catch (err) {
      logger.warn({ err, section: 'xyz' }, 'XYZ rewrite failed — continuing')
      analysis.recordSectionError('xyz', this.toErrorMessage(err))
    }
    await this.analysisRepository.update(analysis)

    // ── Step 7: Improvements ──────────────────────────────────────────────────
    try {
      const improvements = await this.ai.generateImprovements(rawText, parsedData)
      analysis.improvements = improvements
    } catch (err) {
      logger.warn({ err, section: 'improvements' }, 'Improvements generation failed — continuing')
      analysis.recordSectionError('improvements', this.toErrorMessage(err))
    }

    // ── Finalize ──────────────────────────────────────────────────────────────
    analysis.computeFinalStatus()
    resume.status = analysis.status === 'ERROR' ? 'ERROR' : 'DONE'
    resume.updatedAt = new Date()

    await this.analysisRepository.update(analysis)
    await this.resumeRepository.update(resume)

    logger.info(
      {
        analysisId: analysis.id,
        status: analysis.status,
        errors: analysis.errors ? Object.keys(analysis.errors) : [],
      },
      'Analysis pipeline completed',
    )
  }

  private toErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message
    return String(err)
  }
}
