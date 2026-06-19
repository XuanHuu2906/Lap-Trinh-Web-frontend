import { requestApi, type ApiResponse } from './api';
import { JOB_STATUS, type JobStatus } from '../utils/job-status';

// =============================================================================
// ĐỊNH NGHĨA KIỂU DỮ LIỆU (Types & Interfaces)
// =============================================================================

// --- Job Types ---

/** Các loại hình công việc */
export type JobType =
  | 'full-time'    // Toàn thời gian
  | 'part-time'    // Bán thời gian
  | 'remote'       // Làm việc từ xa
  | 'hybrid'       // Kết hợp
  | 'freelance'    // Tự do
  | 'internship';  // Thực tập

/** Các cấp độ kinh nghiệm yêu cầu */
export type ExperienceLevel =
  | 'entry'     // Mới tốt nghiệp
  | 'junior'    // Junior
  | 'mid'       // Mid-level
  | 'senior'    // Senior
  | 'lead'      // Lead
  | 'director'; // Director

/** Các trạng thái của đơn ứng tuyển */
export type ApplicationStatus =
  | 'pending'      // Chờ xử lý (mới nộp)
  | 'reviewing'    // Đã xem
  | 'interview'    // Mời phỏng vấn
  | 'confirmed'    // Ứng viên đã xác nhận
  | 'rejected'     // Không phù hợp
  | 'cancelled';   // Đã hủy

/** Các trạng thái tin tuyển dụng mà recruiter có thể cập nhật */
export type RecruiterJobStatusUpdate =
  | 'active'
  | typeof JOB_STATUS.PENDING_REVIEW
  | typeof JOB_STATUS.CLOSED;

/**
 * Cấu trúc tin tuyển dụng trả về từ API
 * Bao gồm thông tin cơ bản + skills + category + số lượng ứng viên
 */
export interface RecruiterJob {
  id: number;
  recruiterId: number;
  categoryId?: number | null;
  title: string;                    // Tiêu đề công việc
  description: string;              // Mô tả chi tiết
  requirements?: string | null;     // Yêu cầu ứng viên
  benefits?: string | null;         // Quyền lợi
  location?: string | null;         // Địa điểm
  salaryMin?: number | string | null;  // Lương tối thiểu
  salaryMax?: number | string | null;  // Lương tối đa
  salaryUnit?: 'VND' | 'USD' | null;  // Đơn vị tiền tệ
  jobType: JobType;                 // Loại hình
  experienceLevel?: ExperienceLevel | null;  // Kinh nghiệm
  status: JobStatus;                // Trạng thái tin
  expiresAt?: string | null;        // Hạn nộp hồ sơ
  createdAt: string;
  updatedAt: string;
  category?: { name?: string } | null;              // Danh mục ngành nghề
  skills?: Array<{ skill: { id: number; name: string } }>;  // Kỹ năng yêu cầu
  _count?: { applications?: number };               // Số lượng ứng viên
}

/** Payload gửi lên khi tạo/cập nhật tin tuyển dụng */
export interface CreateJobPayload {
  title: string;
  description: string;
  requirements?: string | null;
  benefits?: string | null;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryUnit?: 'VND' | 'USD' | null;
  jobType: JobType;
  experienceLevel?: ExperienceLevel | null;
  categoryId?: number | null;
  expiresAt?: string | null;
  skillIds?: number[];
  status?: 'active' | typeof JOB_STATUS.PENDING_REVIEW | typeof JOB_STATUS.DRAFT;
}

// --- Application Types ---

/**
 * Cấu trúc đơn ứng tuyển (góc nhìn recruiter)
 * 
 * Bao gồm đầy đủ:
 * - Thông tin ứng viên (candidateProfile)
 * - CV đã upload
 * - Phản hồi (feedbacks)
 * - Đánh giá nội bộ (evaluations)
 * - Lịch phỏng vấn (interviews)
 * - Conversation để chat
 */
