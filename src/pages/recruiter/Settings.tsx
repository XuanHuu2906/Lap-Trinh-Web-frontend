import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  getRecruiterProfile,
  updateRecruiterProfile,
  uploadRecruiterLogo,
} from "../../services/recruiter.service";

const settingsTabs = ["Hồ sơ công ty", "Thông tin liên hệ", "Đổi mật khẩu", "Cấu hình thông báo"];
const MAX_DESC = 1000;

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Hồ sơ công ty");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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
      setError(err instanceof Error ? err.message : "Không tải được hồ sơ recruiter");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const handleLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
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

      setMessage("Cập nhật hồ sơ nhà tuyển dụng thành công");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <h1 className="text-[26px] font-bold leading-tight text-slate-900">Hồ sơ & Cài đặt</h1>
        <p className="text-[14px] text-slate-500 mt-1">Kết nối API /api/users/recruiter/profile.</p>
      </div>

      {(message || error) && (
        <div className={`mb-5 border px-4 py-3 text-[13px] ${error ? "border-red-200 bg-red-50 text-red-600" : "border-green-200 bg-green-50 text-green-700"}`}>
          {error || message}
        </div>
      )}

      <div className="flex gap-6 items-start">
        <div className="w-50 shrink-0 bg-white border border-slate-200">
          {settingsTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-5 py-3 text-[13px] border-b border-slate-100 last:border-b-0 transition-colors ${
                activeTab === tab
                  ? "text-slate-900 font-semibold bg-slate-50 border-l-2 border-l-[#0f1f3d]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white border border-slate-200">
          {activeTab === "Hồ sơ công ty" && (
            <form onSubmit={handleSubmit}>
              <div className="px-8 pt-7 pb-5 border-b border-slate-100">
                <h2 className="text-[16px] font-bold text-slate-900">Hồ sơ công ty</h2>
                <p className="text-[13px] text-slate-500 mt-1">Thông tin này sẽ được hiển thị trên các tin tuyển dụng.</p>
              </div>

              <div className="px-8 py-7 space-y-6">
                <div className="flex items-start gap-5 p-4 border border-slate-200 bg-slate-50">
                  <div className="w-16 h-16 bg-blue-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-slate-400 text-[11px] font-bold">LOGO</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Logo doanh nghiệp</label>
                    <p className="text-[12px] text-slate-400 mb-3">Định dạng JPG, PNG. Upload bằng API /api/users/recruiter/logo.</p>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="h-8 px-4 border border-slate-300 text-[12px] font-semibold text-slate-600 hover:bg-white"
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

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Tên công ty *</label>
                  <input
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none focus:border-slate-400 text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Người liên hệ</label>
                    <input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none focus:border-slate-400 text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Số điện thoại</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none focus:border-slate-400 text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Địa chỉ</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none focus:border-slate-400 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Website công ty</label>
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none focus:border-slate-400 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Mô tả doanh nghiệp
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => e.target.value.length <= MAX_DESC && setDescription(e.target.value)}
                    rows={5}
                    className="w-full border border-slate-200 px-4 py-3 text-[13px] outline-none focus:border-slate-400 text-slate-700 resize-y"
                  />
                  <p className="text-right text-[12px] text-slate-400 mt-1">
                    {description.length} / {MAX_DESC} ký tự
                  </p>
                </div>
              </div>

              <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => void loadProfile()}
                  className="h-10 px-6 border border-slate-300 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Tải lại
                </button>
                <button disabled={loading} className="h-10 px-6 bg-[#0f1f3d] text-white text-[13px] font-bold hover:bg-[#1a2f52] disabled:opacity-60">
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          )}

          {activeTab !== "Hồ sơ công ty" && (
            <div className="px-8 py-16 text-center">
              <p className="text-[14px] text-slate-400">Nội dung <span className="font-semibold text-slate-600">{activeTab}</span> đang được phát triển.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
