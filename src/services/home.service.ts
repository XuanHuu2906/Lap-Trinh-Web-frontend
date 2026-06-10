import { api } from "@/lib/api";

export interface HomeFeature {
  id: number;
  icon: string;
  title: string;
  description: string;
  highlight: string;
  color?: string | null;
  order: number;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar?: string | null;
  content: string;
  rating: number;
  order: number;
}

export interface SiteMetric {
  id: number;
  value: string;
  label: string;
  order: number;
}

export interface SystemStats {
  activeJobs: number;
  recruiters: number;
  candidates: number;
  locations: number;
}

interface HomeContent {
  features: HomeFeature[];
  testimonials: Testimonial[];
  metrics: SiteMetric[];
  systemStats: SystemStats;
}

interface HomeContentResponse {
  success: boolean;
  data: HomeContent;
}

interface TestimonialsResponse {
  success: boolean;
  data: Testimonial[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const homeService = {
  async getHomeContent() {
    const response = await api.get<HomeContentResponse>("/home");
    return response.data;
  },

  async getTestimonials(params: { page?: number; limit?: number } = {}) {
    const response = await api.get<TestimonialsResponse>("/home/testimonials", {
      params,
    });
    return response.data;
  },
};
