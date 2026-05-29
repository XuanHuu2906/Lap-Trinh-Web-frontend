import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động gắn Authorization: Bearer <token> từ localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Tự động parse response (response.data) & xử lý lỗi 401
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    const config = error.config as any;

    // Nếu gặp lỗi 401 và không có cờ _skipRedirect thì tiến hành clear token và redirect
    if (error.response && error.response.status === 401) {
      if (!config || !config._skipRedirect) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Tránh lặp vô hạn nếu đang ở trang login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Export các HTTP method helpers: get, post, put, patch, delete
export const get = <T = any>(url: string, config = {}): Promise<T> =>
  apiClient.get(url, config) as unknown as Promise<T>;

export const post = <T = any>(url: string, data = {}, config = {}): Promise<T> =>
  apiClient.post(url, data, config) as unknown as Promise<T>;

export const put = <T = any>(url: string, data = {}, config = {}): Promise<T> =>
  apiClient.put(url, data, config) as unknown as Promise<T>;

export const patch = <T = any>(url: string, data = {}, config = {}): Promise<T> =>
  apiClient.patch(url, data, config) as unknown as Promise<T>;

const deleteMethod = <T = any>(url: string, config = {}): Promise<T> =>
  apiClient.delete(url, config) as unknown as Promise<T>;

export { deleteMethod as delete };

export default apiClient;
