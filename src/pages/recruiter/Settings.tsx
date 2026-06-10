import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  getRecruiterProfile,
  updateRecruiterProfile,
  uploadRecruiterLogo,
} from "../../services/recruiter.service";
import { requestApi } from "../../services/api";

const settingsTabs = ["Hồ sơ công ty", "Thông tin liên hệ", "Đổi mật khẩu"];

const MAX_DESC = 1000;

const getTabFromUrl = (tab: string | null) => {
  if (tab === "contact") return "Thông tin liên hệ";
  if (tab === "password") return "Đổi mật khẩu";
  return "Hồ sơ công ty";
};

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(() =>
    getTabFromUrl(searchParams.get("tab")),
  );

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  const websiteDomain = website.replace(/^https?:\/\//, "");

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getRecruiterProfile();
      const profile = response.data;

      setCompanyName(profile.companyName ?? "");
      setContactName(profile.contactName ?? "");
      setPhone(profile.phone ?? "");
      setAddress(profile.address ?? "");
      setWebsite(profile.website ?? "");
      setDescription(profile.description ?? "");
      setLogoPreview(profile.logoUrl ?? null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không tải được hồ sơ nhà tuyển dụng",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  useEffect(() => {
    setActiveTab(getTabFromUrl(searchParams.get("tab")));
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setError("");
    setMessage("");

    if (tab === "Thông tin liên hệ") {
      setSearchParams({ tab: "contact" });
      return;
    }

    if (tab === "Đổi mật khẩu") {
      setSearchParams({ tab: "password" });
      return;
    }

    setSearchParams({ tab: "company" });
  };

  const handleLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const saveRecruiterProfile = async () => {
    await updateRecruiterProfile({
      companyName,
      contactName: contactName || null,
      phone: phone || null,
      address: address || null,
      website: website || null,
      description: description || null,
    });

    if (logoFile) {
      const logoResponse = await uploadRecruiterLogo(logoFile);
      setLogoPreview(logoResponse.data.logoUrl);
      setLogoFile(null);
    }
  };

  const handleSubmitCompany = async (event: FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await saveRecruiterProfile();
      setMessage("Cập nhật hồ sơ công ty thành công");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không cập nhật được hồ sơ công ty",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitContact = async (event: FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await saveRecruiterProfile();
      setMessage("Cập nhật thông tin liên hệ thành công");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không cập nhật được thông tin liên hệ",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!currentPassword.trim()) {
      setError("Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu mới không khớp");
      return;
    }

    setPasswordLoading(true);

    try {
      await requestApi<null>({
        method: "PUT",
        url: "/auth/change-password",
        data: {
          currentPassword,
          newPassword,
        },
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Đổi mật khẩu thành công");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đổi mật khẩu");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7">
          <h1 className="text-[30px] font-bold leading-tight text-slate-900 dark:text-white">
            Cài đặt hệ thống
          </h1>

          <p className="mt-2 text-[14px] text-slate-500 dark:text-slate-300">
            Quản lý thông tin doanh nghiệp và tùy chỉnh thông tin tài khoản.
          </p>
        </div>

        {(message || error) && (
          <div
            className={`mb-5 border px-4 py-3 text-[13px] ${
              error
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="grid grid-cols-[220px_1fr] items-start gap-6">
          <aside className="border border-slate-200 bg-white shadow-sm">
            {settingsTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`w-full border-b border-slate-100 px-5 py-3 text-left text-[13px] transition-colors last:border-b-0 ${
                  activeTab === tab
                    ? "border-l-4 border-l-[#0f1f3d] bg-slate-100 font-bold text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </aside>

          <main className="border border-slate-200 bg-white shadow-sm">
            {activeTab === "Hồ sơ công ty" && (
              <form onSubmit={handleSubmitCompany}>
                <div className="border-b border-slate-200 px-8 py-6">
                  <h2 className="text-[18px] font-bold text-slate-900">
                    Hồ sơ công ty
                  </h2>

                  <p className="mt-1 text-[13px] text-slate-500">
                    Thông tin này sẽ được hiển thị công khai trên các tin tuyển dụng của bạn.
                  </p>
                </div>

                <div className="px-8 py-7">
                  <div className="mb-7 flex items-center gap-5 border-b border-slate-100 pb-7">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-slate-100">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo doanh nghiệp"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[11px] font-bold uppercase text-slate-400">
                          Logo
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        Logo doanh nghiệp
                      </label>

                      <p className="mt-1 text-[12px] text-slate-400">
                        Định dạng JPG, PNG. Nên dùng ảnh vuông để hiển thị đẹp hơn.
                      </p>

                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="mt-3 h-9 border border-slate-300 px-4 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Thay đổi Logo
                      </button>

                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogo}
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        Tên công ty *
                      </label>

                      <input
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="h-11 w-full border border-slate-300 px-4 text-[14px] text-slate-800 outline-none transition-colors focus:border-[#0f1f3d]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        Website công ty
                      </label>

                      <div className="flex">
                        <span className="flex h-11 items-center border border-r-0 border-slate-300 bg-slate-50 px-4 text-[13px] text-slate-400">
                          https://
                        </span>

                        <input
                          value={websiteDomain}
                          onChange={(e) => {
                            const value = e.target.value
                              .trim()
                              .replace(/^https?:\/\//, "");

                            setWebsite(value ? `https://${value}` : "");
                          }}
                          placeholder="www.tencongty.com"
                          className="h-11 flex-1 border border-slate-300 px-4 text-[14px] text-slate-800 outline-none transition-colors focus:border-[#0f1f3d]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        Mô tả doanh nghiệp
                      </label>

                      <textarea
                        value={description}
                        onChange={(e) => {
                          if (e.target.value.length <= MAX_DESC) {
                            setDescription(e.target.value);
                          }
                        }}
                        rows={6}
                        placeholder="Giới thiệu ngắn gọn về công ty, lĩnh vực hoạt động, môi trường làm việc..."
                        className="w-full resize-y border border-slate-300 px-4 py-3 text-[14px] leading-relaxed text-slate-800 outline-none transition-colors focus:border-[#0f1f3d]"
                      />

                      <p className="mt-1 text-right text-[12px] text-slate-400">
                        {description.length} / {MAX_DESC} ký tự
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-8 py-5">
                  <button
                    type="button"
                    onClick={() => void loadProfile()}
                    className="h-10 px-5 text-[13px] font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-10 bg-[#0f1f3d] px-6 text-[13px] font-bold text-white transition-colors hover:bg-[#1a2f52] disabled:opacity-60"
                  >
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "Thông tin liên hệ" && (
              <form onSubmit={handleSubmitContact}>
                <div className="border-b border-slate-200 px-8 py-6">
                  <h2 className="text-[18px] font-bold text-slate-900">
                    Thông tin liên hệ
                  </h2>

                  <p className="mt-1 text-[13px] text-slate-500">
                    Cập nhật người phụ trách tuyển dụng, số điện thoại và địa chỉ liên hệ.
                  </p>
                </div>

                <div className="space-y-5 px-8 py-7">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Người liên hệ
                    </label>

                    <input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className="h-11 w-full border border-slate-300 px-4 text-[14px] text-slate-800 outline-none transition-colors focus:border-[#0f1f3d]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Số điện thoại
                    </label>

                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="VD: 0900000000"
                      className="h-11 w-full border border-slate-300 px-4 text-[14px] text-slate-800 outline-none transition-colors focus:border-[#0f1f3d]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Địa chỉ công ty
                    </label>

                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="VD: Hà Nội, TP.HCM hoặc Remote"
                      className="h-11 w-full border border-slate-300 px-4 text-[14px] text-slate-800 outline-none transition-colors focus:border-[#0f1f3d]"
                    />
                  </div>

                  <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] leading-relaxed text-blue-700">
                    Thông tin liên hệ giúp ứng viên và quản trị viên nhận diện doanh nghiệp rõ ràng hơn.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-8 py-5">
                  <button
                    type="button"
                    onClick={() => void loadProfile()}
                    className="h-10 px-5 text-[13px] font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-10 bg-[#0f1f3d] px-6 text-[13px] font-bold text-white transition-colors hover:bg-[#1a2f52] disabled:opacity-60"
                  >
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "Đổi mật khẩu" && (
              <form onSubmit={handleChangePassword}>
                <div className="border-b border-slate-200 px-8 py-6">
                  <h2 className="text-[18px] font-bold text-slate-900">
                    Đổi mật khẩu
                  </h2>

                  <p className="mt-1 text-[13px] text-slate-500">
                    Cập nhật mật khẩu đăng nhập để tăng cường bảo mật tài khoản.
                  </p>
                </div>

                <div className="space-y-5 px-8 py-7">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Mật khẩu hiện tại *
                    </label>

                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-11 w-full border border-slate-300 px-4 text-[14px] text-slate-800 outline-none transition-colors focus:border-[#0f1f3d]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Mật khẩu mới *
                    </label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11 w-full border border-slate-300 px-4 text-[14px] text-slate-800 outline-none transition-colors focus:border-[#0f1f3d]"
                    />

                    <p className="mt-1 text-[12px] text-slate-400">
                      Mật khẩu mới phải có ít nhất 6 ký tự.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Xác nhận mật khẩu mới *
                    </label>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 w-full border border-slate-300 px-4 text-[14px] text-slate-800 outline-none transition-colors focus:border-[#0f1f3d]"
                    />
                  </div>

                  <div className="rounded-md border border-amber-100 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-700">
                    Sau khi đổi mật khẩu thành công, bạn nên đăng xuất và đăng nhập lại để kiểm tra.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-8 py-5">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setError("");
                      setMessage("");
                    }}
                    className="h-10 px-5 text-[13px] font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="h-10 bg-[#0f1f3d] px-6 text-[13px] font-bold text-white transition-colors hover:bg-[#1a2f52] disabled:opacity-60"
                  >
                    {passwordLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                  </button>
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}