export interface RecruiterApplication {
  id: number;
  candidateProfileId?: number;
  jobPostingId?: number;
  status: ApplicationStatus;
  coverLetter?: string | null;      // Thư xin việc
  appliedAt: string;                // Ngày nộp đơn
  candidateProfile?: {
    id: number;
    fullName?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    user?: { email?: string; createdAt?: string };
  };
  cv?: {
    id: number;
    title?: string | null;
    cvType?: string | null;
    pdfUrl?: string | null;         // Signed URL (hết hạn 600s)
    personalInfo?: any | null;
    education?: any | null;
    experience?: any | null;
    skills?: any | null;
    certifications?: any | null;
    projects?: any | null;
  } | null;
  jobPosting?: {
    id?: number;
    title?: string;
  };
  feedbacks?: Array<{
    id: number;
    content: string;
    createdAt: string;
    recruiterProfile?: { companyName?: string | null };
  }>;
  evaluations?: Array<{
    id: number;
    score?: number | null;     // Điểm 1-5
    notes?: string | null;
  }>;
  interviews?: Array<{
    id: number;
    scheduledAt: string;
    type: 'online' | 'offline';
    location: string | null;
    notes?: string | null;
    status: string;
    confirmedAt?: string | null;
  }>;
  conversation?: {
    id: number;
  } | null;
}

// --- Profile Types ---

/** Cấu trúc hồ sơ nhà tuyển dụng */
export interface RecruiterProfile {
  id: number;
  userId: number;
  companyName: string;              // Tên công ty
  contactName?: string | null;      // Người liên hệ
  phone?: string | null;            // Số điện thoại
  address?: string | null;          // Địa chỉ
  website?: string | null;          // Website
  description?: string | null;      // Mô tả doanh nghiệp
  logoUrl?: string | null;          // URL logo
  logoStoragePath?: string | null;  // Path trong storage
}

// =============================================================================
// CACHE & EVENTS - Lưu cache hồ sơ recruiter để tránh gọi API nhiều lần
// =============================================================================

/** Cache lưu hồ sơ recruiter (tránh gọi API nhiều lần khi chuyển trang) */
let recruiterProfileCache: ApiResponse<RecruiterProfile> | null = null;

/** Tên sự kiện CustomEvent khi hồ sơ recruiter thay đổi */
export const RECRUITER_PROFILE_CHANGED_EVENT = 'recruiter-profile:changed';

/**
 * Phát sự kiện khi hồ sơ recruiter thay đổi
 * Các component khác (Sidebar, Header, ...) lắng nghe để cập nhật
 */
const notifyRecruiterProfileChanged = (detail: Partial<RecruiterProfile>) => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<Partial<RecruiterProfile>>(
      RECRUITER_PROFILE_CHANGED_EVENT,
      { detail },
    ),
  );
};

/** Lấy cache hồ sơ recruiter (dùng để kiểm tra trước khi gọi API) */
export const getCachedRecruiterProfile = () => recruiterProfileCache;

/** Xóa cache hồ sơ recruiter (khi logout) */
export const clearRecruiterProfileCache = () => {
  recruiterProfileCache = null;
};

// =============================================================================
// PAGINATION TYPE
// =============================================================================

/** Cấu trúc phân trang chuẩn trả về từ API */
export interface PaginationMeta {
  total: number;       // Tổng số bản ghi
  page: number;        // Trang hiện tại
  limit: number;       // Số lượng mỗi trang
  totalPages: number;  // Tổng số trang
}

// =============================================================================
// API RECRUITER - TIN TUYỂN DỤNG (Jobs)
// =============================================================================

/**
 * GET /api/jobs/my
 * Lấy danh sách tin tuyển dụng của recruiter
 * @param params.page - Số trang (mặc định 1)
 * @param params.limit - Số lượng mỗi trang (mặc định 10)
 * @param params.status - Lọc theo trạng thái
 */
