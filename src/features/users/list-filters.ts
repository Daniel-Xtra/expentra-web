import type { ListUsersParams } from '@/features/users/api';

export function resolveUserListFilter(
  value: string,
): Pick<ListUsersParams, 'isActive' | 'unassignedDepartment'> {
  if (value === 'active') return { isActive: true };
  if (value === 'inactive') return { isActive: false };
  if (value === 'unassigned') return { unassignedDepartment: true };
  return {};
}
