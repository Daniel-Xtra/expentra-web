import { api } from '@/shared/api/client';
import type {
  ApiResponse,
  NotificationPreferenceResponse,
  NotificationResponse,
  PaginatedResult,
} from '@/types/api';

export type ListNotificationsParams = {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  readOnly?: boolean;
};

export type UpdateNotificationPreferencesInput = {
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
  typePreferences?: Record<string, { email?: boolean; inApp?: boolean }>;
};

export async function listNotifications(
  params: ListNotificationsParams = {},
): Promise<PaginatedResult<NotificationResponse>> {
  const { data } = await api.get<ApiResponse<NotificationResponse[]>>('/notifications', {
    params,
  });
  return { items: data.data ?? [], meta: data.meta };
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const { data } = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
  return data.data?.count ?? 0;
}

export async function markNotificationRead(reference: string): Promise<void> {
  await api.post(`/notifications/${reference}/read`);
}

export async function markAllNotificationsRead(): Promise<number> {
  const { data } = await api.post<ApiResponse<{ count: number }>>('/notifications/read-all');
  return data.data?.count ?? 0;
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferenceResponse> {
  const { data } = await api.get<ApiResponse<NotificationPreferenceResponse>>(
    '/notifications/preferences/me',
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to load preferences');
  }
  return data.data;
}

export async function updateNotificationPreferences(
  input: UpdateNotificationPreferencesInput,
): Promise<NotificationPreferenceResponse> {
  const { data } = await api.patch<ApiResponse<NotificationPreferenceResponse>>(
    '/notifications/preferences/me',
    input,
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to update preferences');
  }
  return data.data;
}
