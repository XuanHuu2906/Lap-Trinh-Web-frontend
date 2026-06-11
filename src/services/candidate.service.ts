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
export const CANDIDATE_PROFILE_CHANGED_EVENT = "candidate-profile:changed";

const notifyCandidateProfileChanged = (detail: Partial<CandidateProfile>) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<Partial<CandidateProfile>>(CANDIDATE_PROFILE_CHANGED_EVENT, {
      detail,
    }),
  );
};

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
    notifyCandidateProfileChanged(response.data.data);
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

    const result = response.data;
    const avatarUrl = result.data.avatarUrl;

    if (candidateProfileCache) {
      candidateProfileCache = {
        ...candidateProfileCache,
        data: {
          ...candidateProfileCache.data,
          avatarUrl,
        },
      };
    }

    notifyCandidateProfileChanged({ avatarUrl });
    return result;
  },
};
