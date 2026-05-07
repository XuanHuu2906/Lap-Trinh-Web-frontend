export type UserRole = 'candidate' | 'recruiter' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'banned';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  status: UserStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateProfile {
  id: number;
  userId: number;
  fullName: string;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null; // Tương ứng DATE date_of_birth
  avatarUrl?: string | null;  // Tương ứng NVARCHAR(500) avatar_url
  bio?: string | null;        // Tương ứng NVARCHAR(MAX) bio
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterProfile {
  id: number;
  userId: number;
  companyName: string;
  contactName?: string | null; // Tương ứng NVARCHAR(150) contact_name
  phone?: string | null;
  address?: string | null;
  website?: string | null;     // Tương ứng NVARCHAR(300) website
  description?: string | null; // Tương ứng NVARCHAR(MAX) description
  logoUrl?: string | null;     // Tương ứng NVARCHAR(500) logo_url
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfile {
  id: number;
  userId: number;
}
