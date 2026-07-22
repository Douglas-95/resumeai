import { Resume } from '../entities/Resume.js'

export interface IResumeRepository {
  findById(id: string): Promise<Resume | null>
  findByUserId(userId: string): Promise<Resume[]>
  save(resume: Resume): Promise<void>
  update(resume: Resume): Promise<void>
  delete(id: string): Promise<void>
}
