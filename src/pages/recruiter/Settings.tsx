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

// === TRANG CÀI ĐẶT NHÀ TUYỂN DỤNG ===
// Tab 1: Hồ sơ công ty (tên, logo, website, mô tả)
// Tab 2: Thông tin liên hệ (người liên hệ, SĐT, địa chỉ)
// Tab 3: Đổi mật khẩu

// Danh sách tab cài đặt, dùng để render navigation và xác định active tab
const settingsTabs = ["Hồ sơ công ty", "Thông tin liên hệ", "Đổi mật khẩu"];

// Giới hạn ký tự cho phần mô tả doanh nghiệp
const MAX_DESC = 1000;

// Chuyển đổi URL param "tab" thành tên tab hiển thị
// Mặc định trả về tab hồ sơ công ty nếu không khớp
const getTabFromUrl = (tab: string | null) => {
  if (tab === "contact") return "Thông tin liên hệ";
  if (tab === "password") return "Đổi mật khẩu";
  return "Hồ sơ công ty";
};

/**
 * Component cài đặt hệ thống cho nhà tuyển dụng
 * Gồm 3 tab: hồ sơ công ty, thông tin liên hệ, đổi mật khẩu
 * Hỗ trợ upload logo công ty
 */
export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // activeTab: tab đang được chọn, khởi tạo từ URL param
  const [activeTab, setActiveTab] = useState(() =>
    getTabFromUrl(searchParams.get("tab")),
  );

  // logoPreview: URL ảnh xem trước (có thể là từ server hoặc object URL tạm)
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  // logoFile: file ảnh đã chọn để upload (null nếu chưa chọn file mới)
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // State cho tab hồ sơ công ty
  const [companyName, setCompanyName] = useState("");
  // State cho tab thông tin liên hệ
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  // State cho tab đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // loading: trạng thái đang lưu hồ sơ (tab 1 và 2)
  const [loading, setLoading] = useState(false);
  // passwordLoading: trạng thái đang đổi mật khẩu (tab 3)
  const [passwordLoading, setPasswordLoading] = useState(false);
  // message: thông báo thành công (xanh lá)
  const [message, setMessage] = useState("");
  // error: thông báo lỗi (đỏ)
  const [error, setError] = useState("");

  // Ref để trigger input chọn file logo
  const fileRef = useRef<HTMLInputElement>(null);

  // websiteDomain: loại bỏ protocol (https://) khỏi URL để hiển thị trong input
  const websiteDomain = website.replace(/^https?:\/\//, "");

  // Tải hồ sơ nhà tuyển dụng từ API và điền vào các state
  // Được gọi khi component mount và khi người dùng bấm "Hủy bỏ"
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

  // useEffect: tải profile khi component mount
  useEffect(() => {
    void loadProfile();
  }, []);

  // useEffect: đồng bộ activeTab với URL params khi URL thay đổi
  // Cho phép chia sẻ link trực tiếp đến một tab cụ thể
  useEffect(() => {
    setActiveTab(getTabFromUrl(searchParams.get("tab")));
  }, [searchParams]);

  // Xử lý chuyển tab: cập nhật state và URL param tương ứng
  // Reset thông báo khi chuyển tab
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

  // Xử lý chọn file logo từ máy người dùng
  // Tạo object URL tạm để preview ảnh trước khi upload
  const handleLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // Lưu hồ sơ nhà tuyển dụng: cập nhật thông tin + upload logo nếu có
  // Được gọi từ cả handleSubmitCompany và handleSubmitContact
  // Upload logo sau khi cập nhật profile thành công, cập nhật logoPreview với URL thật từ server
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

  // Submit tab hồ sơ công ty
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

  // Submit tab thông tin liên hệ
  // Dùng chung saveRecruiterProfile nhưng message khác biệt
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

  // Submit tab đổi mật khẩu
  // Validate: không để trống mật khẩu hiện tại, mật khẩu mới >= 6 ký tự, xác nhận khớp
  // Gọi API /auth/change-password sau đó reset form
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
        {/* Header trang */}
        <div className="mb-7">
          <h1 className="text-[30px] font-bold leading-tight text-slate-900 dark:text-white">
            Cài đặt hệ thống
          </h1>

          <p className="mt-2 text-[14px] text-slate-500 dark:text-slate-300">
            Quản lý thông tin doanh nghiệp và tùy chỉnh thông tin tài khoản.
          </p>
        </div>

        {/* Thông báo kết quả */}
        {(message || error) && (
          <div
            className={`mb-5 border px-4 py-3 text-[13px] ${
              error
                ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                : "border-green-200 bg-green-50 text-green-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
            }`}
          >
            {error || message}
          </div>
        )}

        {/* Layout: sidebar tab navigation + nội dung */}
        <div className="grid grid-cols-[220px_1fr] items-start gap-6">
          {/* Sidebar navigation với các tab cài đặt */}
          <aside className="border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            {settingsTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`w-full border-b border-slate-100 px-5 py-3 text-left text-[13px] transition-colors last:border-b-0 dark:border-slate-800 ${
                  activeTab === tab
                    ? "border-l-4 border-l-[#0f1f3d] bg-slate-100 font-bold text-slate-900 dark:border-l-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </aside>

          {/* Nội dung tab */}
          <main className="border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            {/* === TAB 1: HỒ SƠ CÔNG TY === */}
            {activeTab === "Hồ sơ công ty" && (
              <form onSubmit={handleSubmitCompany}>
                <div className="border-b border-slate-200 px-8 py-6 dark:border-slate-800">
                  <h2 className="text-[18px] font-bold text-slate-900 dark:text-slate-50">
                    Hồ sơ công ty
                  </h2>

                  <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                    Thông tin này sẽ được hiển thị công khai trên các tin tuyển dụng của bạn.
                  </p>
                </div>

                <div className="px-8 py-7">
                  {/* Upload logo: preview + button chọn file */}
                  <div className="mb-7 flex items-center gap-5 border-b border-slate-100 pb-7 dark:border-slate-800">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo doanh nghiệp"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">
                          Logo
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Logo doanh nghiệp
                      </label>

                      <p className="mt-1 text-[12px] text-slate-400 dark:text-slate-500">
                        Định dạng JPG, PNG. Nên dùng ảnh vuông để hiển thị đẹp hơn.
                      </p>

                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="mt-3 h-9 border border-slate-300 px-4 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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

                  {/* Form fields: tên công ty, website, mô tả */}
                  <div className="space-y-5">
                    {/* Tên công ty (bắt buộc) */}
                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Tên công ty *
                      </label>

                      <input
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="h-11 w-full border border-slate-300 px-4 text-[14px] text-slate-800 outline-none transition-colors focus:border-[#0f1f3d] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                      />
                    </div>

                    {/* Website: input với prefix https:// cố định bên trái */}
                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Website công ty
                      </label>

                      <div className="flex">
                        <span className="flex h-11 items-center border border-r-0 border-slate-300 bg-slate-50 px-4 text-[13px] text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500">
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
                          className="h-11 flex-1 border border-slate-300 px-4 text-[14px] text-slate-800 outline-none transition-colors focus:border-[#0f1f3d] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Mô tả doanh nghiệp: textarea có giới hạn ký tự */}
                    <div>
                      <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
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
                        className="w-full resize-y border border-slate-300 px-4 py-3 text-[14px] leading-relaxed text-slate-800 outline-none transition-colors focus:border-[#0f1f3d] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                      />

                      <p className="mt-1 text-right text-[12px] text-slate-400 dark:text-slate-500">
                        {description.length} / {MAX_DESC} ký tự
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer: nút Hủy bỏ (load lại profile) + Lưu thay đổi */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-8 py-5 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => void loadProfile()}
                    className="h-10 px-5 text-[13px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
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

            {/* === TAB 2: THÔNG TIN LIÊN HỆ === */}
            {activeTab === "Thông tin liên hệ" && (
              <form onSubmit={handleSubmitContact}>
                <div className="border-b border-slate-200 px-8 py-6 dark:border-slate-800">
                  <h2 className="text-[18px] font-bold text-slate-900 dark:text-slate-50">
                    Thông tin liên hệ
                  </h2>

                  <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                    Cập nhật người phụ trách tuyển dụng, số điện thoại và địa chỉ liên hệ.
                  </p>
                </div>

                <div className="space-y-5 px-8 py-7">
                  {/* Người liên hệ */}
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Người liên hệ
                    </label>

                    <input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className="h-11 w-full border border-slate-300 px-4 text-[14px] text-slate-800 outline-none transition-colors focus:border-[#0f1f3d] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Số điện thoại
                    </label>

                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="VD: 0900000000"
                      className="h-11 w-full border border-slate-300 px-4 text-[14px] text-slate-800 outline-none transition-colors focus:border-[#0f1f3d] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                    />
                  </div>

                  {/* Địa chỉ công ty */}
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Địa chỉ công ty
                    </label>

                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="VD: Hà Nội, TP.HCM hoặc Remote"
                      className="h-11 w-full border border-slate-300 px-4 text-[14px] text-slate-800 outline-none transition-colors focus:border-[#0f1f3d] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                    />
                  </div>

                  {/* Info box */}
                  <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] leading-relaxed text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300">
                    Thông tin liên hệ giúp ứng viên và quản trị viên nhận diện doanh nghiệp rõ ràng hơn.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-8 py-5 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => void loadProfile()}
                    className="h-10 px-5 text-[13px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
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

            {/* === TAB 3: ĐỔI MẬT KHẨU === */}
            {activeTab === "Đổi mật khẩu" && (
              <form onSubmit={handleChangePassword}>
                <div className="border-b border-slate-200 px-8 py-6 dark:border-slate-800">
                  <h2 className="text-[18px] font-bold text-slate-900 dark:text-slate-50">
                    Đổi mật khẩu
                  </h2>

                  <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                    Cập nhật mật khẩu đăng nhập để tăng cường bảo mật tài khoản.
                  </p>
                </div>

                <div className="space-y-5 px-8 py-7">
                  {/* Mật khẩu hiện tại */}
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Mật khẩu hiện tại *
                    </label>

                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-11 w-full border border-slate-300 px-4 text-[14px] text-slate-800 outline-none transition-colors focus:border-[#0f1f3d] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                    />
                  </div>

                  {/* Mật khẩu mới + hint độ dài */}
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Mật khẩu mới *
                    </label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11 w-full border border-slate-300 px-4 text-[14px] text-slate-800 outline-none transition-colors focus:border-[#0f1f3d] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                    />

                    <p className="mt-1 text-[12px] text-slate-400 dark:text-slate-500">
                      Mật khẩu mới phải có ít nhất 6 ký tự.
                    </p>
                  </div>

                  {/* Xác nhận mật khẩu mới */}
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Xác nhận mật khẩu mới *
                    </label>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 w-full border border-slate-300 px-4 text-[14px] text-slate-800 outline-none transition-colors focus:border-[#0f1f3d] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                    />
                  </div>

                  {/* Warning box */}
                  <div className="rounded-md border border-amber-100 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                    Sau khi đổi mật khẩu thành công, bạn nên đăng xuất và đăng nhập lại để kiểm tra.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-8 py-5 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setError("");
                      setMessage("");
                    }}
                    className="h-10 px-5 text-[13px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
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
