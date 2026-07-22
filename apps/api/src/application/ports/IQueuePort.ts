export interface IQueuePort {
  /**
   * Enqueue a job to the analysis queue.
   * Returns the job ID for tracking.
   */
  enqueueAnalysisJob(payload: {
    resumeId: string
    analysisId: string
    userId: string
  }): Promise<string>

  /**
   * Get the current status of a queued job.
   */
  getJobStatus(jobId: string): Promise<{
    state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed'
    progress: number
    failReason?: string
  } | null>
}
