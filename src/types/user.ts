import type { DepartmentRef, RoleRef } from '@/types/refs';
import type { OrgGrant } from '@/types/auth';

export type UserResponse = {
  reference: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  deactivatedAt?: string | null;
  role: RoleRef | null;
  department: DepartmentRef | null;
  isDepartmentManager?: boolean;
  createdAt?: string;
  updatedAt?: string;
  emailVerifiedAt?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type UserStatusCounts = {
  total: number;
  active: number;
  inactive: number;
  unassignedDepartment: number;
};

export type UserExpenseStats = {
  year: number;
  totalCount: number;
  draftCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  reimbursedCount: number;
  totalAmountYtd: number;
  pendingReimbursementAmount: number;
};

export type UserRecentExpense = {
  reference: string;
  title: string;
  amount: number;
  status: string;
  createdAt: string;
};

export type UserDetailSummary = {
  user: UserResponse;
  managedDepartments: DepartmentRef[];
  orgGrants?: OrgGrant[];
  expenseStats: UserExpenseStats;
  recentExpenses: UserRecentExpense[];
};
