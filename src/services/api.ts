import axios, { AxiosError, type AxiosRequestConfig } from "axios";

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

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    return data?.message || data?.error || error.message || "Có lỗi xảy ra khi gọi API";
  }

  if (error instanceof Error) return error.message;
  return "Có lỗi xảy ra khi gọi API";
};

export async function requestApi<T>(config: AxiosRequestConfig) {
  try {
    const response = await api.request<ApiResponse<T>>(config);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
