import { get, put, patch, delete as destroy } from './api-client';
import { type User } from '../types/user.type';
import { type Job } from '../types/job.type';
import { type ApiResponse } from '../types/api.type';

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface GetUsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface GetJobsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface GetJobsResponse {
  success: boolean;
  data: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const getUsers = (params?: GetUsersParams): Promise<GetUsersResponse> => {
  return get<GetUsersResponse>('/users', { params });
};

export const getUserById = (id: number): Promise<ApiResponse<User>> => {
  return get<ApiResponse<User>>(`/users/${id}`);
};

export const updateUser = (id: number, data: Partial<User>): Promise<ApiResponse<User>> => {
  return put<ApiResponse<User>>(`/users/${id}`, data);
};

export const toggleUserStatus = (id: number, status: string): Promise<ApiResponse<User>> => {
  return patch<ApiResponse<User>>(`/users/${id}/status`, { status });
};

export const deleteUser = (id: number): Promise<ApiResponse> => {
  return destroy<ApiResponse>(`/users/${id}`);
};

// Admin Job Management APIs
export const getAdminJobs = (params?: GetJobsParams): Promise<GetJobsResponse> => {
  return get<GetJobsResponse>('/jobs/admin', { params });
};

export const updateJobStatus = (id: number, status: string, rejectionReason?: string): Promise<ApiResponse<unknown>> => {
  return patch<ApiResponse<unknown>>(`/jobs/admin/${id}/status`, { status, rejectionReason });
};

export const forceDeleteJob = (id: number): Promise<ApiResponse> => {
  return destroy<ApiResponse>(`/jobs/admin/${id}`);
};

export interface SystemActivity {
  id: string;
  type: string;
  user: string;
  message: string;
  createdAt: string;
  badgeText: string;
  badgeColor: string;
}

export interface DashboardStats {
  kpis: {
    jobs: number;
    cvs: number;
    candidates: number;
    recruiters: number;
  };
  jobsBreakdown: Record<string, number>;
  cvsBreakdown: Record<string, number>;
  activities: SystemActivity[];
}

export const getDashboardStats = (): Promise<ApiResponse<DashboardStats>> => {
  return get<ApiResponse<DashboardStats>>('/users/dashboard/stats');
};

export const getSystemActivities = (params?: { limit?: number }): Promise<ApiResponse<SystemActivity[]>> => {
  return get<ApiResponse<SystemActivity[]>>('/users/dashboard/activities', { params });
};
