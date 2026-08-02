import { api } from '@/shared/api/client';
import type {
  ApiResponse,
  PaginatedResult,
  PermissionResponse,
  PermissionsGroupedResponse,
  RoleResponse,
} from '@/types/api';

export type ListRolesParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type CreateRoleInput = {
  name: string;
  description?: string;
  templateKey?: string;
};

export type RoleTemplateResponse = {
  key: string;
  name: string;
  description: string;
  permissionCount: number;
};

export type UpdateRoleInput = {
  name?: string;
  description?: string;
};

export async function listRoleTemplates(): Promise<RoleTemplateResponse[]> {
  const { data } = await api.get<ApiResponse<RoleTemplateResponse[]>>('/roles/templates');
  return data.data ?? [];
}

function normalizePermissionsGroupedResponse(payload: unknown): PermissionsGroupedResponse {
  if (!payload) {
    return {};
  }

  if (Array.isArray(payload)) {
    return { ungroupedPermissions: payload as PermissionResponse[] };
  }

  if (typeof payload !== 'object') {
    return {};
  }

  const grouped: PermissionsGroupedResponse = {};

  for (const [key, value] of Object.entries(payload)) {
    if (Array.isArray(value)) {
      grouped[key] = value as PermissionResponse[];
    }
  }

  return grouped;
}

export async function listPermissions(): Promise<PermissionsGroupedResponse> {
  const { data } = await api.get<ApiResponse<PermissionsGroupedResponse>>('/roles/permissions');
  return normalizePermissionsGroupedResponse(data.data);
}

export async function listRoles(
  params: ListRolesParams = {},
): Promise<PaginatedResult<RoleResponse>> {
  const { data } = await api.get<ApiResponse<RoleResponse[]>>('/roles', { params });
  return { items: data.data ?? [], meta: data.meta };
}

export async function getRole(reference: string): Promise<RoleResponse> {
  const { data } = await api.get<ApiResponse<RoleResponse>>(`/roles/${reference}`);
  if (!data.data) {
    throw new Error(data.message || 'Role not found');
  }
  return data.data;
}

export async function createRole(input: CreateRoleInput): Promise<RoleResponse> {
  const { data } = await api.post<ApiResponse<RoleResponse>>('/roles', {
    name: input.name,
    description: input.description,
    templateKey: input.templateKey || undefined,
  });
  if (!data.data) {
    throw new Error(data.message || 'Failed to create role');
  }
  return data.data;
}

export async function updateRole(reference: string, input: UpdateRoleInput): Promise<RoleResponse> {
  const { data } = await api.patch<ApiResponse<RoleResponse>>(`/roles/${reference}`, input);
  if (!data.data) {
    throw new Error(data.message || 'Failed to update role');
  }
  return data.data;
}

export async function applyRoleTemplate(
  reference: string,
  templateKey: string,
): Promise<RoleResponse> {
  const { data } = await api.patch<ApiResponse<RoleResponse>>(
    `/roles/${reference}/apply-template`,
    { templateKey },
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to apply role template');
  }
  return data.data;
}

export async function setRolePermissions(
  reference: string,
  permissionReferences: string[],
): Promise<RoleResponse> {
  const { data } = await api.patch<ApiResponse<RoleResponse>>(`/roles/${reference}/permissions`, {
    permissionReferences,
  });
  if (!data.data) {
    throw new Error(data.message || 'Failed to update permissions');
  }
  return data.data;
}

export async function deleteRole(reference: string): Promise<void> {
  await api.delete(`/roles/${reference}`);
}
