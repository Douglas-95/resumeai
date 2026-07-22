export interface IStoragePort {
  /**
   * Upload a file buffer to storage.
   * Returns the public URL of the uploaded file.
   */
  upload(params: {
    bucket: string
    path: string
    buffer: Buffer
    mimeType: string
  }): Promise<string>

  /**
   * Delete a file from storage.
   */
  delete(params: { bucket: string; path: string }): Promise<void>

  /**
   * Generate a signed URL for temporary access.
   */
  getSignedUrl(params: { bucket: string; path: string; expiresIn: number }): Promise<string>
}
