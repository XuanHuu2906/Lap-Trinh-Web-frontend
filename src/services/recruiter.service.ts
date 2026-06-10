import { requestApi } from "./api";

export type JobStatus = "draft" | "active" | "closed" | "deleted";
export type JobType = "full-time" | "part-time" | "remote" | "hybrid" | "freelance" | "internship";
export type ExperienceLevel = "entry" | "junior" | "mid" | "senior" | "lead" | "director";
export type ApplicationStatus = "pending" | "reviewing" | "accepted" | "rejected" | "cancelled";

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
}

export interface RecruiterApplication {
  id: number;
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
}

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

export async function updateJobStatus(id: number, status: "active" | "closed") {
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

export async function updateApplicationStatus(id: number, status: "reviewing" | "accepted" | "rejected") {
  return requestApi<RecruiterApplication>({
    method: "PUT",
    url: `/applications/${id}/status`,
    data: { status },
  });
}

export async function createFeedback(applicationId: number, content: string) {
  return requestApi({ method: "POST", url: `/applications/${applicationId}/feedback`, data: { content } });
}

export async function createEvaluation(applicationId: number, score: number, notes: string) {
  return requestApi({ method: "POST", url: `/applications/${applicationId}/evaluate`, data: { score, notes } });
}

export async function getRecruiterProfile() {
  return requestApi<RecruiterProfile>({ method: "GET", url: "/users/recruiter/profile" });
}

export async function updateRecruiterProfile(data: {
  companyName: string;
  contactName?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  description?: string | null;
}) {
  return requestApi<RecruiterProfile>({ method: "PUT", url: "/users/recruiter/profile", data });
}

export async function uploadRecruiterLogo(file: File) {
  const formData = new FormData();
  formData.append("logo", file);

  return requestApi<{ logoUrl: string }>({
    method: "POST",
    url: "/users/recruiter/logo",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
}
