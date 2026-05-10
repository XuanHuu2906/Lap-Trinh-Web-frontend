import { useNavigate } from "react-router-dom";
import HeroSection from "../components/home/HeroSection";
import FeaturedJobs from "../components/home/FeaturedJobs";
import WhyChooseUs from "../components/home/WhyChooseUs";

const FEATURED_JOBS = [
  {
    id: 1,
    title: "Senior Product Manager",
    company: "TechCorp Enterprise",
    logo: "T",
    logoColor: "bg-indigo-600",
    location: "Hà Nội",
    salary: "$2k – $4k",
    deadline: "Hết hạn 05/01/2025",
    tags: ["Toàn thời gian", "Full-time"],
    field: "IT / Software",
  },
  {
    id: 2,
    title: "Trưởng Phòng Marketing",
    company: "Global Retail Inc",
    logo: "G",
    logoColor: "bg-pink-500",
    location: "Hồ Chí Minh",
    salary: "Thương lượng",
    deadline: "Hết hạn 31/12/2024",
    tags: ["Marketing", "Senior"],
    field: "Marketing",
  },
  {
    id: 3,
    title: "Financial Analyst",
    company: "FinCorp Asia",
    logo: "F",
    logoColor: "bg-amber-600",
    location: "Remote",
    salary: "Lên đến $2,000",
    deadline: "Hết hạn 20/12/2024",
    tags: ["Remote", "Finance"],
    field: "Finance",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <main>
      <HeroSection onSearch={() => navigate("/jobs")} />
      <FeaturedJobs
        jobs={FEATURED_JOBS}
        onViewAll={() => navigate("/jobs")}
        onSelectJob={(job) => navigate(`/jobs/${job.id}`)}
      />
      <WhyChooseUs />
    </main>
  );
}
