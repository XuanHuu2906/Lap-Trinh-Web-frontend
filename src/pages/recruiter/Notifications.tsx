import { useState } from 'react';
import {
  Bell,
  Check,
  Trash2,
  UserPlus,
  MessageSquare,
  AlertCircle,
  Star
} from 'lucide-react';

interface Notification {
  id: number;
  type: 'apply' | 'message' | 'system' | 'eval';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'apply',
    title: 'Hồ sơ ứng tuyển mới',
    description: 'Ứng viên Nguyễn Văn Thái vừa nộp hồ sơ ứng tuyển vị trí "Senior Frontend Engineer".',
    time: '2 phút trước',
    read: false,
  },
  {
    id: 2,
    type: 'message',
    title: 'Tin nhắn mới từ Ứng viên',
    description: 'Trần Thị Mai gửi tin nhắn: "Dạ em nhận được lịch hẹn phỏng vấn rồi ạ, em cảm ơn..."',
    time: '25 phút trước',
    read: false,
  },
  {
    id: 3,
    type: 'eval',
    title: 'Hoàn thành đánh giá ứng viên',
    description: 'Bạn đã đánh giá hồ sơ ứng viên Lê Hoàng Hải đạt mức 5 Sao (Xuất sắc).',
    time: '2 giờ trước',
    read: true,
  },
  {
    id: 4,
    type: 'system',
    title: 'Gia hạn tin đăng tuyển thành công',
    description: 'Hệ thống đã tự động gia hạn tin tuyển dụng "Product Manager" thêm 30 ngày.',
    time: '1 ngày trước',
    read: true,
  },
  {
    id: 5,
    type: 'apply',
    title: 'Hồ sơ ứng tuyển mới',
    description: 'Ứng viên Phạm Phương Anh vừa nộp hồ sơ ứng tuyển vị trí "HR Specialist".',
    time: '2 ngày trước',
    read: true,
  }
];

export function RecruiterNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'apply':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case 'eval':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-8 max-w-4xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-indigo-600" />
            Thông báo hệ thống
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và xem các cập nhật mới nhất về hoạt động tuyển dụng trong phân hệ của bạn.</p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleMarkAllAsRead}
              className="px-3.5 py-2 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors rounded-sm cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-emerald-500" /> Đã đọc tất cả
            </button>
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors rounded-sm cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Xóa toàn bộ
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${filter === 'all'
              ? 'bg-indigo-600 text-white shadow-3xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
        >
          Tất cả ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${filter === 'unread'
              ? 'bg-indigo-600 text-white shadow-3xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
        >
          Chưa đọc ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${filter === 'read'
              ? 'bg-indigo-600 text-white shadow-3xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
        >
          Đã đọc ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Content list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-lg shadow-3xs">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800">Không có thông báo nào</p>
          <p className="text-xs text-slate-400 mt-1">Các thông báo mới về ứng tuyển và hội thoại sẽ được hiển thị tại đây.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkAsRead(n.id)}
              className={`p-4 border rounded-lg transition-all flex items-start gap-4 relative cursor-pointer ${n.read
                  ? 'bg-white border-slate-150 text-slate-700'
                  : 'bg-indigo-50/20 border-indigo-150 text-slate-900 shadow-3xs font-semibold'
                }`}
            >
              {/* Unread Indicator Badge */}
              {!n.read && (
                <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              )}

              {/* Left Column: Icon Type wrapper */}
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-100">
                {getIcon(n.type)}
              </div>

              {/* Middle Column: Text content */}
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold leading-tight">{n.title}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{n.description}</p>
              </div>

              {/* Right Column: Actions (Trash) */}
              <div className="flex items-center shrink-0 self-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(n.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                  title="Xóa thông báo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
