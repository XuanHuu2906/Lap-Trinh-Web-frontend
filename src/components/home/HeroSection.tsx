import { useState } from "react";

interface HeroSectionProps {
  onSearch?: (keyword: string, location: string) => void;
}

const POPULAR_SEARCHES = [
  "Frontend Developer",
  "Marketing Manager",
  "Data Analyst",
  "Product Manager",
];

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    onSearch?.(keyword, location);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <section className="bg-linear-to-br from-blue-700 via-blue-800 to-indigo-900 text-white py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        {/* Badge */}
        <span className="inline-block bg-blue-600/50 border border-blue-400/40 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide">
          🚀 Hơn 10,000+ việc làm đang chờ bạn
        </span>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
          Tìm việc làm phù hợp <br className="hidden sm:block" />
          với bạn
        </h1>
        <p className="text-blue-200 text-base sm:text-lg mb-10 max-w-xl mx-auto">
          Kết nối bạn với các cơ hội nghề nghiệp hàng đầu từ các doanh nghiệp uy
          tín.
        </p>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
          {/* Keyword input */}
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
            <svg
              className="w-4 h-4 text-gray-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Chức danh, từ khóa hoặc công ty"
              className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Location input */}
          <div className="sm:w-48 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
            <svg
              className="w-4 h-4 text-gray-400 shrink-0"
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
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tất cả địa điểm"
              className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Submit button */}
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 justify-center"
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
                strokeWidth={2}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            TÌM KIẾM
          </button>
        </div>

        {/* Popular searches */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-blue-300 text-xs">Tìm kiếm phổ biến:</span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              onClick={() => {
                setKeyword(term);
                onSearch?.(term, location);
              }}
              className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-1 rounded-full transition-colors"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { num: "10,000+", label: "Việc làm" },
            { num: "5,000+", label: "Doanh nghiệp" },
            { num: "500K+", label: "Ứng viên" },
            { num: "98%", label: "Hài lòng" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl font-bold text-white">{stat.num}</p>
              <p className="text-xs text-blue-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
