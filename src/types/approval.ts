import type { RoleRef } from '@/types/refs';

export type ApprovalLevelResponse = {
  reference: string;
  approverType: 'department_manager' | 'finance_manager';
  role?: RoleRef;
  name: string;
  level: number;
  minimumAmount: number;
  maximumAmount?: number | null;
  isActive: boolean;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type ApprovalLevelStatusCounts = {
  total: number;
  active: number;
  inactive: number;
  departmentManager: number;
  financeManager: number;
};

export type ApprovalLevelHealthWarning = {
  code: string;
  title: string;
  description: string;
  destructive?: boolean;
};

export type ApprovalLevelWorkflowHealth = {
  counts: ApprovalLevelStatusCounts;
  warnings: ApprovalLevelHealthWarning[];
};

export type ApprovalLevelImpactSummary = {
  pendingExpenseCount: number;
  historicalDecisionCount: number;
};
