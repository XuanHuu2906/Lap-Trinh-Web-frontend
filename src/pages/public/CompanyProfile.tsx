import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { companyService } from "@/services/company.service";
import type { CompanyProfileData } from "@/types/company.type";
import type { Job } from "@/types/job.type";

type CompanyProfileVariant = "public" | "candidate";

const jobTypeLabels: Record<string, string> = {
  full_time: "Toàn thời gian",
  part_time: "Bán thời gian",
  remote: "Làm từ xa",
  internship: "Thực tập",
  contract: "Hợp đồng",
};

const formatSalary = (job: Job) => {
  if (job.salaryUnit === "negotiable" || (!job.salaryMin && !job.salaryMax)) {
    return "Thỏa thuận";
  }

  const format = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(Number(value));

  if (job.salaryMin && job.salaryMax) {
    return `${format(job.salaryMin)} - ${format(job.salaryMax)} VNĐ`;
  }

  return job.salaryMin
    ? `Từ ${format(job.salaryMin)} VNĐ`
    : `Đến ${format(job.salaryMax || 0)} VNĐ`;
};

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN").format(new Date(value))
    : "Không giới hạn";

const normalizeWebsite = (website: string) =>
  /^https?:\/\//i.test(website) ? website : `https://${website}`;

export default function CompanyProfile({
  variant = "public",
}: {
  variant?: CompanyProfileVariant;
}) {
  const { recruiterId } = useParams<{ recruiterId: string }>();
  const navigate = useNavigate();
  const isCandidatePage = variant === "candidate";
  const [data, setData] = useState<CompanyProfileData | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = Number(recruiterId);
    if (!Number.isInteger(id) || id <= 0) {
      setError("Mã công ty không hợp lệ.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadCompany = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await companyService.getByRecruiterId(id, page);
        if (isMounted) setData(response.data);
      } catch {
        if (isMounted) {
          setError("Không tìm thấy công ty hoặc máy chủ chưa sẵn sàng.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCompany();

    return () => {
      isMounted = false;
    };
  }, [page, recruiterId]);

  const openJob = (jobId: number) => {
    navigate(isCandidatePage ? `/candidate/jobs/${jobId}` : `/jobs/${jobId}`);
  };

  if (isLoading && !data) {
    return <CompanyLoading />;
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl py-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-900">
          <Building2 size={38} />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">
          Không tìm thấy công ty
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{error}</p>
        <button
          type="button"
          onClick={() =>
            navigate(isCandidatePage ? "/candidate/job-search" : "/jobs")
          }
          className="mt-7 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Quay lại tìm việc
        </button>
      </div>
    );
  }

  const { company, jobs, meta } = data;
  const pageClass = isCandidatePage
    ? "mx-auto w-full max-w-7xl"
    : "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8";

  return (
    <div className={pageClass}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold text-slate-500 transition hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-300"
      >
        <ArrowLeft size={16} />
        Quay lại
      </button>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_-35px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900">
        <div className="relative h-48 overflow-hidden bg-slate-950 sm:h-60">
          <div className="absolute inset-0 bg-[linear-gradient(115deg,#0f172a_0%,#172554_42%,#1d4ed8_100%)]" />
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-cyan-400/30 blur-3xl" />
          <div className="absolute bottom-[-8rem] left-[18%] h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="absolute right-8 top-8 hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur sm:flex">
            <BadgeCheck className="h-4 w-4 text-cyan-300" />
            Doanh nghiệp trên HireArch
          </div>
          <div className="absolute bottom-6 left-6 max-w-sm text-white/70 sm:left-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em]">
              Company profile
            </p>
          </div>
        </div>

        <div className="relative px-5 pb-6 sm:px-8">
          <div className="-mt-16 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end">
            <CompanyLogo
              name={company.companyName}
              logoUrl={company.logoUrl}
              className="h-28 w-28 rounded-3xl border-[5px] border-white text-4xl shadow-xl ring-1 ring-slate-200 sm:h-32 sm:w-32 dark:border-slate-900 dark:ring-slate-700"
              imageClassName="p-2"
            />

            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                  {company.companyName}
                </h1>
                <BadgeCheck className="h-5 w-5 shrink-0 fill-blue-600 text-white dark:text-slate-900" />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} className="text-blue-600" />
                  {company.address || "Chưa cập nhật địa chỉ"}
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Đang tuyển {company.activeJobCount} vị trí
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pb-1">
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("company-jobs")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
              >
                <BriefcaseBusiness size={16} />
                Xem việc làm
              </button>
              {company.website ? (
                <a
                  href={normalizeWebsite(company.website)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-blue-950/40"
                >
                  <Globe2 size={16} />
                  Website
                  <ExternalLink size={13} />
                </a>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex gap-7 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
            <span className="border-b-2 border-blue-600 pb-3 font-bold text-blue-700 dark:text-blue-300">
              Tổng quan
            </span>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("company-jobs")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="pb-3 font-semibold text-slate-500 transition hover:text-blue-700 dark:text-slate-400"
            >
              Việc làm ({company.activeJobCount})
            </button>
          </div>
        </div>
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-5 lg:sticky lg:top-24">
          <ProfileCard title="Giới thiệu" icon={<Sparkles size={18} />}>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
              {company.description ||
                "Doanh nghiệp chưa cập nhật phần giới thiệu."}
            </p>
          </ProfileCard>

          <ProfileCard title="Thông tin doanh nghiệp" icon={<Building2 size={18} />}>
            <div className="space-y-1">
              <ContactRow
                icon={UserRound}
                label="Người liên hệ"
                value={company.contactName || "Chưa cập nhật"}
              />
              <ContactRow
                icon={Phone}
                label="Điện thoại"
                value={company.phone || "Chưa cập nhật"}
                href={company.phone ? `tel:${company.phone}` : undefined}
              />
              <ContactRow
                icon={Mail}
                label="Email"
                value={company.email}
                href={`mailto:${company.email}`}
              />
              <ContactRow
                icon={MapPin}
                label="Địa chỉ"
                value={company.address || "Chưa cập nhật"}
              />
              <ContactRow
                icon={CalendarDays}
                label="Tham gia HireArch"
                value={formatDate(company.createdAt)}
              />
            </div>
          </ProfileCard>
        </aside>

        <main id="company-jobs" className="min-w-0 scroll-mt-28">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                Cơ hội nghề nghiệp
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                Việc làm đang tuyển
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Khám phá các vị trí mới nhất từ {company.companyName}.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              {meta.total} vị trí
            </span>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900">
              <BriefcaseBusiness className="mx-auto text-slate-300" size={44} />
              <p className="mt-4 font-semibold text-slate-700 dark:text-slate-200">
                Công ty hiện chưa có vị trí đang tuyển.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <CompanyJobCard key={job.id} job={job} onOpen={openJob} />
              ))}
            </div>
          )}

          {meta.totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-3">
              <PaginationButton
                label="Trang trước"
                disabled={page === 1 || isLoading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft size={17} />
              </PaginationButton>
              <span className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                {page} / {meta.totalPages}
              </span>
              <PaginationButton
                label="Trang sau"
                disabled={page === meta.totalPages || isLoading}
                onClick={() =>
                  setPage((current) => Math.min(meta.totalPages, current + 1))
                }
              >
                <ChevronRight size={17} />
              </PaginationButton>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function CompanyJobCard({
  job,
  onOpen,
}: {
  job: Job;
  onOpen: (jobId: number) => void;
}) {
  const skills =
    job.skills?.map((item) => item.skill.name).filter(Boolean).slice(0, 3) ?? [];

  return (
    <article
      onClick={() => onOpen(job.id)}
      className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
          <BriefcaseBusiness size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {job.category?.name || "Chưa phân loại"}
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {jobTypeLabels[job.jobType] || job.jobType}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-950 transition group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
                {job.title}
              </h3>
            </div>
            <span className="hidden rounded-full bg-blue-50 p-2 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white sm:inline-flex dark:bg-blue-950/50 dark:text-blue-300">
              <ArrowUpRight size={17} />
            </span>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-slate-500 dark:text-slate-400 sm:grid-cols-3">
            <JobMeta icon={<MapPin size={15} />} value={job.location || "Chưa cập nhật"} />
            <JobMeta icon={<Banknote size={15} />} value={formatSalary(job)} accent />
            <JobMeta
              icon={<Clock3 size={15} />}
              value={`Hạn ${formatDate(job.expiresAt)}`}
            />
          </div>

          {skills.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ProfileCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2 text-slate-950 dark:text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
          {icon}
        </span>
        <h2 className="font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
        <span className="mt-0.5 block break-words text-sm font-semibold text-slate-700 dark:text-slate-200">
          {value}
        </span>
      </span>
    </>
  );

  const className =
    "flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/70";

  return href ? (
    <a href={href} className={className}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}

function JobMeta({
  icon,
  value,
  accent = false,
}: {
  icon: ReactNode;
  value: string;
  accent?: boolean;
}) {
  return (
    <span
      className={`flex min-w-0 items-center gap-2 ${
        accent ? "font-semibold text-emerald-600 dark:text-emerald-400" : ""
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{value}</span>
    </span>
  );
}

function PaginationButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
    >
      {children}
    </button>
  );
}

function CompanyLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse">
      <div className="h-60 rounded-3xl bg-slate-200 dark:bg-slate-800" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>
      <span className="sr-only">
        <Loader2 className="animate-spin" />
        Đang tải hồ sơ công ty
      </span>
    </div>
  );
}
