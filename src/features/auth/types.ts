import type { UserResponse } from '@/features/users/types';
import type { DepartmentRef, RoleRef } from '@/shared/types/refs';

export type LoginResult = {
  accessToken: string;
  user: UserResponse;
};

export type RegisterResult = {
  accessToken: string;
  user: {
    email: string;
    isEmailVerified: boolean;
  };
};

export type SignUpInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export const OrgGrantType = {
  DEPARTMENT_MANAGER: 'department_manager',
} as const;

export type OrgGrantType = (typeof OrgGrantType)[keyof typeof OrgGrantType];

export type OrgGrant = {
  type: OrgGrantType;
  label?: string;
  reference?: string;
};

export type AuthorizationMe = {
  reference: string;
  email: string;
  role: RoleRef | null;
  department: DepartmentRef | null;
  orgGrants: OrgGrant[];
  managedDepartments: DepartmentRef[];
  capabilities: string[];
  abilityRules: unknown[];
};