export async function getMyJobs(params: {
  page?: number;
  limit?: number;
  status?: JobStatus | '';
}) {
  return requestApi<RecruiterJob[]>({
    method: 'GET',
    url: '/jobs/my',
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      status: params.status || undefined,
    },
  });
}

/**
 * POST /api/jobs
 * Tạo tin tuyển dụng mới
 * @param data - Thông tin tin tuyển dụng
 */
export async function createJob(data: CreateJobPayload) {
  return requestApi<RecruiterJob>({ method: 'POST', url: '/jobs', data });
}

/**
 * GET /api/jobs/:id/recruiter
 * Lấy chi tiết tin tuyển dụng (chỉ recruiter sở hữu)
 * @param id - ID tin tuyển dụng
 */
export async function getMyJobDetail(id: number) {
  return requestApi<RecruiterJob>({ method: 'GET', url: `/jobs/${id}/recruiter` });
}

/**
 * PUT /api/jobs/:id
 * Cập nhật tin tuyển dụng
 * @param id - ID tin cần sửa
 * @param data - Dữ liệu cập nhật
 */
export async function updateJob(id: number, data: CreateJobPayload) {
  return requestApi<RecruiterJob>({ method: 'PUT', url: `/jobs/${id}`, data });
}

/**
 * PATCH /api/jobs/:id/status
 * Cập nhật trạng thái tin tuyển dụng (gửi duyệt / đóng tin)
 * @param id - ID tin
 * @param status - Trạng thái mới
 */
export async function updateJobStatus(id: number, status: RecruiterJobStatusUpdate) {
  return requestApi<RecruiterJob>({
    method: 'PATCH',
    url: `/jobs/${id}/status`,
    data: { status },
  });
}

/**
 * DELETE /api/jobs/:id
 * Xóa mềm tin tuyển dụng
 * @param id - ID tin cần xóa
 */
export async function deleteJob(id: number) {
  return requestApi<null>({ method: 'DELETE', url: `/jobs/${id}` });
}

// =============================================================================
// API RECRUITER - ĐƠN ỨNG TUYỂN (Applications)
// =============================================================================

/**
 * GET /api/applications
 * Lấy danh sách đơn ứng tuyển (lọc theo status, jobId)
 * @param params.page - Số trang
 * @param params.limit - Số lượng mỗi trang (mặc định 50)
 * @param params.status - Lọc trạng thái
 * @param params.jobId - Lọc theo tin tuyển dụng
 */
export async function getRecruiterApplications(
  params: {
    page?: number;
    limit?: number;
    status?: ApplicationStatus | '';
    jobId?: number;
  } = {},
) {
  return requestApi<RecruiterApplication[]>({
    method: 'GET',
    url: '/applications',
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      status: params.status || undefined,
      jobId: params.jobId || undefined,
    },
  });
}

/**
 * GET /api/applications/job/:jobId
 * Lấy đơn ứng tuyển theo job cụ thể
 * @param params.jobId - ID tin tuyển dụng
 */
export async function getApplicationsByJob(params: {
  jobId: number;
  page?: number;
  limit?: number;
  status?: ApplicationStatus | '';
}) {
  return requestApi<RecruiterApplication[]>({
    method: 'GET',
    url: `/applications/job/${params.jobId}`,
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      status: params.status || undefined,
    },
  });
}

/**
 * GET /api/applications/:id
 * Lấy chi tiết đơn ứng tuyển
 * @param id - ID đơn ứng tuyển
 */
export async function getApplicationDetail(id: number) {
  return requestApi<RecruiterApplication>({
    method: 'GET',
    url: `/applications/${id}`,
  });
}

/**
 * PUT /api/applications/:id/status
 * Cập nhật trạng thái đơn ứng tuyển
 * @param id - ID đơn
 * @param status - Trạng thái mới (reviewing/interview/rejected)
 */
