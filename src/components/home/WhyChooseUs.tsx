import {
  ShieldCheck,
  Clock,
  BarChart,
  UserCircle,
  Astroid,
} from "lucide-react";
const FEATURES = [
  {
    icon: <ShieldCheck />,
    title: "Nhà tuyển dụng xác thực",
    desc: "100% doanh nghiệp trên nền tảng đều được xác minh kỹ lưỡng, đảm bảo mọi thông tin việc làm an toàn và chuyên nghiệp.",
    color: "bg-blue-50 hover:bg-blue-100 text-blue-600",
    highlight: "100% xác minh",
  },
  {
    icon: <Clock />,
    title: "Quy trình nhanh chóng",
    desc: "Kết nối trực tiếp với HR, giảm thiểu khâu trung gian, tiết kiệm thời gian cho cả ứng viên lẫn nhà tuyển dụng.",
    color: "bg-amber-50 hover:bg-amber-100 text-amber-600",
    highlight: "Kết nối trực tiếp",
  },
  {
    icon: <BarChart />,
    title: "Insights chuyên sâu",
    desc: "Cung cấp thông tin thị trường lao động và xu hướng ngành nghề liên tục cập nhật theo thời gian thực.",
    color: "bg-green-50 hover:bg-green-100 text-green-600",
    highlight: "Dữ liệu thời gian thực",
  },
  {
    icon: <UserCircle />,
    title: "Hồ sơ thông minh",
    desc: "Hệ thống AI tự động phân tích CV và đề xuất vị trí phù hợp nhất với năng lực và định hướng của bạn.",
    color: "bg-purple-50 hover:bg-purple-100 text-purple-600",
    highlight: "Gợi ý bằng AI",
  },
];

const TESTIMONIALS = [
  {
    name: "Nguyễn Minh Trí",
    role: "Senior Developer tại TechCorp",
    avatar: "MT",
    text: "Tôi tìm được công việc mơ ước chỉ sau 2 tuần đăng ký. Quy trình nhanh chóng và nhà tuyển dụng rất chuyên nghiệp.",
  },
  {
    name: "Trần Thị Lan",
    role: "Marketing Manager tại Retail Inc",
    avatar: "TL",
    text: "HireArch giúp tôi kết nối với hơn 5 nhà tuyển dụng chất lượng cùng lúc. Rất tiết kiệm thời gian!",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-gray-50 py-16 px-4 ">
      <div className="max-w-7xl  mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-blue-50 text-blue-700 text-2xl font-semibold px-3 py-1 rounded-full mb-3 tracking-wide">
            Vì sao chọn chúng tôi
          </span>
          <h2 className="text-2xl text-blue-600 sm:text-3xl font-bold  mb-3">
            Tại sao chọn HireArch?
          </h2>
          <p className="flex items-center justify-center text-gray-500 text-sm ">
            Nền tảng tuyển dụng dành riêng cho doanh nghiệp — được xây dựng để
            kết nối đúng người với đúng cơ hội.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all group "
            >
              <div
                className={`w-11 h-11 ${feature.color} rounded-2xl flex items-center justify-center mb-4`}
              >
                {feature.icon}
              </div>
              <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-2 ">
                {feature.highlight}
              </span>
              <h3 className="font-semibold text-gray-900 text-sm mb-2">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="bg-linear-to-br from-blue-700 to-indigo-800 rounded-2xl p-8 text-white">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5">
                <Astroid className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                Hồ sơ thông minh với AI
              </h3>
              <p className="text-blue-200 text-sm leading-relaxed mb-6">
                Hệ thống AI của HireArch tự động phân tích CV, so sánh với hàng
                nghìn vị trí đang tuyển và đề xuất những cơ hội phù hợp nhất với
                bạn — tiết kiệm hàng giờ tìm kiếm thủ công.
              </p>
              <div className="flex gap-4 justify-center text-sm">
                <div>
                  <p className="font-bold text-xl">3x</p>
                  <p className="text-blue-300 text-xs">Nhanh hơn</p>
                </div>
                <div className="border-l border-white/20 pl-4">
                  <p className="font-bold text-xl">92%</p>
                  <p className="text-blue-300 text-xs">Tỷ lệ phù hợp</p>
                </div>
                <div className="border-l border-white/20 pl-4">
                  <p className="font-bold text-xl">24/7</p>
                  <p className="text-blue-300 text-xs">Hỗ trợ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Testimonials */}
          <div className="space-y-4">
            <p className="font-semibold text-gray-900 mb-4">
              Ứng viên nói gì về chúng tôi
            </p>
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                    {t.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        {t.name}
                      </p>
                      {/* Stars */}
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className="w-3 h-3 text-amber-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{t.role}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {t.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button className="w-full text-center text-sm text-blue-700 font-medium hover:underline mt-2">
              Xem thêm đánh giá →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
