import { api } from "@/lib/api";
import type { Job, JobQuery, JobsApiResponse } from "@/types/job.type";

type SavedJobItem = {
  id: number;
  userId: number;
  jobPostingId: number;
  savedAt: string;
  jobPosting: Job;
};

const cleanParams = (params: object) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );

let savedJobsCache: JobsApiResponse<SavedJobItem[]> | null = null;

export const getCachedSavedJobs = () => savedJobsCache;

export const clearSavedJobsCache = () => {
  savedJobsCache = null;
};

export const jobService = {
  async getFeaturedJobs(limit = 6) {
    const response = await api.get<JobsApiResponse<Job[]>>("/jobs/featured", {
      params: { limit },
    });
    return response.data;
  },

  async getJobs(params: JobQuery = {}) {
    const response = await api.get<JobsApiResponse<Job[]>>("/jobs", {
      params: cleanParams(params),
    });
    return response.data;
  },

  async getCategories() {
    const response = await api.get<
      JobsApiResponse<
        Array<{
          id: number;
          name: string;
          children?: Array<{ id: number; name: string }>;
        }>
      >
    >("/jobs/categories");
    return response.data;
  },

  async searchJobs(params: JobQuery = {}) {
    const response = await api.get<JobsApiResponse<Job[]>>("/jobs/search", {
      params: cleanParams(params),
    });
    return response.data;
  },

  async getJobById(id: number) {
    const response = await api.get<JobsApiResponse<Job>>(`/jobs/${id}`);
    return response.data;
  },

  async saveJob(id: number) {
    const response = await api.post<JobsApiResponse>(`/jobs/${id}/save`);
    clearSavedJobsCache();
    return response.data;
  },

  async unSaveJob(id: number) {
    const response = await api.delete<JobsApiResponse>(`/jobs/${id}/save`);
    clearSavedJobsCache();
    return response.data;
  },

  async getSavedJobs(params: JobQuery = {}, forceRefresh = false) {
    if (!forceRefresh && savedJobsCache) return savedJobsCache;

    const response = await api.get<JobsApiResponse<SavedJobItem[]>>("/jobs/saved", {
      params: cleanParams(params),
    });
    savedJobsCache = response.data;
    return response.data;
  },
};
