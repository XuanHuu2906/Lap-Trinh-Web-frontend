import { useEffect, useState } from "react";
import { Camera, Save } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import {
  candidateService,
  getCachedCandidateProfile,
  type CandidateProfile,
} from "@/services/candidate.service";

type CandidateFormData = {
  fullName: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  bio: string;
};

type CandidateFormField = keyof CandidateFormData;

function getAssetUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;

  const serverUrl = API_BASE_URL.replace(/\/api\/?$/, "");

  return `${serverUrl}${url}`;
}

function formatDateForInput(value?: string | null) {
  if (!value) return "";

  return value.slice(0, 10);
}

function createFormData(profile: CandidateProfile | null): CandidateFormData {
  return {
    fullName: profile?.fullName ?? "",
    phone: profile?.phone ?? "",
    address: profile?.address ?? "",
    dateOfBirth: formatDateForInput(profile?.dateOfBirth),
    bio: profile?.bio ?? "",
  };
}

function LoadingState() {
  return (
    <div className="border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      Đang tải hồ sơ ứng viên...
    </div>
  );
}

function PageHeader() {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
        Hồ sơ ứng viên
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Cập nhật thông tin cá nhân dùng cho hồ sơ ứng tuyển.
      </p>
    </div>
  );
}

function AvatarCard({
  fullName,
  avatarUrl,
  onAvatarChange,
}: {
  fullName: string;
  avatarUrl: string | null;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
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
            onChange={onAvatarChange}
          />
        </label>
      </div>
    </section>
  );
}

function AlertMessage({
  message,
  tone,
}: {
  message: string;
  tone: "success" | "error";
}) {
  const className =
    tone === "success"
      ? "mb-4 bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300"
      : "mb-4 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300";

  return <div className={className}>{message}</div>;
}

function TextInput({
  label,
  value,
  required,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  required?: boolean;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
        required={required}
      />
    </label>
  );
}

function TextAreaInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="sm:col-span-2">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="w-full resize-none border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
      />
    </label>
  );
}

function ProfileForm({
  formData,
  message,
  error,
  isSaving,
  onFieldChange,
  onSubmit,
}: {
  formData: CandidateFormData;
  message: string | null;
  error: string | null;
  isSaving: boolean;
  onFieldChange: (field: CandidateFormField, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      {message ? <AlertMessage message={message} tone="success" /> : null}
      {error ? <AlertMessage message={error} tone="error" /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextInput
            label="Họ và tên"
            value={formData.fullName}
            required
            onChange={(value) => onFieldChange("fullName", value)}
          />
        </div>

        <TextInput
          label="Số điện thoại"
          value={formData.phone}
          onChange={(value) => onFieldChange("phone", value)}
        />

        <TextInput
          label="Ngày sinh"
          type="date"
          value={formData.dateOfBirth}
          onChange={(value) => onFieldChange("dateOfBirth", value)}
        />

        <div className="sm:col-span-2">
          <TextInput
            label="Địa chỉ"
            value={formData.address}
            onChange={(value) => onFieldChange("address", value)}
          />
        </div>

        <TextAreaInput
          label="Giới thiệu ngắn"
          value={formData.bio}
          onChange={(value) => onFieldChange("bio", value)}
        />
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
  );
}

export default function CandidateSettings() {
  const cachedProfile = getCachedCandidateProfile();
  const initialProfile = cachedProfile?.data ?? null;

  const [profile, setProfile] = useState<CandidateProfile | null>(
    initialProfile,
  );
  const [formData, setFormData] = useState<CandidateFormData>(
    createFormData(initialProfile),
  );
  const [isLoading, setIsLoading] = useState(!initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fillForm = (data: CandidateProfile) => {
    setProfile(data);
    setFormData(createFormData(data));
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

  const handleFieldChange = (field: CandidateFormField, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setMessage(null);
      setError(null);

      const response = await candidateService.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone || null,
        address: formData.address || null,
        dateOfBirth: formData.dateOfBirth || null,
        bio: formData.bio || null,
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
    return <LoadingState />;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader />

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <AvatarCard
          fullName={formData.fullName}
          avatarUrl={avatarUrl}
          onAvatarChange={handleAvatarChange}
        />

        <ProfileForm
          formData={formData}
          message={message}
          error={error}
          isSaving={isSaving}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
