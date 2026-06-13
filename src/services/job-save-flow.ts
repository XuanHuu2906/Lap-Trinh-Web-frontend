import { jobService } from "@/services/job.service";

const PENDING_SAVE_JOB_KEY = "pendingSaveJobId";
const PENDING_APPLY_JOB_KEY = "pendingApplyJobId";

export const savePendingSaveJob = (jobId: number) => {
  localStorage.removeItem(PENDING_APPLY_JOB_KEY);
  localStorage.setItem(PENDING_SAVE_JOB_KEY, String(jobId));
};

export const getPendingSaveJob = () => {
  const value = Number(localStorage.getItem(PENDING_SAVE_JOB_KEY));
  return Number.isInteger(value) && value > 0 ? value : null;
};

export const clearPendingSaveJob = () => {
  localStorage.removeItem(PENDING_SAVE_JOB_KEY);
};

export const completePendingSaveJob = async () => {
  const jobId = getPendingSaveJob();
  if (!jobId) return null;

  try {
    const response = await jobService.saveJob(jobId);
    return response;
  } catch (error: any) {
    if (error?.response?.status === 409) return null;
    throw error;
  } finally {
    clearPendingSaveJob();
  }
};
