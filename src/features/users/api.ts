import { api } from '@/shared/api/client';
import { queueExport } from '@/shared/api/export';
import type {
  ApiResponse,
  PaginatedResult,
  UserDetailSummary,
  UserResponse,
  UserStatusCounts,
} from '@/types/api';

export type ListUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  departmentReference?: string;
  roleReference?: string;
  isActive?: boolean;
  unassignedDepartment?: boolean;
};

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
};

export type AdminUpdateUserInput = {
  roleReference?: string | null;
  departmentReference?: string | null;
  isActive?: boolean;
};

export async function fetchCurrentUser(): Promise<UserResponse> {
  const { data } = await api.get<ApiResponse<UserResponse>>('/users/me');
  if (!data.data) {
    throw new Error(data.message || 'Failed to load profile');
  }
  return data.data;
}

export async function updateProfile(input: UpdateProfileInput): Promise<UserResponse> {
  const { data } = await api.patch<ApiResponse<UserResponse>>('/users/me', input);
  if (!data.data) {
    throw new Error(data.message || 'Failed to update profile');
  }
  return data.data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<string> {
  const { data } = await api.patch<ApiResponse<unknown>>('/users/me/password', {
    currentPassword,
    newPassword,
  });
  return data.message || 'Password updated successfully';
}

export async function listUsers(
  params: ListUsersParams = {},
): Promise<PaginatedResult<UserResponse>> {
  const { data } = await api.get<ApiResponse<UserResponse[]>>('/users', { params });
  return { items: data.data ?? [], meta: data.meta };
}

export async function fetchUserStatusCounts(): Promise<UserStatusCounts> {
  const { data } = await api.get<ApiResponse<UserStatusCounts>>('/users/status-counts');
  if (!data.data) {
    throw new Error(data.message || 'Failed to load user status counts');
  }
  return data.data;
}

export async function exportUsers(params: ListUsersParams = {}): Promise<string> {
  return queueExport('/users/export', params);
}

export async function fetchUserDetailSummary(reference: string): Promise<UserDetailSummary> {
  const { data } = await api.get<ApiResponse<UserDetailSummary>>(`/users/${reference}/summary`);
  if (!data.data) {
    throw new Error(data.message || 'Failed to load user summary');
  }
  return data.data;
}

export async function adminUpdateUser(
  reference: string,
  input: AdminUpdateUserInput,
): Promise<UserResponse> {
  const { data } = await api.patch<ApiResponse<UserResponse>>(`/users/${reference}`, input);
  if (!data.data) {
    throw new Error(data.message || 'Failed to update user');
  }
  return data.data;
}
