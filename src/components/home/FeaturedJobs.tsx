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
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
        </button>
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
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Việc làm nổi bật</h2>
          <p className="text-gray-500 text-sm mt-1">Cơ hội tốt nhất hôm nay</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-sm text-blue-700 font-semibold hover:underline flex items-center gap-1"
        >
          Xem tất cả
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </button>
      </div>

      {/* Job grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onSelect={onSelectJob} />
        ))}
      </div>

      {/* CTA Banner */}
      <div className="mt-12 bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
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
