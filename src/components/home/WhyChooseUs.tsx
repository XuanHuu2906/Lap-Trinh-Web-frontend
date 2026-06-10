import { useEffect, useState } from "react";
import {
  BarChart3,
  Clock3,
  ShieldCheck,
  Sparkles,
  Star,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import {
  homeService,
  type HomeFeature,
  type SiteMetric,
  type Testimonial,
} from "@/services/home.service";

const iconMap: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  clock: Clock3,
  chart: BarChart3,
  user: UserCircle,
};

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
};

function FeatureCard({ feature }: { feature: HomeFeature }) {
  const Icon = iconMap[feature.icon] || ShieldCheck;
  const iconClassName = colorMap[feature.color || ""] || colorMap.blue;

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-md">
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="mb-3 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
        {feature.highlight}
      </span>
      <h3 className="mb-2 text-sm font-semibold text-gray-900">
        {feature.title}
      </h3>
      <p className="text-xs leading-6 text-gray-500">{feature.description}</p>
    </article>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {testimonial.avatar || testimonial.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">
              {testimonial.name}
            </p>
            <div className="flex gap-0.5">
              {Array.from({ length: testimonial.rating }).map((_, index) => (
                <Star
                  key={index}
                  className="h-3 w-3 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
          </div>
          <p className="mb-2 text-xs text-gray-500">{testimonial.role}</p>
          <p className="text-xs leading-6 text-gray-600">
            {testimonial.content}
          </p>
        </div>
      </div>
    </article>
  );
}

function WhyChooseUsSkeleton() {
  return (
    <section className="bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mx-auto mb-3 h-6 w-40 rounded-full bg-gray-200" />
          <div className="mx-auto mb-3 h-8 w-72 rounded bg-gray-200" />
          <div className="mx-auto h-4 w-full max-w-xl rounded bg-gray-100" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-48 rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="mb-4 h-11 w-11 rounded-xl bg-gray-200" />
              <div className="mb-3 h-5 w-24 rounded bg-gray-100" />
              <div className="mb-2 h-4 w-36 rounded bg-gray-200" />
              <div className="h-12 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function WhyChooseUs() {
  const [features, setFeatures] = useState<HomeFeature[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [metrics, setMetrics] = useState<SiteMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMoreTestimonials, setIsLoadingMoreTestimonials] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testimonialPage, setTestimonialPage] = useState(1);
  const [hasMoreTestimonials, setHasMoreTestimonials] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadHomeContent = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const [homeResponse, testimonialResponse] = await Promise.all([
          homeService.getHomeContent(),
          homeService.getTestimonials({ page: 1, limit: 2 }),
        ]);

        if (isMounted) {
          setFeatures(homeResponse.data.features);
          setTestimonials(testimonialResponse.data);
          setMetrics(homeResponse.data.metrics);
          setTestimonialPage(testimonialResponse.meta.page);
          setHasMoreTestimonials(
            testimonialResponse.meta.page < testimonialResponse.meta.totalPages,
          );
        }
      } catch {
        if (isMounted) {
          setErrorMessage("Không thể tải nội dung giới thiệu.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadHomeContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoadMoreTestimonials = async () => {
    try {
      setIsLoadingMoreTestimonials(true);

      const nextPage = testimonialPage + 1;
      const response = await homeService.getTestimonials({
        page: nextPage,
        limit: 2,
      });

      setTestimonials((currentTestimonials) => [
        ...currentTestimonials,
        ...response.data,
      ]);
      setTestimonialPage(response.meta.page);
      setHasMoreTestimonials(response.meta.page < response.meta.totalPages);
    } catch {
      setErrorMessage("Không thể tải thêm đánh giá.");
    } finally {
      setIsLoadingMoreTestimonials(false);
    }
  };

  if (isLoading) {
    return <WhyChooseUsSkeleton />;
  }

  if (errorMessage) {
    return (
      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-7xl rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Vì sao chọn chúng tôi
          </span>
          <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
            Tìm việc dễ hơn với HireArch
          </h2>
          <p className="text-sm leading-6 text-gray-500">
            Nền tảng giúp ứng viên tiếp cận cơ hội phù hợp và giúp nhà tuyển
            dụng kết nối đúng người nhanh hơn.
          </p>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          <div className="rounded-2xl bg-linear-to-br from-blue-700 to-indigo-800 p-8 text-white">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-xl font-bold">
              Gợi ý cơ hội phù hợp hơn
            </h3>
            <p className="mb-7 text-sm leading-6 text-blue-100">
              HireArch giúp ứng viên xem nhanh những thông tin quan trọng như
              kỹ năng, mức lương và địa điểm để chọn công việc phù hợp với hồ
              sơ của mình.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="border-l border-white/20 first:border-l-0"
                >
                  <p className="text-xl font-bold">{metric.value}</p>
                  <p className="text-xs text-blue-200">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Ứng viên nói gì về chúng tôi
            </h3>
            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                />
              ))}
            </div>
            {hasMoreTestimonials ? (
              <button
                type="button"
                onClick={handleLoadMoreTestimonials}
                disabled={isLoadingMoreTestimonials}
                className="mt-4 w-full text-center text-sm font-semibold text-blue-700 hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
              >
                {isLoadingMoreTestimonials
                  ? "Đang tải thêm..."
                  : "Xem thêm đánh giá"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
