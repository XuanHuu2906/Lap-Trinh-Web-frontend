import { api } from "@/lib/api";
import { decodeMojibakeInText } from "@/utils/encoding";

export type NotificationItem = {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedType?: string | null;
  relatedId?: number | null;
  isRead: boolean;
  createdAt: string;
};

type NotificationListResponse = {
  success: boolean;
  data: NotificationItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
};

type UnreadCountResponse = {
  success: boolean;
  data: {
    count: number;
  };
};

let notificationsCache = new Map<string, NotificationListResponse>();
let unreadCountCache: UnreadCountResponse | null = null;

const cacheKey = (params: object) => JSON.stringify(params);

const normalizeNotification = (notification: NotificationItem): NotificationItem => ({
  ...notification,
  title: decodeMojibakeInText(notification.title),
  message: decodeMojibakeInText(notification.message),
});

const normalizeNotificationListResponse = (
  response: NotificationListResponse,
): NotificationListResponse => ({
  ...response,
  data: response.data.map(normalizeNotification),
});

export const getCachedNotifications = (params: object = {}) =>
  notificationsCache.get(cacheKey(params)) ?? null;

export const clearNotificationsCache = () => {
  notificationsCache.clear();
  unreadCountCache = null;
};

export const notificationService = {
  async getNotifications(
    params: { page?: number; limit?: number; type?: string } = {},
    forceRefresh = false,
  ) {
    const key = cacheKey(params);
    if (!forceRefresh && notificationsCache.has(key)) {
      return notificationsCache.get(key)!;
    }

    const response = await api.get<NotificationListResponse>("/notifications", {
      params,
    });
    const normalizedResponse = normalizeNotificationListResponse(response.data);
    notificationsCache.set(key, normalizedResponse);
    return normalizedResponse;
  },

  async getUnreadCount(forceRefresh = false) {
    if (!forceRefresh && unreadCountCache) return unreadCountCache;

    const response =
      await api.get<UnreadCountResponse>("/notifications/unread-count");
    unreadCountCache = response.data;
    return response.data;
  },

  async markAsRead(id: number) {
    const response = await api.put(`/notifications/${id}/read`);
    clearNotificationsCache();
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.put("/notifications/read-all");
    clearNotificationsCache();
    return response.data;
  },
};
