export type CVTemplateCategory = 'Tất cả' | 'Đơn giản' | 'Hiện đại' | 'Chuyên nghiệp';

export interface CVTemplate {
  id: number;
  name: string;
  category: Exclude<CVTemplateCategory, 'Tất cả'>; // Phân loại hiển thị frontend
  description?: string | null;
  thumbnailUrl?: string | null;
  layoutConfig?: string | null;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  // Các trường phục vụ demo giao diện
  isNew?: boolean;
  features?: string[];
}

export interface Education {
  school: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Skill {
  name: string;
  level?: string;
}

export interface Project {
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies?: string[];
}

export interface Certification {
  name: string;
  organization: string;
  issueDate: string;
  expirationDate?: string;
}

export interface CVPersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  address?: string;
  summary?: string;
}

export interface CV {
  id: number;
  userId: number;
  templateId?: number | null;
  title: string;
  status: 'draft' | 'active';
  cvType: 'built' | 'uploaded';
  personalInfo?: CVPersonalInfo | null; // Lưu dạng JSON string trong DB, parse thành object ở frontend
  education?: Education[] | null;       // JSON array
  experience?: WorkExperience[] | null; // JSON array
  skills?: Skill[] | null;             // JSON array
  certifications?: Certification[] | null; // JSON array
  projects?: Project[] | null;         // JSON array
  pdfUrl?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
