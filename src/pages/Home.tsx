import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/home/HeroSection";
import FeaturedJobs from "../components/home/FeaturedJobs";
import WhyChooseUs from "../components/home/WhyChooseUs";
import { jobService } from "@/services/job.service";
import type { Job } from "@/types/job.type";

export default function Home() {
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [isLoadingFeaturedJobs, setIsLoadingFeaturedJobs] = useState(true);
  const [featuredJobsError, setFeaturedJobsError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedJobs = async () => {
      try {
        setIsLoadingFeaturedJobs(true);
        setFeaturedJobsError(null);

        const response = await jobService.getFeaturedJobs(6);

        if (isMounted) {
          setFeaturedJobs(response.data);
        }
      } catch {
        if (isMounted) {
          setFeaturedJobsError("Không thể tải việc làm nổi bật.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingFeaturedJobs(false);
        }
      }
    };

    loadFeaturedJobs();

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
      <HeroSection onSearch={handleHeroSearch} />
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
