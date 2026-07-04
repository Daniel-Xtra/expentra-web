import { canAccess, hasManagedDepartmentAccess } from '@/shared/lib/capabilities';
import type { AuthorizationMe } from '@/types/auth';

export type NavAccess = string | string[];

export type NavItem = {
  label: string;
  to: string;
  capabilities?: NavAccess;
  /** Requires an active department-manager org grant (not implied by `*`). */
  requiresManagedDepartment?: boolean;
  end?: boolean;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

/** Capability requirement shared by notifications nav, TopBar bell, and route guard. */
export const NOTIFICATION_READ_ACCESS: NavAccess = [
  'notification:read',
  'notification:read:own',
];

/** Single source of truth for sidebar links and route guards. */
export const navSections: NavSection[] = [
  {
    items: [
      {
        label: 'Dashboard',
        to: '/dashboard',
        capabilities: ['dashboard:read', 'dashboard:read:own'],
      },
      {
        label: 'Expenses',
        to: '/expenses',
        end: true,
        capabilities: ['expense:read', 'expense:read:own', 'expense:read:company'],
      },
      {
        label: 'Approvals',
        to: '/approvals',
        capabilities: [
          'approval:approve',
          'approval:reject',
          'approval:approve:department',
          'approval:reject:department',
        ],
      },
      {
        label: 'Department overview',
        to: '/department-overview',
        capabilities: 'department:read:managed',
        requiresManagedDepartment: true,
      },
      { label: 'Finance', to: '/finance', capabilities: 'expense:reimburse' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Users', to: '/admin/users', capabilities: 'user:read' },
      { label: 'Roles', to: '/admin/roles', capabilities: 'role:read' },
      { label: 'Departments', to: '/admin/departments', capabilities: 'department:read' },
      { label: 'Budgets', to: '/admin/budgets', capabilities: 'budget:read' },
      {
        label: 'Approval levels',
        to: '/admin/approval-levels',
        capabilities: 'approval_level:read',
      },
      { label: 'Delegations', to: '/admin/delegations', capabilities: 'approval:read' },
      { label: 'Policies', to: '/admin/policies', capabilities: 'policy:read' },
      { label: 'Reports', to: '/admin/reports', capabilities: 'report:read' },
      { label: 'Audit logs', to: '/admin/audit-logs', capabilities: 'audit:read' },
      {
        label: 'Access review',
        to: '/admin/access-review',
        capabilities: 'audit:read',
      },
    ],
  }
];

export type ProtectedRouteConfig = {
  id: string;
  path: string;
  capabilities: NavAccess;
  requiresManagedDepartment?: boolean;
  fallback?: string;
  index?: boolean;
};

/** Capability requirements aligned with `navSections` and nested app routes. */
export const protectedRouteConfigs: ProtectedRouteConfig[] = [
  {
    id: 'dashboard',
    path: 'dashboard',
    capabilities: ['dashboard:read', 'dashboard:read:own'],
    fallback: '/expenses',
  },
  {
    id: 'expenses',
    path: 'expenses',
    capabilities: ['expense:read', 'expense:read:own', 'expense:read:company'],
  },
  {
    id: 'expense-create',
    path: 'expenses/new',
    capabilities: 'expense:create',
    fallback: '/expenses',
  },
  {
    id: 'approvals',
    path: 'approvals',
    capabilities: [
      'approval:approve',
      'approval:reject',
      'approval:approve:department',
      'approval:reject:department',
    ],
  },
  {
    id: 'department-overview',
    path: 'department-overview',
    capabilities: 'department:read:managed',
    requiresManagedDepartment: true,
  },
  {
    id: 'department-overview-detail',
    path: 'department-overview/:reference',
    capabilities: 'department:read:managed',
    requiresManagedDepartment: true,
  },
  {
    id: 'finance',
    path: 'finance',
    capabilities: 'expense:reimburse',
  },
  {
    id: 'notifications',
    path: 'notifications',
    capabilities: NOTIFICATION_READ_ACCESS,
  },
  {
    id: 'admin-users',
    path: 'admin/users',
    capabilities: 'user:read',
  },
  {
    id: 'admin-roles',
    path: 'admin/roles',
    capabilities: 'role:read',
  },
  {
    id: 'admin-departments',
    path: 'admin/departments',
    capabilities: 'department:read',
  },
  {
    id: 'admin-budgets',
    path: 'admin/budgets',
    capabilities: 'budget:read',
  },
  {
    id: 'admin-approval-levels',
    path: 'admin/approval-levels',
    capabilities: 'approval_level:read',
  },
  {
    id: 'admin-delegations',
    path: 'admin/delegations',
    capabilities: 'approval:read',
  },
  {
    id: 'admin-policies',
    path: 'admin/policies',
    capabilities: 'policy:read',
  },
  {
    id: 'admin-reports',
    path: 'admin/reports',
    capabilities: 'report:read',
  },
  {
    id: 'audit-logs',
    path: 'admin/audit-logs',
    capabilities: 'audit:read',
  },
  {
    id: 'access-review',
    path: 'admin/access-review',
    capabilities: 'audit:read',
  },
];

export function hasNavAccess(
  capabilities: string[] | undefined,
  required: NavAccess,
): boolean {
  if (!capabilities?.length) {
    return false;
  }

  return canAccess(capabilities, required);
}

export function canAccessNavItem(
  authorization: Pick<AuthorizationMe, 'capabilities' | 'managedDepartments' | 'orgGrants'> | null | undefined,
  item: NavItem,
): boolean {
  if (!item.capabilities) {
    return false;
  }

  if (item.requiresManagedDepartment && !hasManagedDepartmentAccess(authorization)) {
    return false;
  }

  return hasNavAccess(authorization?.capabilities, item.capabilities);
}

export function canAccessRoute(
  authorization: Pick<AuthorizationMe, 'capabilities' | 'managedDepartments' | 'orgGrants'> | null | undefined,
  config: Pick<ProtectedRouteConfig, 'capabilities' | 'requiresManagedDepartment'>,
): boolean {
  if (config.requiresManagedDepartment && !hasManagedDepartmentAccess(authorization)) {
    return false;
  }

  return hasNavAccess(authorization?.capabilities, config.capabilities);
}

export function filterNavSections(
  authorization: Pick<AuthorizationMe, 'capabilities' | 'managedDepartments' | 'orgGrants'> | null | undefined,
): NavSection[] {
  return navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessNavItem(authorization, item)),
    }))
    .filter((section) => section.items.length > 0);
}

export function getDefaultNavPath(
  authorization: Pick<AuthorizationMe, 'capabilities' | 'managedDepartments' | 'orgGrants'> | null | undefined,
): string {
  for (const section of navSections) {
    for (const item of section.items) {
      if (canAccessNavItem(authorization, item)) {
        return item.to;
      }
    }
  }

  return '/profile';
}

export function getRouteCapabilities(path: string): NavAccess | undefined {
  const normalized = path.replace(/^\//, '');
  const config = protectedRouteConfigs.find((route) => route.path === normalized);
  return config?.capabilities;
}
