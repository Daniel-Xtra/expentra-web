import type { ExpenseStatus } from '@/types/expense';

export type OrganizationBudgetSummary = {
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

export type SpendingSummaryReport = {
  year: number;
  month: number;
  currency: string;
  totalAmount: number;
  expenseCount: number;
  byStatus: Array<{ status: ExpenseStatus; count: number; totalAmount: number }>;
  organizationBudget: OrganizationBudgetSummary;
};

export type MonthlySpendingRow = {
  month: number;
  totalAmount: number;
  expenseCount: number;
};

export type YearlyMonthlySpendingReport = {
  year: number;
  currency: string;
  months: MonthlySpendingRow[];
};

export type SpendingCategoryRow = {
  category: string;
  count: number;
  totalAmount: number;
};

export type SpendingDepartmentRow = {
  departmentReference: string;
  departmentName: string;
  departmentCode: string;
  count: number;
  totalAmount: number;
};

export type QueueSummary = Record<string, number | string>;

export type FinanceQueueSummary = {
  currency: string;
  approvedCount: number;
  approvedAmount: number;
  oldestApprovedAt?: string | null;
};

export type PendingApprovalSummary = {
  currency: string;
  awaitingApprovalCount: number;
  awaitingApprovalAmount: number;
  agingApprovalCount: number;
};
