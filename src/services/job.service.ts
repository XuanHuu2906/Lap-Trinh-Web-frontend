import { api } from "@/lib/api";
import type { Job, JobQuery, JobsApiResponse } from "@/types/job.type";

const cleanParams = (params: object) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
  );

export const jobService = {
  async getJobs(params: JobQuery = {}) {
    const response = await api.get<JobsApiResponse<Job[]>>("/jobs", {
      params: cleanParams(params),
    });
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
    return response.data;
  },

  async unSaveJob(id: number) {
    const response = await api.delete<JobsApiResponse>(`/jobs/${id}/save`);
    return response.data;
  },
};
