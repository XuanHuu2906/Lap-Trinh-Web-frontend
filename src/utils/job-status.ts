export const JOB_STATUS = {
  DRAFT: "draft",
  PENDING_REVIEW: "CHO_DUYET",
  ACTIVE: "DANG_HOAT_DONG",
  CLOSED: "closed",
  DELETED: "deleted",
} as const;

export type JobStatus =
  | typeof JOB_STATUS.DRAFT
  | typeof JOB_STATUS.PENDING_REVIEW
  | typeof JOB_STATUS.ACTIVE
  | typeof JOB_STATUS.CLOSED
  | typeof JOB_STATUS.DELETED
  | "active"
  | "approved"
  | "pending";

const normalizeJobStatus = (status?: string | null) => {
  if (status === "active" || status === "approved") return JOB_STATUS.ACTIVE;
  if (status === "pending") return JOB_STATUS.PENDING_REVIEW;
  return status ?? "";
};

const jobStatusLabels: Record<string, string> = {
  [JOB_STATUS.PENDING_REVIEW]: "Chờ duyệt",
  [JOB_STATUS.ACTIVE]: "Đang hoạt động",
  [JOB_STATUS.DRAFT]: "Bản nháp",
  [JOB_STATUS.CLOSED]: "Đã đóng",
  [JOB_STATUS.DELETED]: "Đã xóa",
};

const jobStatusStyles: Record<string, string> = {
  [JOB_STATUS.PENDING_REVIEW]:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  [JOB_STATUS.ACTIVE]:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
  [JOB_STATUS.DRAFT]:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  [JOB_STATUS.CLOSED]:
    "border-red-200 bg-red-50 text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
  [JOB_STATUS.DELETED]:
    "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

export const getJobStatusLabel = (status?: string | null) =>
  jobStatusLabels[normalizeJobStatus(status)] ?? "Không xác định";

export const getJobStatusStyle = (status?: string | null) =>
  jobStatusStyles[normalizeJobStatus(status)] ??
  "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";

export const isPendingReviewJobStatus = (status?: string | null) =>
  normalizeJobStatus(status) === JOB_STATUS.PENDING_REVIEW;

export const isActiveJobStatus = (status?: string | null) =>
  normalizeJobStatus(status) === JOB_STATUS.ACTIVE;

export const isDeletedJobStatus = (status?: string | null) =>
  normalizeJobStatus(status) === JOB_STATUS.DELETED;
