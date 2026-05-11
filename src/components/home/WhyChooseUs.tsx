const FEATURES = [
  {
    icon: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
    title: "Nhà tuyển dụng xác thực",
    desc: "100% doanh nghiệp trên nền tảng đều được xác minh kỹ lưỡng, đảm bảo mọi thông tin việc làm an toàn và chuyên nghiệp.",
    color: "bg-blue-50 text-blue-600",
    highlight: "100% xác minh",
  },
  {
    icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
    title: "Quy trình nhanh chóng",
    desc: "Kết nối trực tiếp với HR, giảm thiểu khâu trung gian, tiết kiệm thời gian cho cả ứng viên lẫn nhà tuyển dụng.",
    color: "bg-amber-50 text-amber-600",
    highlight: "Kết nối trực tiếp",
  },
  {
    icon: "M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941",
    title: "Insights chuyên sâu",
    desc: "Cung cấp thông tin thị trường lao động và xu hướng ngành nghề liên tục cập nhật theo thời gian thực.",
    color: "bg-green-50 text-green-600",
    highlight: "Dữ liệu thời gian thực",
  },
  {
    icon: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
    title: "Hồ sơ thông minh",
    desc: "Hệ thống AI tự động phân tích CV và đề xuất vị trí phù hợp nhất với năng lực và định hướng của bạn.",
    color: "bg-purple-50 text-purple-600",
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
    <section className="bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 tracking-wide">
            Vì sao chọn chúng tôi
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Tại sao chọn HireArch?
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Nền tảng tuyển dụng dành riêng cho doanh nghiệp — được xây dựng để
            kết nối đúng người với đúng cơ hội.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div
                className={`w-11 h-11 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d={feature.icon}
                  />
                </svg>
              </div>
              <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-2">
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

        {/* Split layout: left big feature + right testimonials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: highlighted feature block */}
          <div className="bg-linear-to-br from-blue-700 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden">
            {/* Decorative circle */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/5 rounded-full" />
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">
                Hồ sơ thông minh với AI
              </h3>
              <p className="text-blue-200 text-sm leading-relaxed mb-6">
                Hệ thống AI của HireArch tự động phân tích CV, so sánh với hàng
                nghìn vị trí đang tuyển và đề xuất những cơ hội phù hợp nhất với
                bạn — tiết kiệm hàng giờ tìm kiếm thủ công.
              </p>
              <div className="flex gap-4 text-sm">
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
