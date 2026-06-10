import { useEffect, useState } from "react";
import { Camera, Save } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import {
  candidateService,
  getCachedCandidateProfile,
  type CandidateProfile,
} from "@/services/candidate.service";

const getAssetUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;

  const serverUrl = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${serverUrl}${url}`;
};

const formatDateForInput = (value?: string | null) => {
  if (!value) return "";
  return value.slice(0, 10);
};

export default function CandidateSettings() {
  const cachedProfile = getCachedCandidateProfile();
  const initialProfile = cachedProfile?.data ?? null;

  const [profile, setProfile] = useState<CandidateProfile | null>(initialProfile);
  const [fullName, setFullName] = useState(initialProfile?.fullName ?? "");
  const [phone, setPhone] = useState(initialProfile?.phone ?? "");
  const [address, setAddress] = useState(initialProfile?.address ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(
    formatDateForInput(initialProfile?.dateOfBirth),
  );
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [isLoading, setIsLoading] = useState(!initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fillForm = (data: CandidateProfile) => {
    setProfile(data);
    setFullName(data.fullName || "");
    setPhone(data.phone || "");
    setAddress(data.address || "");
    setDateOfBirth(formatDateForInput(data.dateOfBirth));
    setBio(data.bio || "");
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const cached = getCachedCandidateProfile();
        if (cached) {
          fillForm(cached.data);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);

        const response = await candidateService.getProfile();
        if (isMounted) fillForm(response.data);
      } catch {
        if (isMounted) {
          setError("Không thể tải hồ sơ ứng viên.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setMessage(null);
      setError(null);

      const response = await candidateService.updateProfile({
        fullName,
        phone: phone || null,
        address: address || null,
        dateOfBirth: dateOfBirth || null,
        bio: bio || null,
      });

      fillForm(response.data);
      setMessage("Đã cập nhật hồ sơ ứng viên.");
    } catch {
      setError("Không thể cập nhật hồ sơ ứng viên.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setMessage(null);
      setError(null);

      const response = await candidateService.uploadAvatar(file);
      setProfile((current) =>
        current ? { ...current, avatarUrl: response.data.avatarUrl } : current,
      );
      setMessage("Đã cập nhật avatar.");
    } catch {
      setError("Không thể upload avatar.");
    } finally {
      event.target.value = "";
    }
  };

  const avatarUrl = getAssetUrl(profile?.avatarUrl);

  if (isLoading) {
    return (
      <div className="border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Đang tải hồ sơ ứng viên...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          Hồ sơ ứng viên
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Cập nhật thông tin cá nhân dùng cho hồ sơ ứng tuyển.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <section className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-center">
            <div className="relative mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-blue-600">
              <span className="text-xl font-bold text-white">
                {fullName.trim().charAt(0).toUpperCase() || "U"}
              </span>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              <Camera className="h-4 w-4" />
              Đổi avatar
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          {message ? (
            <div className="mb-4 bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mb-4 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Họ và tên
              </span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
                required
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Số điện thoại
              </span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Ngày sinh
              </span>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                className="w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Địa chỉ
              </span>
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Giới thiệu ngắn
              </span>
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={5}
                className="w-full resize-none border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
              />
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
