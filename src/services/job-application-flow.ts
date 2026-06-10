import { applicationService } from "@/services/application.service";
import { clearCandidateDashboardCache } from "@/services/candidate-dashboard-cache";
import { cvService } from "@/services/cv.service";

const PENDING_JOB_KEY = "pendingApplyJobId";

export const savePendingApplyJob = (jobId: number) => {
  localStorage.setItem(PENDING_JOB_KEY, String(jobId));
};

export const getPendingApplyJob = () => {
  const value = Number(localStorage.getItem(PENDING_JOB_KEY));
  return Number.isInteger(value) && value > 0 ? value : null;
};

export const clearPendingApplyJob = () => {
  localStorage.removeItem(PENDING_JOB_KEY);
};

const getUsableCvId = async () => {
  const cvResponse = await cvService.getMyCVs();
  const usableCv =
    cvResponse.data.find((cv) => cv.status === "active") || cvResponse.data[0];

  if (usableCv) return usableCv.id;

  const createdCv = await cvService.create({
    title: "CV mặc định",
    personalInfo: {},
    education: [],
    experience: [],
    skills: [],
  });

  return createdCv.data.id;
};

export const applyToJobWithCandidateCv = async (jobId: number) => {
  const cvId = await getUsableCvId();
  const response = await applicationService.applyToJob({
    jobPostingId: jobId,
    cvId,
  });

  clearCandidateDashboardCache();
  return response;
};

export const completePendingApplyJob = async () => {
  const jobId = getPendingApplyJob();
  if (!jobId) return null;

  try {
    const response = await applyToJobWithCandidateCv(jobId);
    clearPendingApplyJob();
    return response;
  } catch (error) {
    clearPendingApplyJob();
    throw error;
  }
};
