import { AxiosError, type AxiosRequestConfig } from "axios";
import { api, API_BASE_URL } from "@/lib/api";

export { api, API_BASE_URL };

export interface ApiResponse<T> {
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

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || error.message || "Co loi xay ra khi goi API";
  }

  if (error instanceof Error) return error.message;
  return "Co loi xay ra khi goi API";
};

export async function requestApi<T>(config: AxiosRequestConfig) {
  try {
    const response = await api.request<ApiResponse<T>>(config);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
