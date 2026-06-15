import { requestApi, type ApiResponse } from "./api";
import { JOB_STATUS, type JobStatus } from "../utils/job-status";

export type JobType = "full-time" | "part-time" | "remote" | "hybrid" | "freelance" | "internship";
export type ExperienceLevel = "entry" | "junior" | "mid" | "senior" | "lead" | "director";
export type ApplicationStatus = "pending" | "reviewing" | "interview" | "rejected" | "cancelled";
export type RecruiterJobStatusUpdate = "active" | typeof JOB_STATUS.PENDING_REVIEW | typeof JOB_STATUS.CLOSED;

export interface RecruiterJob {
  id: number;
  recruiterId: number;
  categoryId?: number | null;
  title: string;
  description: string;
  requirements?: string | null;
  benefits?: string | null;
  location?: string | null;
  salaryMin?: number | string | null;
  salaryMax?: number | string | null;
  salaryUnit?: "VND" | "USD" | null;
  jobType: JobType;
  experienceLevel?: ExperienceLevel | null;
  status: JobStatus;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { name?: string } | null;
  skills?: Array<{ skill: { id: number; name: string } }>;
  _count?: { applications?: number };
}

export interface CreateJobPayload {
  title: string;
  description: string;
  requirements?: string | null;
  benefits?: string | null;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryUnit?: "VND" | "USD" | null;
  jobType: JobType;
  experienceLevel?: ExperienceLevel | null;
  categoryId?: number | null;
  expiresAt?: string | null;
  skillIds?: number[];
  status?: "active" | typeof JOB_STATUS.PENDING_REVIEW | typeof JOB_STATUS.DRAFT;
}

export interface RecruiterApplication {
  id: number;
  candidateProfileId?: number;
  jobPostingId?: number;
  status: ApplicationStatus;
  coverLetter?: string | null;
  appliedAt: string;
  candidateProfile?: {
    id: number;
    fullName?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    user?: { email?: string; createdAt?: string };
  };
  cv?: {
    title?: string | null;
    cvType?: string | null;
    pdfUrl?: string | null;
  } | null;
  jobPosting?: {
    id?: number;
    title?: string;
  };
  feedbacks?: Array<{
    id: number;
    content: string;
    createdAt: string;
    recruiterProfile?: { companyName?: string | null };
  }>;
  evaluations?: Array<{
    id: number;
    score?: number | null;
    notes?: string | null;
  }>;
  conversation?: {
    id: number;
  } | null;
}

export interface RecruiterProfile {
  id: number;
  userId: number;
  companyName: string;
  contactName?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  logoStoragePath?: string | null;
}

let recruiterProfileCache: ApiResponse<RecruiterProfile> | null = null;
export const RECRUITER_PROFILE_CHANGED_EVENT = "recruiter-profile:changed";

const notifyRecruiterProfileChanged = (detail: Partial<RecruiterProfile>) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<Partial<RecruiterProfile>>(
      RECRUITER_PROFILE_CHANGED_EVENT,
      { detail },
    ),
  );
};

export const getCachedRecruiterProfile = () => recruiterProfileCache;

export const clearRecruiterProfileCache = () => {
  recruiterProfileCache = null;
};

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getMyJobs(params: { page?: number; limit?: number; status?: JobStatus | "" }) {
  return requestApi<RecruiterJob[]>({
    method: "GET",
    url: "/jobs/my",
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      status: params.status || undefined,
    },
  });
}

export async function createJob(data: CreateJobPayload) {
  return requestApi<RecruiterJob>({ method: "POST", url: "/jobs", data });
}

export async function getMyJobDetail(id: number) {
  return requestApi<RecruiterJob>({ method: "GET", url: `/jobs/${id}/recruiter` });
}

export async function updateJob(id: number, data: CreateJobPayload) {
  return requestApi<RecruiterJob>({ method: "PUT", url: `/jobs/${id}`, data });
}

export async function updateJobStatus(id: number, status: RecruiterJobStatusUpdate) {
  return requestApi<RecruiterJob>({ method: "PATCH", url: `/jobs/${id}/status`, data: { status } });
}

export async function deleteJob(id: number) {
  return requestApi<null>({ method: "DELETE", url: `/jobs/${id}` });
}

export async function getApplicationsByJob(params: {
  jobId: number;
  page?: number;
  limit?: number;
  status?: ApplicationStatus | "";
}) {
  return requestApi<RecruiterApplication[]>({
    method: "GET",
    url: `/applications/job/${params.jobId}`,
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      status: params.status || undefined,
    },
  });
}

export async function getApplicationDetail(id: number) {
  return requestApi<RecruiterApplication>({ method: "GET", url: `/applications/${id}` });
}

export async function updateApplicationStatus(id: number, status: "reviewing" | "interview" | "rejected") {
  return requestApi<RecruiterApplication>({
    method: "PUT",
    url: `/applications/${id}/status`,
    data: { status },
  });
}

export async function createFeedback(
  applicationId: number,
  content: string,
  status?: "interview" | "rejected",
) {
  return requestApi({
    method: "POST",
    url: `/applications/${applicationId}/feedback`,
    data: { content, status },
  });
}

export async function createEvaluation(applicationId: number, score: number, notes: string) {
  return requestApi({ method: "POST", url: `/applications/${applicationId}/evaluate`, data: { score, notes } });
}

export async function getRecruiterProfile(forceRefresh = false) {
  if (!forceRefresh && recruiterProfileCache) return recruiterProfileCache;

  const response = await requestApi<RecruiterProfile>({
    method: "GET",
    url: "/users/recruiter/profile",
  });
  recruiterProfileCache = response;
  return response;
}

export async function updateRecruiterProfile(data: {
  companyName: string;
  contactName?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  description?: string | null;
}) {
  const response = await requestApi<RecruiterProfile>({
    method: "PUT",
    url: "/users/recruiter/profile",
    data,
  });
  recruiterProfileCache = response;
  notifyRecruiterProfileChanged(response.data);
  return response;
}

export async function uploadRecruiterLogo(file: File) {
  const formData = new FormData();
  formData.append("logo", file);

  const response = await requestApi<{ logoUrl: string | null; logoStoragePath: string | null }>({
    method: "POST",
    url: "/users/recruiter/logo",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (recruiterProfileCache) {
    recruiterProfileCache = {
      ...recruiterProfileCache,
      data: {
        ...recruiterProfileCache.data,
        logoUrl: response.data.logoUrl,
        logoStoragePath: response.data.logoStoragePath,
      },
    };
  }

  notifyRecruiterProfileChanged(response.data);
  return response;
}
