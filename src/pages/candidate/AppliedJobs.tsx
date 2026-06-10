import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  FileText,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  applicationService,
  getCachedMyApplications,
  type CandidateApplication,
} from "@/services/application.service";

const statusOptions = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Đang chờ", value: "pending" },
  { label: "Đang xem", value: "reviewing" },
  { label: "Đã tiếp nhận", value: "accepted" },
  { label: "Từ chối", value: "rejected" },
];

const statusMap: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Đang chờ",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  reviewing: {
    label: "Đang xem",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },
  accepted: {
    label: "Đã tiếp nhận",
    className: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300",
  },
  rejected: {
    label: "Từ chối",
    className: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
};

const formatDate = (value?: string) => {
  if (!value) return "Không rõ";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
};

const companyName = (item: CandidateApplication) =>
  item.jobPosting?.recruiter?.recruiterProfile?.companyName ||
  "Không rõ công ty";

export default function AppliedJobs() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const initialParams = { page: 1, limit: 50, status: undefined };
  const cachedApplications = getCachedMyApplications(initialParams);
  const [applications, setApplications] = useState<CandidateApplication[]>(
    cachedApplications?.data ?? [],
  );
  const [isLoading, setIsLoading] = useState(!cachedApplications);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async () => {
      const params = {
        page: 1,
        limit: 50,
        status: status || undefined,
      };

      try {
        if (!getCachedMyApplications(params)) {
          setIsLoading(true);
        }
        setError(null);

        const response = await applicationService.getMyApplications(params);

        if (isMounted) {
          setApplications(response.data);
        }
      } catch {
        if (isMounted) {
          setError("Không thể tải danh sách ứng tuyển.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, [status]);

  const filteredApplications = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return applications;

    return applications.filter((item) => {
      const title = item.jobPosting?.title?.toLowerCase() || "";
      const company = companyName(item).toLowerCase();
      return title.includes(keyword) || company.includes(keyword);
    });
  }, [applications, search]);

  const counters = [
    {
      label: "Tổng số đã nộp",
      value: applications.length,
      icon: FileText,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300",
    },
    {
      label: "Đang chờ",
      value: applications.filter((item) => item.status === "pending").length,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/40 dark:text-yellow-300",
    },
    {
      label: "Đã tiếp nhận",
      value: applications.filter((item) => item.status === "accepted").length,
      icon: ShieldCheck,
      color: "text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-300",
    },
    {
      label: "Từ chối",
      value: applications.filter((item) => item.status === "rejected").length,
      icon: XCircle,
      color: "text-red-500 bg-red-50 dark:bg-red-950/40 dark:text-red-300",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold leading-tight text-slate-900 dark:text-white">
          Quản lý ứng tuyển
        </h1>
        <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-400">
          Theo dõi trạng thái và phản hồi từ các vị trí bạn đã nộp hồ sơ.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {counters.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {value}
                </p>
                <p className="text-[11px] text-slate-400">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="relative min-w-64 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm vị trí, công ty..."
              className="h-10 w-full border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {[
                  "Vị trí ứng tuyển",
                  "Công ty",
                  "Ngày nộp",
                  "CV đã gửi",
                  "Trạng thái",
                  "Thao tác",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-sm text-slate-500">
                    Đang tải danh sách ứng tuyển...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-sm text-slate-500">
                    Chưa có đơn ứng tuyển phù hợp.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((item) => {
                  const statusInfo = statusMap[item.status] || statusMap.pending;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-50 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-6 py-4">
                        <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                          {item.jobPosting?.title || "Không rõ vị trí"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.jobPosting?.skills
                            ?.map((skill) => skill.skill.name)
                            .join(", ") || "Không có kỹ năng"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-600 dark:text-slate-300">
                        {companyName(item)}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-400">
                        {formatDate(item.appliedAt)}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-blue-600 dark:text-indigo-400">
                        {item.cv?.title || `CV #${item.cvId}`}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-sm px-2 py-1 text-[11px] font-semibold ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="border border-slate-200 px-3 py-1 text-[12px] text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
