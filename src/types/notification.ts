export type NotificationResponse = {
  reference: string;
  type: string;
  channel: string;
  status: string;
  payload: Record<string, unknown>;
  readAt?: string | null;
  sentAt?: string;
  createdAt: string;
};

export type NotificationPreferenceResponse = {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  typePreferences: Record<string, { email?: boolean; inApp?: boolean }>;
  updatedAt: string;
};
