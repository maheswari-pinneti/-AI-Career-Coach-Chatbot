import { apiClient } from './axiosClient';
import { AppNotification, NotificationPreferences } from '../types/notification';

export const notificationApi = {
  getNotifications: async (): Promise<{
    success: boolean;
    data: { notifications: AppNotification[]; unread_count: number };
  }> => {
    const res = await apiClient.get<{
      success: boolean;
      data: { notifications: AppNotification[]; unread_count: number };
    }>('/notifications');
    return res.data;
  },

  markAsRead: async (
    id: number
  ): Promise<{ success: boolean; message: string; data: { notification: AppNotification } }> => {
    const res = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { notification: AppNotification };
    }>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<{
    success: boolean;
    message: string;
    data: { marked_count: number };
  }> => {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: { marked_count: number };
    }>('/notifications/read-all');
    return res.data;
  },

  getPreferences: async (): Promise<{
    success: boolean;
    data: { preferences: NotificationPreferences };
  }> => {
    const res = await apiClient.get<{
      success: boolean;
      data: { preferences: NotificationPreferences };
    }>('/notifications/preferences');
    return res.data;
  },

  updatePreferences: async (
    preferences: Partial<NotificationPreferences>
  ): Promise<{
    success: boolean;
    message: string;
    data: { preferences: NotificationPreferences };
  }> => {
    const res = await apiClient.put<{
      success: boolean;
      message: string;
      data: { preferences: NotificationPreferences };
    }>('/notifications/preferences', preferences);
    return res.data;
  },
};