export async function updateApplicationStatus(
  id: number,
  status: 'reviewing' | 'interview' | 'rejected',
) {
  return requestApi<RecruiterApplication>({
    method: 'PUT',
    url: `/applications/${id}/status`,
    data: { status },
  });
}

/**
 * POST /api/applications/:id/feedback
 * Gửi phản hồi cho ứng viên
 * @param applicationId - ID đơn
 * @param content - Nội dung phản hồi
 * @param status - Trạng thái kèm (interview/rejected) - tùy chọn
 */
export async function createFeedback(
  applicationId: number,
  content: string,
  status?: 'interview' | 'rejected',
) {
  return requestApi({
    method: 'POST',
    url: `/applications/${applicationId}/feedback`,
    data: { content, status },
  });
}

/** Payload đặt lịch phỏng vấn */
export interface ScheduleInterviewPayload {
  content: string;                     // Thư mời
  scheduledAt: string;                 // Thời gian (ISO datetime)
  type: 'online' | 'offline';          // Hình thức
  location: string;                    // Địa điểm/link
  notes?: string;                      // Ghi chú
}

/**
 * POST /api/applications/:id/interview
 * Gửi thư mời phỏng vấn (kèm lịch hẹn)
 * @param applicationId - ID đơn
 * @param data - Thông tin lịch phỏng vấn
 */
export async function scheduleInterview(
  applicationId: number,
  data: ScheduleInterviewPayload,
) {
  return requestApi({
    method: 'POST',
    url: `/applications/${applicationId}/interview`,
    data,
  });
}

/**
 * POST /api/applications/:id/evaluate
 * Tạo đánh giá nội bộ cho ứng viên
 * @param applicationId - ID đơn
 * @param score - Điểm số (1-5)
 * @param notes - Nhận xét
 */
export async function createEvaluation(
  applicationId: number,
  score: number,
  notes: string,
) {
  return requestApi({
    method: 'POST',
    url: `/applications/${applicationId}/evaluate`,
    data: { score, notes },
  });
}

// =============================================================================
// API RECRUITER - HỒ SƠ CÁ NHÂN (Profile)
// =============================================================================

/**
 * GET /api/users/recruiter/profile
 * Lấy hồ sơ nhà tuyển dụng (có cache)
 * @param forceRefresh - Bỏ qua cache, gọi API mới
 */
export async function getRecruiterProfile(forceRefresh = false) {
  if (!forceRefresh && recruiterProfileCache) return recruiterProfileCache;

  const response = await requestApi<RecruiterProfile>({
    method: 'GET',
    url: '/users/recruiter/profile',
  });
  recruiterProfileCache = response;
  return response;
}

/**
 * PUT /api/users/recruiter/profile
 * Cập nhật hồ sơ nhà tuyển dụng (cập nhật cache + phát sự kiện)
 * @param data - Thông tin hồ sơ
 */
export async function updateRecruiterProfile(data: {
  companyName: string;
  contactName?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  description?: string | null;
}) {
  const response = await requestApi<RecruiterProfile>({
    method: 'PUT',
    url: '/users/recruiter/profile',
    data,
  });
  recruiterProfileCache = response;
  notifyRecruiterProfileChanged(response.data);
  return response;
}

/**
 * POST /api/users/recruiter/logo
 * Upload logo công ty (multipart/form-data)
 * @param file - File ảnh logo
 */
export async function uploadRecruiterLogo(file: File) {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await requestApi<{
    logoUrl: string | null;
    logoStoragePath: string | null;
  }>({
    method: 'POST',
    url: '/users/recruiter/logo',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  // Cập nhật cache với logo mới
  if (recruiterProfileCache) {
    recruiterProfileCache = {
      ...recruiterProfileCache,
      data: {
        ...recruiterProfileCache.data,
        logoUrl: response.data.logoUrl,
        logoStoragePath: response.data.logoStoragePath,
      },
    };
  }

  notifyRecruiterProfileChanged(response.data);
  return response;
}
