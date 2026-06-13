import type { Job, JobsApiResponse } from "./job.type";

export interface CompanyProfile {
  id: number;
  recruiterId: number;
  companyName: string;
  contactName?: string | null;
  phone?: string | null;
  email: string;
  address?: string | null;
  website?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  activeJobCount: number;
}

export interface CompanyProfileData {
  company: CompanyProfile;
  jobs: Job[];
  meta: NonNullable<JobsApiResponse["meta"]>;
}
