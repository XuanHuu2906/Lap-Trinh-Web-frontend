import { api } from "@/lib/api";
import type { JobsApiResponse } from "@/types/job.type";
import type { CompanyProfileData } from "@/types/company.type";

export const companyService = {
  async getByRecruiterId(recruiterId: number, page = 1, limit = 6) {
    const response = await api.get<JobsApiResponse<CompanyProfileData>>(
      `/companies/${recruiterId}`,
      { params: { page, limit } },
    );

    return response.data;
  },
};
