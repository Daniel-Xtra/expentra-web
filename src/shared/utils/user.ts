import type { AuthorizationMe, RoleRef, UserResponse } from '@/types/api';
import { formatRoleName } from './format';

export function formatUserName(user?: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
} | null): string {
  if (!user) {
    return '—';
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return name || user.email || '—';
}

export function getUserInitials(user?: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
} | null): string {
  const name = formatUserName(user);
  if (name === '—') {
    return '?';
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

function resolveRoleRef(
  role: RoleRef | string | null | undefined,
): RoleRef | null {
  if (!role) {
    return null;
  }

  if (typeof role === 'string') {
    return { reference: '', name: role };
  }

  return role;
}

export function resolveRoleLabel(
  authorization?: AuthorizationMe | null,
  user?: UserResponse | null,
  fallback = 'User',
): string {
  const role = resolveRoleRef(authorization?.role) ?? user?.role ?? null;
  return role?.name ? formatRoleName(role.name) : fallback;
}
