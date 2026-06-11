import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/home/HeroSection";
import FeaturedJobs from "../components/home/FeaturedJobs";
import WhyChooseUs from "../components/home/WhyChooseUs";
import { homeService, type SystemStats } from "@/services/home.service";
import { jobService } from "@/services/job.service";
import type { Job } from "@/types/job.type";

export default function Home() {
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [isLoadingFeaturedJobs, setIsLoadingFeaturedJobs] = useState(true);
  const [featuredJobsError, setFeaturedJobsError] = useState<string | null>(
    null,
  );
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      try {
        setIsLoadingFeaturedJobs(true);
        setFeaturedJobsError(null);

        const [featuredResponse, homeResponse] = await Promise.allSettled([
          jobService.getFeaturedJobs(6),
          homeService.getHomeContent(),
        ]);

        if (!isMounted) return;

        if (featuredResponse.status === "fulfilled") {
          setFeaturedJobs(featuredResponse.value.data);
        } else {
          setFeaturedJobsError("Không thể tải việc làm nổi bật.");
        }

        if (homeResponse.status === "fulfilled") {
          setSystemStats(homeResponse.value.data.systemStats);
        }
      } finally {
        if (isMounted) {
          setIsLoadingFeaturedJobs(false);
        }
      }
    };

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleHeroSearch = (keyword: string, location: string) => {
    const params = new URLSearchParams();
    const trimmedKeyword = keyword.trim();
    const trimmedLocation = location.trim();

    if (trimmedKeyword) {
      params.set("keyword", trimmedKeyword);
    }

    if (trimmedLocation) {
      params.set("location", trimmedLocation);
    }

    const queryString = params.toString();
    navigate(queryString ? `/jobs?${queryString}` : "/jobs");
  };

  return (
    <main className="bg-white">
      <HeroSection
        onSearch={handleHeroSearch}
        featuredJobs={featuredJobs}
        isLoadingFeaturedJobs={isLoadingFeaturedJobs}
        systemStats={systemStats}
      />
      <FeaturedJobs
        jobs={featuredJobs}
        isLoading={isLoadingFeaturedJobs}
        errorMessage={featuredJobsError}
        onViewAll={() => navigate("/jobs")}
        onSelectJob={(job) => navigate(`/jobs/${job.id}`)}
      />
      <WhyChooseUs />
    </main>
  );
}
