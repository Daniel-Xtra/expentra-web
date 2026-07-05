import type { ExpenseStatus } from '@/features/expenses/types';

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
