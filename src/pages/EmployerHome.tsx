import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Gem,
  Headphones,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const benefitItems = [
  {
    icon: Users,
    title: "Nguồn ứng viên chất lượng",
    body: "Tiếp cận hồ sơ ứng viên theo ngành nghề, kinh nghiệm và khu vực tuyển dụng.",
  },
  {
    icon: Gem,
    title: "Trải nghiệm quản lý toàn diện",
    body: "Theo dõi tin đăng, hồ sơ ứng tuyển và trạng thái xử lý ngay trong dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Tin tuyển dụng rõ ràng",
    body: "Quy trình đăng tin giúp thông tin tuyển dụng nhất quán và dễ được ứng viên tin tưởng.",
  },
  {
    icon: Headphones,
    title: "Hỗ trợ nhà tuyển dụng",
    body: "Luồng tư vấn, thông báo và phản hồi giúp đội tuyển dụng không bỏ lỡ ứng viên phù hợp.",
  },
];

const processItems = [
  "Đăng tin tuyển dụng",
  "Nhận hồ sơ ứng viên",
  "Lọc và trao đổi",
  "Tuyển đúng người",
];

export default function EmployerHome() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const postJobPath =
    isAuthenticated && user?.role === "recruiter"
      ? "/recruiter/post-job"
      : "/register-employer";

  return (
    <main className="min-h-screen bg-[#111313] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.24),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.16),transparent_28%)]" />
        <div className="relative mx-auto grid min-h-155 max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <div className="mb-9 h-2 w-18 bg-violet-600" />
            <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-slate-100 sm:text-5xl lg:text-6xl">
              Nơi gặp gỡ giữa doanh nghiệp và ứng viên chất lượng
            </h1>
            <p className="mt-6 max-w-xl text-base font-semibold leading-8 text-slate-200">
              Tuyển người dễ dàng hơn với HireArch. Đăng tin, quản lý hồ sơ và
              theo dõi ứng viên trong một không gian làm việc gọn gàng.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(postJobPath)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-violet-600 px-8 text-sm font-bold text-white transition hover:bg-violet-500"
              >
                Đăng tin ngay
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/15 px-6 text-sm font-bold text-slate-200 transition hover:border-white/40 hover:text-white"
              >
                Đăng nhập nhà tuyển dụng
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-[2rem] bg-violet-600/15 blur-2xl" />
            <div className="relative overflow-hidden rounded-sm bg-white p-6 text-slate-950 shadow-2xl">
              <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-2xl bg-[#f3f6ff] p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                      AI đang phân tích
                    </span>
                    <BarChart3 className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="space-y-3">
                    {[
                      ["Frontend Developer", "89% phù hợp"],
                      ["Backend Engineer", "82% phù hợp"],
                      ["Marketing Intern", "76% phù hợp"],
                    ].map(([name, score]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{name}</p>
                          <p className="text-xs text-slate-500">Ứng viên mới</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600">
                          {score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl bg-slate-950 p-5 text-white">
                  <div>
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500">
                      <BriefcaseBusiness className="h-7 w-7" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">
                      Nhanh hơn, dễ dàng hơn
                    </p>
                    <h2 className="mt-3 text-2xl font-black leading-tight">
                      Quản lý tuyển dụng từ tin đăng đến hồ sơ
                    </h2>
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-2xl font-black">24h</p>
                      <p className="mt-1 text-xs text-slate-300">
                        phản hồi nhanh
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-2xl font-black">+68%</p>
                      <p className="mt-1 text-xs text-slate-300">
                        hồ sơ phù hợp
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-4 py-18 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <div className="mx-auto mb-7 h-2 w-18 bg-sky-500" />
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">
              HireArch giúp đội tuyển dụng vận hành rõ ràng hơn
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {benefitItems.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="grid gap-5 border border-white/10 bg-white/3 p-6 transition hover:border-violet-400/60 hover:bg-white/6 sm:grid-cols-[72px_1fr]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-sky-400/40 bg-sky-400/10 text-sky-300">
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black">{title}</h3>
                  <p className="mt-3 max-w-xl text-sm font-semibold leading-7 text-slate-300">
                    {body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl border border-white/10 bg-white/4 p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-4">
            {processItems.map((item, index) => (
              <div key={item} className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-black">
                  {index + 1}
                </div>
                <p className="text-sm font-bold text-slate-100">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={() => navigate(postJobPath)}
        className="fixed bottom-6 right-6 z-40 hidden rounded-lg bg-sky-500 px-5 py-4 text-left text-sm font-bold text-white shadow-xl shadow-sky-950/30 transition hover:bg-sky-400 lg:block"
      >
        <span className="mb-2 flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Trợ giúp tư vấn
        </span>
        nhà tuyển dụng
      </button>
    </main>
  );
}
