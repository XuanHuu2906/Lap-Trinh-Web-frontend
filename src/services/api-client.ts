import { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { api } from "@/lib/api";

type ApiClientConfig = AxiosRequestConfig & {
  _skipRedirect?: boolean;
};

const handleUnauthorized = (error: unknown, config?: ApiClientConfig) => {
  if (!(error instanceof AxiosError) || error.response?.status !== 401) return;
  if (config?._skipRedirect) return;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  const loginPath = window.location.pathname.startsWith("/admin")
    ? "/admin/login"
    : "/login";

  if (window.location.pathname !== loginPath) {
    window.location.href = loginPath;
  }
};

const unwrap = async <T>(
  request: Promise<AxiosResponse<T>>,
  config?: ApiClientConfig,
): Promise<T> => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    handleUnauthorized(error, config);
    return Promise.reject(error);
  }
};

export const get = <T = unknown>(url: string, config: ApiClientConfig = {}) =>
  unwrap<T>(api.get<T>(url, config), config);

export const post = <T = unknown>(
  url: string,
  data = {},
  config: ApiClientConfig = {},
) => unwrap<T>(api.post<T>(url, data, config), config);

export const put = <T = unknown>(
  url: string,
  data = {},
  config: ApiClientConfig = {},
) => unwrap<T>(api.put<T>(url, data, config), config);

export const patch = <T = unknown>(
  url: string,
  data = {},
  config: ApiClientConfig = {},
) => unwrap<T>(api.patch<T>(url, data, config), config);

const deleteMethod = <T = unknown>(url: string, config: ApiClientConfig = {}) =>
  unwrap<T>(api.delete<T>(url, config), config);

export { deleteMethod as delete };
export default api;
