import type { DepartmentRef } from '@/types/refs';

export type BudgetResponse = {
  reference: string;
  department: DepartmentRef | null;
  year: number;
  amountLimit: number;
  committedAmount: number;
  reimbursedAmount: number;
  remainingAmount: number;
  utilizationPercent: number;
  isOverBudget: boolean;
  currency: string;
  isActive: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type BudgetSummaryResponse = {
  department: DepartmentRef | null;
  year: number;
  currency: string;
  amountLimit: number;
  committedAmount: number;
  reimbursedAmount: number;
  remainingAmount: number;
  utilizationPercent: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
  hasBudget: boolean;
};

export type BudgetForecastResponse = {
  hasBudget: boolean;
  year?: number;
  amountLimit?: number;
  committedAmount?: number;
  utilizationPercent?: number;
  monthlyBurnRate?: number;
  projectedYearEndCommitted?: number;
  projectedOverrun?: boolean;
};

export type OrganizationBudgetSummaryResponse = {
  year: number;
  currency: string;
  amountLimit: number;
  committedAmount: number;
  reimbursedAmount: number;
  remainingAmount: number;
  overBudgetAmount: number;
  utilizationPercent: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
  departmentCount: number;
  hasBudget: boolean;
};

export type BudgetHealthCounts = {
  year: number;
  overBudget: number;
  nearLimit: number;
  withinLimit: number;
  total: number;
};

export type BudgetByDepartmentRow = {
  departmentReference: string;
  departmentName: string;
  departmentCode: string;
  committedAmount: number;
  amountLimit: number;
  utilizationPercent: number;
  isOverBudget: boolean;
};

export type BudgetListSortField =
  | 'departmentName'
  | 'year'
  | 'amountLimit'
  | 'committedAmount'
  | 'reimbursedAmount'
  | 'remainingAmount'
  | 'utilizationPercent';

export type BudgetListSortOrder = 'ASC' | 'DESC';

export type BudgetHealthFilter = 'over_budget' | 'near_limit' | 'within_limit';
