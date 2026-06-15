import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  BookmarkX,
  BriefcaseBusiness,
  MapPin,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { getCachedSavedJobs, jobService } from "@/services/job.service";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import type { Job } from "@/types/job.type";

type SavedJob = {
  id: number;
  userId: number;
  jobPostingId: number;
  savedAt: string;
  jobPosting: Job;
};

type SummaryCardInfo = {
  label: string;
  value: string;
  icon: LucideIcon;
};

function getCompanyName(job: Job) {
  return job.recruiter?.recruiterProfile?.companyName || "Không rõ công ty";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatSalary(job: Job) {
  if (job.salaryUnit === "negotiable") return "Thỏa thuận";
  if (!job.salaryMin && !job.salaryMax) return "Thỏa thuận";

  if (job.salaryMin && job.salaryMax) {
    return `${formatMoney(job.salaryMin)} - ${formatMoney(job.salaryMax)}`;
  }

  if (job.salaryMin) return `Từ ${formatMoney(job.salaryMin)}`;

  return `Đến ${formatMoney(job.salaryMax || 0)}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Chưa có";

  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function PageHeader() {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-bold leading-tight text-slate-950 dark:text-white">
          Việc làm đã lưu
        </h1>
      </div>

      <Link
        to="/candidate/job-search"
        className="inline-flex h-10 items-center gap-2 bg-slate-950 px-5 text-xs font-bold uppercase text-white transition hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
      >
        Tìm việc thêm
        <BriefcaseBusiness className="h-4 w-4" />
      </Link>
    </div>
  );
}

function SummaryCard({ item }: { item: SummaryCardInfo }) {
  const Icon = item.icon;

  return (
    <section className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {item.label}
          </p>
          <p className="mt-3 text-4xl font-black leading-none text-slate-950 dark:text-white">
            {item.value}
          </p>
        </div>
        <Icon className="h-6 w-6 text-slate-300 dark:text-slate-600" />
      </div>
    </section>
  );
}

function SummaryGrid({ cards }: { cards: SummaryCardInfo[] }) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2">
      {cards.map((card) => (
        <SummaryCard key={card.label} item={card} />
      ))}
    </div>
  );
}

function SavedJobsPanel({
  savedJobs,
  isLoading,
  error,
  removingId,
  onRemove,
}: {
  savedJobs: SavedJob[];
  isLoading: boolean;
  error: string | null;
  removingId: number | null;
  onRemove: (jobPostingId: number) => void;
}) {
  return (
    <section className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Danh sách công việc đã lưu
        </h2>
      </div>

      <SavedJobsContent
        savedJobs={savedJobs}
        isLoading={isLoading}
        error={error}
        removingId={removingId}
        onRemove={onRemove}
      />
    </section>
  );
}

function SavedJobsContent({
  savedJobs,
  isLoading,
  error,
  removingId,
  onRemove,
}: {
  savedJobs: SavedJob[];
  isLoading: boolean;
  error: string | null;
  removingId: number | null;
  onRemove: (jobPostingId: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="px-6 py-10 text-sm text-slate-500 dark:text-slate-400">
        Đang tải danh sách việc làm đã lưu...
      </div>
    );
  }

  if (error) {
    return <div className="px-6 py-10 text-sm text-red-500">{error}</div>;
  }

  if (savedJobs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {savedJobs.map((savedJob) => (
        <SavedJobItem
          key={savedJob.id}
          savedJob={savedJob}
          removingId={removingId}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-14 text-center">
      <BookmarkX className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
      <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Bạn chưa lưu việc làm nào.
      </p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
        Vào mục tìm việc làm và bấm lưu để dữ liệu xuất hiện ở đây.
      </p>
    </div>
  );
}

function SavedJobItem({
  savedJob,
  removingId,
  onRemove,
}: {
  savedJob: SavedJob;
  removingId: number | null;
  onRemove: (jobPostingId: number) => void;
}) {
  const job = savedJob.jobPosting;

  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <Link
          to={`/candidate/companies/${job.recruiterId}`}
          title={`Xem hồ sơ ${getCompanyName(job)}`}
          className="rounded-xl shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-2 hover:ring-blue-400 dark:ring-slate-700"
        >
          <CompanyLogo
            name={getCompanyName(job)}
            logoUrl={job.recruiter?.recruiterProfile?.logoUrl}
            className="h-12 w-12 rounded-xl text-sm"
            imageClassName="p-1.5"
          />
        </Link>

        <div className="min-w-0">
          <Link
            to={`/candidate/jobs/${job.id}`}
            className="line-clamp-1 text-sm font-bold text-slate-950 hover:text-blue-600 dark:text-white dark:hover:text-indigo-400"
          >
            {job.title}
          </Link>
          <Link
            to={`/candidate/companies/${job.recruiterId}`}
            className="mt-1 inline-block text-xs text-slate-500 transition hover:text-blue-600 hover:underline dark:text-slate-400 dark:hover:text-indigo-400"
          >
            {getCompanyName(job)}
          </Link>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location || "Không rõ địa điểm"}
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatSalary(job)}
            </span>
            <span>Đã lưu: {formatDate(savedJob.savedAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          to={`/candidate/jobs/${job.id}`}
          className="border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Xem chi tiết
        </Link>
        <button
          type="button"
          onClick={() => onRemove(job.id)}
          disabled={removingId === job.id}
          className="flex h-9 w-9 items-center justify-center border border-red-100 text-red-500 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-950/40 dark:hover:bg-red-950/20"
          title="Bỏ lưu"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function SavedJobs() {
  const cachedSavedJobs = getCachedSavedJobs();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(
    cachedSavedJobs?.data ?? [],
  );
  const [isLoading, setIsLoading] = useState(!cachedSavedJobs);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSavedJobs = async () => {
      try {
        if (!getCachedSavedJobs()) setIsLoading(true);
        setError(null);

        const response = await jobService.getSavedJobs({ page: 1, limit: 50 });
        if (isMounted) setSavedJobs(response.data);
      } catch {
        if (isMounted) {
          setError("Không thể tải danh sách việc làm đã lưu.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadSavedJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  const summaryCards: SummaryCardInfo[] = useMemo(
    () => [
      {
        label: "Tổng số đã lưu",
        value: savedJobs.length.toString().padStart(2, "0"),
        icon: Bookmark,
      },
      {
        label: "Lưu gần nhất",
        value: formatDate(savedJobs[0]?.savedAt),
        icon: BookmarkX,
      },
    ],
    [savedJobs],
  );

  const handleRemove = async (jobPostingId: number) => {
    try {
      setRemovingId(jobPostingId);
      await jobService.unSaveJob(jobPostingId);
      setSavedJobs((currentJobs) =>
        currentJobs.filter((item) => item.jobPostingId !== jobPostingId),
      );
    } catch {
      setError("Không thể bỏ lưu việc làm này.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <PageHeader />

      <SummaryGrid cards={summaryCards} />

      <SavedJobsPanel
        savedJobs={savedJobs}
        isLoading={isLoading}
        error={error}
        removingId={removingId}
        onRemove={handleRemove}
      />
    </div>
  );
}
