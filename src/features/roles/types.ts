export type RolePermissionResponse = {
  reference: string;
  name: string;
  displayName: string;
  resource: string;
  action: string;
  scope: string;
};

export type RoleResponse = {
  reference: string;
  name: string;
  description?: string | null;
  permissionCount?: number;
  permissions?: RolePermissionResponse[];
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type PermissionResponse = {
  reference: string;
  name: string;
  resource: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  parentPermissionReference: string | null;
  parentPermission: {
    reference: string;
    name: string;
    description: string | null;
    metadata: Record<string, unknown> | null;
  } | null;
};

export type PermissionsGroupedResponse = Record<string, PermissionResponse[]>;
