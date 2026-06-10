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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="bg-linear-to-br from-blue-700 to-red-200 px-4 py-20 text-white">
      <div className="mx-auto max-w-5xl text-center">
        <span className="mb-5 inline-block rounded-full border border-blue-400/40 bg-blue-600/50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-100">
          Hơn 10,000+ việc làm đang chờ bạn
        </span>

        <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          Tìm việc làm phù hợp <br className="hidden sm:block" />
          với bạn
        </h1>
        <p className="mx-auto mb-8 max-w-2xl py-2 text-sm leading-6 text-gray-100">
          Kết nối bạn với các cơ hội nghề nghiệp hàng đầu từ các doanh nghiệp
          uy tín.
        </p>

        <div className="mx-auto flex max-w-3xl flex-col gap-2 rounded-2xl bg-white p-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Chức danh, từ khóa hoặc công ty"
              className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 sm:w-48">
            <MapPin className="h-4 w-4 text-gray-400" />
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tất cả địa điểm"
              className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
            />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
          >
            <Search className="h-4 w-4" />
            Tìm kiếm
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-blue-100">Tìm kiếm phổ biến:</span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setKeyword(term);
                onSearch?.(term, location);
              }}
              className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs text-white transition-colors hover:bg-white/20"
            >
              {term}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl font-bold text-white">{stat.num}</p>
              <p className="text-xs text-blue-100">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
