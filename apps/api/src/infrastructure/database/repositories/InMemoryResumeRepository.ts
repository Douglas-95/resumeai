import { IResumeRepository } from '../../../domain/repositories/IResumeRepository.js'
import { Resume } from '../../../domain/entities/Resume.js'

export class InMemoryResumeRepository implements IResumeRepository {
  private resumes: Map<string, Resume> = new Map()

  async findById(id: string): Promise<Resume | null> {
    const resume = this.resumes.get(id)
    return resume ?? null
  }

  async findByUserId(userId: string): Promise<Resume[]> {
    return Array.from(this.resumes.values()).filter((r) => r.userId === userId)
  }

  async save(resume: Resume): Promise<void> {
    this.resumes.set(resume.id, resume)
  }

  async update(resume: Resume): Promise<void> {
    this.resumes.set(resume.id, resume)
  }

  async delete(id: string): Promise<void> {
    this.resumes.delete(id)
  }
}
