import type { ExpenseCategory } from '@/features/expenses/types';
import type { ExpenseStatus } from '@/features/expenses/types';

export type ReportSpendMode = 'settled' | 'pipeline' | 'approved_unpaid';

export type ReportPeriodMode = 'month' | 'quarter' | 'year';

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

export type AgingBucket = {
  key: '0_7' | '8_14' | '15_30' | '30_plus';
  label: string;
  count: number;
  totalAmount: number;
};

export type PendingPayoutSummary = {
  currency: string;
  count: number;
  totalAmount: number;
  oldestApprovedAt?: string | null;
  agingBuckets?: AgingBucket[];
};

export type ReimbursementSlaSummary = {
  avgDays: number | null;
  reimbursedCount: number;
};

export type PeriodComparisonPoint = {
  year: number;
  month?: number;
  quarter?: number;
  totalAmount: number;
  expenseCount: number;
  amountChangePercent: number | null;
  countChangePercent: number | null;
};

export type SpendComparisonSummary = {
  monthOverMonth: PeriodComparisonPoint;
  yearOverYear: PeriodComparisonPoint;
};

export type PolicyViolationByPolicy = {
  policyReference: string;
  policyName: string | null;
  count: number;
};

export type PolicyViolationSummary = {
  exceptionCount: number;
  expenseCount: number;
  byPolicy: PolicyViolationByPolicy[];
};

export type TopSpenderRow = {
  userReference: string;
  userEmail: string;
  firstName: string | null;
  lastName: string | null;
  departmentName: string | null;
  count: number;
  totalAmount: number;
};

export type SpendingSummaryReport = {
  year: number;
  periodMode: ReportPeriodMode;
  month?: number;
  quarter?: number;
  currency: string;
  totalAmount: number;
  expenseCount: number;
  byStatus: Array<{ status: ExpenseStatus; count: number; totalAmount: number }>;
  organizationBudget: OrganizationBudgetSummary;
  pendingPayout: PendingPayoutSummary;
  reimbursementSla?: ReimbursementSlaSummary;
  comparison?: SpendComparisonSummary;
  policyViolations?: PolicyViolationSummary;
  topSpenders?: TopSpenderRow[];
};

export type MonthlySpendingRow = {
  month: number;
  totalAmount: number;
  expenseCount: number;
  categoryAmounts?: Partial<Record<ExpenseCategory, number>>;
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

export type ReportDepartmentOption = {
  reference: string;
  name: string;
  code?: string;
};

export type { ExpenseCategory };
