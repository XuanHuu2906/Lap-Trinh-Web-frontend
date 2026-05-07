export type JobType = 'full_time' | 'part_time' | 'remote' | 'internship' | 'contract';
export type JobStatus = 'draft' | 'active' | 'closed' | 'deleted';
export type SalaryUnit = 'month' | 'year' | 'hour' | 'negotiable';
export type ExperienceLevel = 'no_exp' | 'junior' | 'mid' | 'senior' | 'manager';

export interface Job {
  id: number;
  recruiterId: number;
  categoryId?: number | null;
  title: string;
  description: string;
  requirements?: string | null;
  benefits?: string | null;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryUnit?: SalaryUnit | null;
  jobType: JobType;
  experienceLevel?: ExperienceLevel | null;
  status: JobStatus;
  expiresAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobFilter {
  keyword?: string;
  location?: string;
  categoryId?: number;
  jobType?: JobType;
  minSalary?: number;
}
