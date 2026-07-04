import type { OrgGrant } from '@/types/auth';

export type AccessReviewRow = {
  userReference: string;
  email: string;
  roleName: string | null;
  departmentName: string | null;
  permissionNames: string[];
  orgGrants: OrgGrant[];
  capabilities: string[];
};
