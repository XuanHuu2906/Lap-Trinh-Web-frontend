import { api } from "@/lib/api";
import type { Job } from "@/types/job.type";

export type ApplicationStatus =
  | "pending"
  | "reviewing"
  | "interview"
  | "rejected"
  | "cancelled";

export type CandidateApplication = {
  id: number;
  candidateProfileId: number;
  jobPostingId: number;
  cvId: number;
  coverLetter?: string | null;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  jobPosting?: Job;
  cv?: {
    title: string;
    cvType: string;
  } | null;
  feedbacks?: Array<{
    id: number;
    content: string;
    createdAt: string;
  }>;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const myApplicationsCache = new Map<string, ApiResponse<CandidateApplication[]>>();

const cacheKey = (params: object) => JSON.stringify(params);

export const getCachedMyApplications = (params: object = {}) =>
  myApplicationsCache.get(cacheKey(params)) ?? null;

export const clearMyApplicationsCache = () => {
  myApplicationsCache.clear();
};

export const applicationService = {
  async applyToJob(data: {
    jobPostingId: number;
    cvId: number;
    coverLetter?: string | null;
  }) {
    const response = await api.post<ApiResponse<CandidateApplication>>(
      "/applications",
      data,
    );
    clearMyApplicationsCache();
    return response.data;
  },

  async getMyApplications(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}, forceRefresh = false) {
    const key = cacheKey(params);
    if (!forceRefresh && myApplicationsCache.has(key)) {
      return myApplicationsCache.get(key)!;
    }

    const response = await api.get<ApiResponse<CandidateApplication[]>>(
      "/applications/my",
      { params },
    );
    myApplicationsCache.set(key, response.data);
    return response.data;
  },
};
