import type { OrgGrant } from '@/features/auth/types';

export type AccessReviewRow = {
  userReference: string;
  email: string;
  roleName: string | null;
  departmentName: string | null;
  permissionNames: string[];
  orgGrants: OrgGrant[];
  capabilities: string[];
};
