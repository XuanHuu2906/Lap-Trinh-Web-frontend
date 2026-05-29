import type { UserRole } from './user.type';

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterCandidateRequest {
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export interface RegisterRecruiterRequest {
  companyName: string;
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  confirmPassword?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    role: UserRole;
  };
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    role: UserRole;
  };
}
