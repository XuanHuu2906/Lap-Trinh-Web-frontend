import type { JobStatus } from '../utils/job-status';

export type JobType = 'full_time' | 'part_time' | 'remote' | 'internship' | 'contract';
export type { JobStatus };
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
  recruiter?: {
    recruiterProfile?: {
      id?: number;
      companyName: string;
      logoUrl?: string | null;
      contactName?: string | null;
    } | null;
  };
  category?: {
    id: number;
    name: string;
  } | null;
  skills?: Array<{
    skill: {
      id: number;
      name: string;
      slug?: string;
    };
  }>;
  _count?: {
    applications: number;
  };
}

export interface JobFilter {
  keyword?: string;
  location?: string;
  categoryId?: number;
  jobType?: JobType;
  minSalary?: number;
}

export interface JobQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  location?: string;
  categoryId?: number;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
}

export interface JobsApiResponse<T = Job[]> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
