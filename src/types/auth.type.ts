import { type UserRole } from './user.type';

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterCandidateRequest {
  fullName: string;
  email: string;
  password?: string;
}

export interface RegisterRecruiterRequest {
  companyName: string;
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
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
