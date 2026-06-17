import React, { useEffect } from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Download,
  ExternalLink,
  Calendar,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  FileText,
  User,
} from "lucide-react";
import { getUploadUrl } from "@/services/cv.service";
import type { RecruiterApplication } from "@/services/recruiter.service";

interface CandidateCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: RecruiterApplication | null;
}

export const CandidateCVModal: React.FC<CandidateCVModalProps> = ({
  isOpen,
  onClose,
  application,
}) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !application) return null;

  const { cv, candidateProfile } = application;

  // Fallback values from candidate profile
  const profileName = candidateProfile?.fullName || "Ứng viên";
  const profileEmail = candidateProfile?.user?.email || "";
  const profilePhone = candidateProfile?.phone || "";
  const avatarUrl = candidateProfile?.avatarUrl;

  // Extract CV personal info or fall back
  const personalInfo = cv?.personalInfo && typeof cv.personalInfo === "object"
    ? (cv.personalInfo as Record<string, any>)
    : {};

  const cvName = personalInfo.fullName || profileName;
  const cvEmail = personalInfo.email || profileEmail;
  const cvPhone = personalInfo.phone || profilePhone;
  const cvAddress = personalInfo.address || "";
  const cvSummary = personalInfo.summary || "";

  // Lists parsing
  const experienceList = Array.isArray(cv?.experience) ? cv.experience : [];
  const educationList = Array.isArray(cv?.education) ? cv.education : [];
  const projectsList = Array.isArray(cv?.projects) ? cv.projects : [];
  const certificationsList = Array.isArray(cv?.certifications) ? cv.certifications : [];

  const getSkillsList = (skillsData: any): string[] => {
    if (typeof skillsData === "string") {
      return skillsData.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    if (Array.isArray(skillsData)) {
      return skillsData
        .map((item: any) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            return item.name || item.skill || "";
          }
          return "";
        })
        .filter(Boolean);
    }
    return [];
  };

  const skillsList = getSkillsList(cv?.skills);

  // Helper functions for safe extraction
  const getExperienceCompany = (item: any) => item.company || "";
  const getExperienceTitle = (item: any) => item.title || item.position || "";
  const getExperiencePeriod = (item: any) => {
    if (item.period) return item.period;
    if (item.startDate) {
      return `${item.startDate} - ${item.endDate || "Hiện tại"}`;
    }
    return "";
  };
  const getExperienceDesc = (item: any) => item.desc || item.description || "";

  const getEducationSchool = (item: any) => item.school || "";
  const getEducationDegree = (item: any) => item.degree || item.major || "";
  const getEducationPeriod = (item: any) => {
    if (item.year) return item.year;
    if (item.startDate) {
      return `${item.startDate} - ${item.endDate || ""}`;
    }
    return "";
  };
  const getEducationDesc = (item: any) => item.desc || item.description || "";

  const getProjectName = (item: any) => item.name || "";
  const getProjectRole = (item: any) => item.role || "";
  const getProjectPeriod = (item: any) => {
    if (item.period) return item.period;
    if (item.startDate) {
      return `${item.startDate} - ${item.endDate || ""}`;
    }
    return "";
  };
  const getProjectDesc = (item: any) => item.desc || item.description || "";
  const getProjectTechs = (item: any): string[] => {
    if (Array.isArray(item.technologies)) return item.technologies;
    if (typeof item.technologies === "string") {
      return item.technologies.split(",").map((t: string) => t.trim()).filter(Boolean);
    }
    if (item.tech) {
      if (Array.isArray(item.tech)) return item.tech;
      if (typeof item.tech === "string") {
        return item.tech.split(",").map((t: string) => t.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const getCertName = (item: any) => item.name || "";
  const getCertOrg = (item: any) => item.organization || item.org || "";
  const getCertDate = (item: any) => {
    if (item.issueDate) return item.issueDate;
    if (item.date) return item.date;
    return "";
  };

  const isUploadedCV = cv?.cvType === "uploaded" && cv.pdfUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-5xl w-full h-[90vh] flex flex-col z-10 overflow-hidden transform transition-all duration-300 scale-100">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              Chi tiết hồ sơ ứng viên
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Họ tên: {cvName} &bull; Loại CV: {cv?.cvType === "uploaded" ? "File PDF tải lên" : "Tạo trực tuyến"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grow overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-950/20">
          {isUploadedCV ? (
            /* PDF CV Layout */
            <div className="flex flex-col h-full gap-4 min-h-[600px]">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-150 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {cv.title || "CV_Ung_Vien.pdf"}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Ứng viên tải lên tệp PDF. Bạn có thể mở trực tiếp hoặc tải xuống.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={getUploadUrl(cv.pdfUrl) || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 border border-slate-200 dark:border-slate-700 dark:text-slate-200 text-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Mở trong tab mới
                  </a>
                  <a
                    href={getUploadUrl(cv.pdfUrl) || "#"}
                    download={cv.title || "CV_Ung_Vien.pdf"}
                    className="inline-flex h-9 items-center gap-1.5 bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Tải CV xuống
                  </a>
                </div>
              </div>

              {/* PDF Preview Frame */}
              <div className="flex-1 min-h-[500px] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 relative">
                <iframe
                  src={getUploadUrl(cv.pdfUrl) || ""}
                  className="w-full h-full border-none"
                  title="PDF Viewer"
                />
              </div>
            </div>
          ) : (
            /* Built CV Layout (Beautiful Resume template design) */
            <div className="space-y-6">

              {/* Header profile section */}
              <div className="bg-gradient-to-r from-indigo-900 to-slate-900 dark:from-indigo-950 dark:to-slate-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center shadow-lg">
                {avatarUrl ? (
                  <img
                    src={getUploadUrl(avatarUrl) || ""}
                    alt={cvName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-400/30 shadow-inner bg-slate-800 shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-indigo-800/60 border-4 border-indigo-400/30 flex items-center justify-center text-white shrink-0 text-3xl font-bold shadow-inner">
                    {cvName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 text-center md:text-left min-w-0">
                  <h2 className="text-2xl font-black tracking-tight text-white uppercase truncate">
                    {cvName}
                  </h2>
                  <p className="text-sm font-semibold text-indigo-300 tracking-wider uppercase mt-1">
                    {personalInfo.title || "Ứng viên tìm năng"}
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2.5 text-xs text-slate-300 font-medium">
                    {cvEmail && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-indigo-400" />
                        {cvEmail}
                      </span>
                    )}
                    {cvPhone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-indigo-400" />
                        {cvPhone}
                      </span>
                    )}
                    {cvAddress && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                        {cvAddress}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Main resume contents */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Right / Left sections matching modern resume split */}

                {/* Column 1: Info & Side details (1/3 width) */}
                <div className="space-y-6 lg:col-span-1">

                  {/* Skills Section */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <Code className="h-4 w-4 text-indigo-500" />
                      Kỹ năng chuyên môn
                    </h3>
                    {skillsList.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {skillsList.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-350 text-[11px] font-bold rounded-lg border border-indigo-100/30"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-450 italic">Ứng viên chưa cung cấp kỹ năng.</p>
                    )}
                  </div>

                  {/* Certifications Section */}
                  {certificationsList.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                      <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <Award className="h-4 w-4 text-indigo-500" />
                        Chứng chỉ & Giải thưởng
                      </h3>
                      <div className="space-y-4">
                        {certificationsList.map((cert: any, index) => (
                          <div key={index} className="group relative">
                            <p className="text-xs font-bold text-slate-850 dark:text-slate-250">
                              {getCertName(cert)}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {getCertOrg(cert)}
                            </p>
                            {getCertDate(cert) && (
                              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {getCertDate(cert)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 2: Experience & Details (2/3 width) */}
                <div className="space-y-6 lg:col-span-2">

                  {/* Summary / Introduction */}
                  {cvSummary && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                      <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <User className="h-4 w-4 text-indigo-500" />
                        Tóm tắt chuyên môn
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line font-medium">
                        {cvSummary}
                      </p>
                    </div>
                  )}

                  {/* Work Experience */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <Briefcase className="h-4 w-4 text-indigo-500" />
                      Kinh nghiệm làm việc
                    </h3>
                    {experienceList.length > 0 ? (
                      <div className="space-y-5">
                        {experienceList.map((work: any, index) => (
                          <div key={index} className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-1">
                            <div className="absolute w-2 h-2 rounded-full bg-indigo-550 -left-[5px] top-1.5" />
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                {getExperienceTitle(work)}
                              </h4>
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/45 px-2 py-0.5 rounded-sm self-start">
                                {getExperiencePeriod(work)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                              {getExperienceCompany(work)}
                            </p>
                            {getExperienceDesc(work) && (
                              <p className="text-[11px] text-slate-550 dark:text-slate-300 whitespace-pre-line mt-1.5 leading-relaxed">
                                {getExperienceDesc(work)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-450 italic">Ứng viên chưa cập nhật kinh nghiệm làm việc.</p>
                    )}
                  </div>

                  {/* Education */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <GraduationCap className="h-4 w-4 text-indigo-500" />
                      Học vấn & Đào tạo
                    </h3>
                    {educationList.length > 0 ? (
                      <div className="space-y-5">
                        {educationList.map((edu: any, index) => (
                          <div key={index} className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-1">
                            <div className="absolute w-2 h-2 rounded-full bg-indigo-550 -left-[5px] top-1.5" />
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                {getEducationDegree(edu)}
                              </h4>
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm self-start">
                                {getEducationPeriod(edu)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-550 dark:text-slate-450 font-bold">
                              {getEducationSchool(edu)}
                            </p>
                            {getEducationDesc(edu) && (
                              <p className="text-[11px] text-slate-650 dark:text-slate-355 whitespace-pre-line mt-1.5 leading-relaxed">
                                {getEducationDesc(edu)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-450 italic">Ứng viên chưa cập nhật học vấn.</p>
                    )}
                  </div>

                  {/* Projects */}
                  {projectsList.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                      <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <Code className="h-4 w-4 text-indigo-500" />
                        Các dự án tham gia
                      </h3>
                      <div className="space-y-5">
                        {projectsList.map((proj: any, index) => (
                          <div key={index} className="space-y-1.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                                {getProjectName(proj)}
                              </h4>
                              <span className="text-[10px] font-bold text-slate-550 dark:text-slate-450 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm self-start">
                                {getProjectPeriod(proj)}
                              </span>
                            </div>
                            {getProjectRole(proj) && (
                              <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                Vai trò: {getProjectRole(proj)}
                              </p>
                            )}
                            {getProjectDesc(proj) && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                {getProjectDesc(proj)}
                              </p>
                            )}
                            {getProjectTechs(proj).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {getProjectTechs(proj).map((tech, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 text-[10px] rounded-xs"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
