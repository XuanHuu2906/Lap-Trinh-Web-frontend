import React from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Briefcase,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

type AdminNotificationType = "job_review" | "user_report" | "template_review" | "system_alert";

interface AdminNotification {
  id: number;
  type: AdminNotificationType;
  title: string;
  message: string;
  time: string;
  targetPath: string;
  unread: boolean;
  priority: "high" | "normal";
}

const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 1,
    type: "job_review",
    title: "Tin tuyển dụng cần duyệt",
    message: "Có 5 tin tuyển dụng mới đang chờ kiểm duyệt nội dung.",
    time: "10 phút trước",
    targetPath: "/admin/jobs",
    unread: true,
    priority: "high",
  },
  {
    id: 2,
    type: "user_report",
    title: "Báo cáo tài khoản bất thường",
    message: "Một tài khoản nhà tuyển dụng bị nhiều ứng viên báo cáo.",
    time: "42 phút trước",
    targetPath: "/admin/system",
    unread: true,
    priority: "high",
  },
  {
    id: 3,
    type: "template_review",
    title: "Mẫu CV mới cần kiểm tra",
    message: "Template CV vừa được thêm cần kiểm tra file cấu hình JSON.",
    time: "2 giờ trước",
    targetPath: "/admin/templates",
    unread: false,
    priority: "normal",
  },
  {
    id: 4,
    type: "system_alert",
    title: "Hoạt động đăng nhập quản trị",
    message: "Phát hiện phiên đăng nhập admin từ thiết bị mới.",
    time: "Hôm qua",
    targetPath: "/admin/activity-logs",
    unread: false,
    priority: "normal",
  },
];

const getNotificationIcon = (type: AdminNotificationType) => {
  switch (type) {
    case "job_review":
      return Briefcase;
    case "user_report":
      return Users;
    case "template_review":
      return FileText;
    case "system_alert":
      return AlertTriangle;
  }
};

export const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = React.useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = React.useState<"all" | "unread">("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 3;

  const unreadCount = notifications.filter((item) => item.unread).length;
  const visibleNotifications =
    filter === "unread"
      ? notifications.filter((item) => item.unread)
      : notifications;
  const totalPages = Math.max(1, Math.ceil(visibleNotifications.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedNotifications = visibleNotifications.slice(
    startIndex,
    startIndex + pageSize,
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  React.useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unread: false } : item,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 cursor-pointer border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                THÔNG BÁO QUẢN TRỊ
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1.5 ml-11">
            Chỉ hiển thị thông tin quan trọng hoặc cần quản trị viên xử lý.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={unreadCount > 0 ? "warning" : "secondary"}>
            {unreadCount} chưa đọc
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="h-8 text-[11px] font-bold"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đánh dấu đã đọc
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`h-8 px-3 rounded-sm text-[11px] font-black uppercase tracking-wider border transition-colors ${
                filter === "all"
                  ? "bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600"
                  : "bg-white dark:bg-slate-950/60 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`h-8 px-3 rounded-sm text-[11px] font-black uppercase tracking-wider border transition-colors ${
                filter === "unread"
                  ? "bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600"
                  : "bg-white dark:bg-slate-950/60 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Chưa đọc
            </button>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            {visibleNotifications.length} thông báo
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {visibleNotifications.length > 0 ? (
            paginatedNotifications.map((item) => {
              const Icon = getNotificationIcon(item.type);

              return (
                <div
                  key={item.id}
                  className={`p-5 transition-colors ${
                    item.unread ? "bg-indigo-50/40 dark:bg-indigo-950/20" : "bg-white dark:bg-transparent"
                  } hover:bg-slate-50 dark:hover:bg-slate-800/50`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-sm border flex items-center justify-center shrink-0 ${
                          item.priority === "high"
                            ? "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/60 text-amber-600 dark:text-amber-300"
                            : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                            {item.title}
                          </h2>
                          {item.unread && (
                            <span className="h-2 w-2 rounded-full bg-indigo-600" />
                          )}
                          {item.priority === "high" && (
                            <Badge variant="warning">Cần xử lý</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                          {item.message}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-2">
                          <Clock className="w-3.5 h-3.5" />
                          {item.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:pt-1">
                      {item.unread && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(item.id)}
                          className="h-8 text-[11px] font-bold"
                        >
                          Đã đọc
                        </Button>
                      )}
                      <Link to={item.targetPath} onClick={() => markAsRead(item.id)}>
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold"
                        >
                          Mở trang
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-14 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Không có thông báo chưa đọc
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Các thông báo quan trọng đã được xử lý.
              </p>
            </div>
          )}
        </div>

        {visibleNotifications.length > pageSize && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Hiển thị {startIndex + 1}-
              {Math.min(startIndex + pageSize, visibleNotifications.length)} trên{" "}
              {visibleNotifications.length} thông báo
            </span>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="h-7 w-7 border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>

              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <Button
                    key={pageNumber}
                    type="button"
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`h-7 w-7 text-[10px] font-bold ${
                      currentPage === pageNumber
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className="h-7 w-7 border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
