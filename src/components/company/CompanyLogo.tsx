import { Building2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

const resolveAssetUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;

  const serverUrl = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${serverUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export function CompanyLogo({
  name,
  logoUrl,
  className = "",
  imageClassName = "",
}: {
  name: string;
  logoUrl?: string | null;
  className?: string;
  imageClassName?: string;
}) {
  const resolvedLogoUrl = resolveAssetUrl(logoUrl);

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-white font-black text-blue-700 ${className}`}
    >
      {resolvedLogoUrl ? (
        <img
          src={resolvedLogoUrl}
          alt={`Logo ${name}`}
          className={`h-full w-full object-contain ${imageClassName}`}
          loading="lazy"
        />
      ) : name.trim() ? (
        name.trim().charAt(0).toUpperCase()
      ) : (
        <Building2 className="h-1/2 w-1/2" />
      )}
    </span>
  );
}
