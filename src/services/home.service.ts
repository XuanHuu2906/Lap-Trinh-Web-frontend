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

interface HomeContent {
  features: HomeFeature[];
  testimonials: Testimonial[];
  metrics: SiteMetric[];
}

interface HomeContentResponse {
  success: boolean;
  data: HomeContent;
}

export const homeService = {
  async getHomeContent() {
    const response = await api.get<HomeContentResponse>("/home");
    return response.data;
  },
};
