import { API_BASE_URL, api } from "@/lib/api";
import { clearCandidateDashboardCache } from "@/services/candidate-dashboard-cache";

export type CVType = "built" | "uploaded";
export type CVStatus = "draft" | "active";

export type CandidateCV = {
  id: number;
  userId: number;
  templateId?: number | null;
  title: string;
  status: CVStatus;
  cvType: CVType;
  personalInfo?: unknown;
  education?: unknown;
  experience?: unknown;
  skills?: unknown;
  certifications?: unknown;
  projects?: unknown;
  pdfUrl?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  template?: {
    name: string;
    thumbnailUrl?: string | null;
  } | null;
};

export type CandidateCVTemplate = {
  id: number;
  name: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  layoutConfig?: unknown;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

let myCVsCache: ApiResponse<CandidateCV[]> | null = null;
let cvTemplatesCache: ApiResponse<CandidateCVTemplate[]> | null = null;

export const getCachedMyCVs = () => myCVsCache;
export const getCachedCVTemplates = () => cvTemplatesCache;

const setMyCVsCache = (data: ApiResponse<CandidateCV[]>) => {
  myCVsCache = data;
};

const clearMyCVsCache = () => {
  myCVsCache = null;
};

export const getUploadUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;

  const serverUrl = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${serverUrl}${url}`;
};

export const cvService = {
  async getMyCVs(forceRefresh = false) {
    if (!forceRefresh && myCVsCache) return myCVsCache;

    const response = await api.get<ApiResponse<CandidateCV[]>>("/cvs");
    setMyCVsCache(response.data);
    return response.data;
  },

  async getTemplates(forceRefresh = false) {
    if (!forceRefresh && cvTemplatesCache) return cvTemplatesCache;

    const response =
      await api.get<ApiResponse<CandidateCVTemplate[]>>("/cvs/templates");
    cvTemplatesCache = response.data;
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get<ApiResponse<CandidateCV>>(`/cvs/${id}`);
    return response.data;
  },

  async create(data: Partial<CandidateCV>) {
    const response = await api.post<ApiResponse<CandidateCV>>("/cvs", data);
    clearMyCVsCache();
    clearCandidateDashboardCache();
    return response.data;
  },

  async update(id: number, data: Partial<CandidateCV>) {
    const response = await api.put<ApiResponse<CandidateCV>>(`/cvs/${id}`, data);
    clearMyCVsCache();
    clearCandidateDashboardCache();
    return response.data;
  },

  async uploadPdf(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<ApiResponse<CandidateCV>>(
      "/cvs/upload",
      formData,
    );
    clearMyCVsCache();
    clearCandidateDashboardCache();
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete<ApiResponse<null>>(`/cvs/${id}`);
    clearMyCVsCache();
    clearCandidateDashboardCache();
    return response.data;
  },

  async setStatus(id: number, status: CVStatus) {
    const response = await api.patch<ApiResponse<CandidateCV>>(
      `/cvs/${id}/status`,
      { status },
    );
    clearMyCVsCache();
    clearCandidateDashboardCache();
    return response.data;
  },
};
