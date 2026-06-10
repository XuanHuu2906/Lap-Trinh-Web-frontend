import type { CandidateApplication } from "@/services/application.service";
import type { Job } from "@/types/job.type";

export type CandidateDashboardCacheData = {
  applications: CandidateApplication[];
  applicationTotal: number;
  suggestedJobs: Job[];
  cvCount: number;
  unreadNotificationCount: number;
  loadedAt: number;
};

const DASHBOARD_CACHE_TTL = 5 * 60 * 1000;
let dashboardCache: CandidateDashboardCacheData | null = null;

export const getCandidateDashboardCache = () => {
  if (!dashboardCache) return null;

  const isFresh = Date.now() - dashboardCache.loadedAt < DASHBOARD_CACHE_TTL;
  return isFresh ? dashboardCache : null;
};

export const setCandidateDashboardCache = (
  data: CandidateDashboardCacheData,
) => {
  dashboardCache = data;
};

export const clearCandidateDashboardCache = () => {
  dashboardCache = null;
};
