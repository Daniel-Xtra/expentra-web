import { OrgGrantType } from '@/features/auth/types';
import type { AccessReviewRow } from '@/features/access-review/types';

export function formatOrgGrantLabel(grant: AccessReviewRow['orgGrants'][number]): string {
  if (grant.type === OrgGrantType.DEPARTMENT_MANAGER) {
    return grant.label ? `Manager · ${grant.label}` : 'Department manager';
  }
  return grant.label ?? grant.type;
}

export function matchesAccessReviewSearch(row: AccessReviewRow, query: string): boolean {
  const haystack = [
    row.email,
    row.userReference,
    row.roleName ?? '',
    row.departmentName ?? '',
    ...row.permissionNames,
    ...row.capabilities,
    ...row.orgGrants.map((grant) => grant.label ?? grant.type),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}
