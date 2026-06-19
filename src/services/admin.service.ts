import { get, put, patch, delete as destroy } from './api-client';
import { type User } from '../types/user.type';
import { type Job } from '../types/job.type';
import { type ApiResponse } from '../types/api.type';
import { decodeMojibakeInText } from '../utils/encoding';

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

const normalizeSystemActivity = (activity: SystemActivity): SystemActivity => ({
  ...activity,
  user: decodeMojibakeInText(activity.user),
  message: decodeMojibakeInText(activity.message),
  badgeText: decodeMojibakeInText(activity.badgeText),
});

export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
  const response = await get<ApiResponse<DashboardStats>>('/users/dashboard/stats');
  if (!response.success || !response.data) return response;

  return {
    ...response,
    data: {
      ...response.data,
      activities: response.data.activities.map(normalizeSystemActivity),
    },
  };
};

export interface GetSystemActivitiesParams {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  date?: string;
}

export interface GetSystemActivitiesResponse {
  success: boolean;
  data: SystemActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const getSystemActivities = async (
  params?: GetSystemActivitiesParams
): Promise<GetSystemActivitiesResponse> => {
  const response = await get<GetSystemActivitiesResponse>('/users/dashboard/activities', { params });
  if (!response.success || !response.data) return response;

  return {
    ...response,
    data: response.data.map(normalizeSystemActivity),
  };
};

export interface AuditLog {
  id: number;
  adminId: number;
  action: string;
  targetType: string;
  targetId: number;
  details: string | null;
  createdAt: string;
  admin: {
    id: number;
    email: string;
  };
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  targetType?: string;
  search?: string;
  date?: string;
}

export interface GetAuditLogsResponse {
  success: boolean;
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const getAuditLogs = async (
  params?: GetAuditLogsParams
): Promise<GetAuditLogsResponse> => {
  const response = await get<GetAuditLogsResponse>('/users/dashboard/audit-logs', { params });
  if (!response.success || !response.data) return response;

  return {
    ...response,
    data: response.data.map(log => ({
      ...log,
      admin: { ...log.admin, email: decodeMojibakeInText(log.admin.email) },
    })),
  };
};
