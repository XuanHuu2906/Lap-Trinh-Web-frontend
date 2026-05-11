import { MapPin, Search } from "lucide-react";
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
const STATS = [
  { num: "10,000+", label: "Việc làm" },
  { num: "5,000+", label: "Doanh nghiệp" },
  { num: "500K+", label: "Ứng viên" },
  { num: "98%", label: "Hài lòng" },
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
    <section className="bg-linear-to-br from-blue-700 to-red-200 text-white py-20 px-4">
      <div className="max-w-auto mx-auto text-center">
        <span className="inline-block bg-blue-600/50 border border-blue-400/40 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide">
          🚀 Hơn 10,000+ việc làm đang chờ bạn
        </span>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
          Tìm việc làm phù hợp <br className="hidden sm:block" />
          với bạn
        </h1>
        <p className="text-gray-200 text-semibold mx-auto mb-8 py-2">
          Kết nối bạn với các cơ hội nghề nghiệp hàng đầu từ các doanh nghiệp uy
          tín.
        </p>

        {/* Search Box */}
        <div className="bg-white rounded-2xl p-3 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto">
          {/* Keyword input */}
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-gray-400" />
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
            <MapPin className="w-4 h-4 text-gray-400" />
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
            <Search className="w-4 h-4" />
            TÌM KIẾM
          </button>
        </div>

        {/* Popular searches */}
        <div className="mt-5 flex flex-wrap justify-center items-center gap-2">
          <span className="text-blue-200 text-xs">Tìm kiếm phổ biến:</span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              onClick={() => {
                setKeyword(term);
                onSearch?.(term, location);
              }}
              className="text-xs bg-white/10 hover:bg-white/20 border border-white/30 text-white px-3 py-1 rounded-full transition-colors"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl font-bold text-white">{stat.num}</p>
              <p className="text-xs text-blue-900">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
