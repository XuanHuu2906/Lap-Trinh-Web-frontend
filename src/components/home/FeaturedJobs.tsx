import { ArrowRight, MapPin } from "lucide-react";

interface Job {
  id: number;
  title: string;
  company: string;
  logo: string;
  logoColor: string;
  location: string;
  salary: string;
  deadline: string;
  tags: string[];
  field: string;
}
interface FeaturedJobsProps {
  jobs: Job[];
  onViewAll?: () => void;
  onSelectJob?: (job: Job) => void;
}

function TagBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
      {children}
    </span>
  );
}

function JobCard({
  job,
  onSelect,
}: {
  job: Job;
  onSelect?: (job: Job) => void;
}) {
  return (
    <div
      onClick={() => onSelect?.(job)}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group"
    >
      {/* Card header */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={`${job.logoColor} w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0`}
        >
          {job.logo}
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-gray-300 hover:text-blue-500 transition-colors"
          aria-label="Lưu việc làm"
        ></button>
      </div>

      {/* Title & company */}
      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 group-hover:text-blue-700 transition-colors">
        {job.title}
      </h3>
      <p className="text-xs text-gray-500 mb-3">{job.company}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.tags.slice(0, 2).map((tag) => (
          <TagBadge key={tag}>{tag}</TagBadge>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin />
          {job.location}
        </span>
        <span className="font-semibold text-green-600">{job.salary}</span>
      </div>
    </div>
  );
}

export default function FeaturedJobs({
  jobs,
  onViewAll,
  onSelectJob,
}: FeaturedJobsProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Việc làm nổi bật</h2>
          <p className="text-gray-500 text-sm mt-1">Cơ hội tốt nhất hôm nay</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-sm text-blue-700 font-semibold group flex items-center gap-1 group hover:transform hover:scale-105 transition-all p-2 rounded-2xl"
        >
          Xem tất cả
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Job grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onSelect={onSelectJob} />
        ))}
      </div>

      {/* CTA Banner */}
      <div className="mt-12 bg-linear-to-r from-blue-400 to-indigo-600 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
        <div>
          <p className="font-bold text-lg mb-1">Không tìm thấy việc phù hợp?</p>
          <p className="text-blue-200 text-sm">
            Tạo thông báo tìm việc để nhận tin ngay khi có việc mới.
          </p>
        </div>
        <button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-sm px-6 py-3 rounded-xl transition-colors whitespace-nowrap shrink-0">
          Tạo thông báo việc làm
        </button>
      </div>
    </section>
  );
}

export type { Job };
