import { api } from "@/lib/api";

export type CandidateProfile = {
  id: number;
  userId: number;
  fullName: string;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    email: string;
    role: string;
    status: string;
  };
};

export type UpdateCandidateProfilePayload = {
  fullName: string;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  bio?: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

let candidateProfileCache: ApiResponse<CandidateProfile> | null = null;

export const getCachedCandidateProfile = () => candidateProfileCache;

export const clearCandidateProfileCache = () => {
  candidateProfileCache = null;
};

export const candidateService = {
  async getProfile(forceRefresh = false) {
    if (!forceRefresh && candidateProfileCache) return candidateProfileCache;

    const response =
      await api.get<ApiResponse<CandidateProfile>>("/users/candidate/profile");
    candidateProfileCache = response.data;
    return response.data;
  },

  async updateProfile(payload: UpdateCandidateProfilePayload) {
    const response = await api.put<ApiResponse<CandidateProfile>>(
      "/users/candidate/profile",
      payload,
    );
    candidateProfileCache = response.data;
    return response.data;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.post<ApiResponse<{ avatarUrl: string }>>(
      "/users/candidate/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    clearCandidateProfileCache();
    return response.data;
  },
};
