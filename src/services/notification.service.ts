import api from '../lib/api';

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  relatedPost?: any;
  relatedComment?: any;
  relatedUser?: any;
}

export interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

export const getNotifications = async (filters?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
  priority?: string;
}): Promise<NotificationResponse> => {
  const params = new URLSearchParams();
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
  if (filters?.type) params.append('type', filters.type);
  if (filters?.priority) params.append('priority', filters.priority);

  const response = await api.get(`/notifications?${params.toString()}`);
  return response.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get('/notifications/unread-count');
  return response.data.count;
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  await api.put(`/notifications/${notificationId}/read`);
};

export const markAllAsRead = async (type?: string): Promise<void> => {
  await api.put('/notifications/read-all', type ? { type } : {});
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  await api.delete(`/notifications/${notificationId}`);
};

export const deleteAllRead = async (): Promise<void> => {
  await api.delete('/notifications/read');
};

