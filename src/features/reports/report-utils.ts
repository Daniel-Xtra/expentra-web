import type { BudgetByDepartmentRow } from '@/types/api';
import type { ReportPeriodMode, ReportSpendMode, SpendingDepartmentRow } from '@/features/reports/types';

export const REPORT_QUARTER_OPTIONS = [
  { value: 1, label: 'Q1 (Jan–Mar)', shortLabel: 'Q1' },
  { value: 2, label: 'Q2 (Apr–Jun)', shortLabel: 'Q2' },
  { value: 3, label: 'Q3 (Jul–Sep)', shortLabel: 'Q3' },
  { value: 4, label: 'Q4 (Oct–Dec)', shortLabel: 'Q4' },
] as const;

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

export function getCurrentReportPeriod() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    quarter: Math.floor(now.getMonth() / 3) + 1,
  };
}

export function isCurrentReportPeriod(
  periodMode: ReportPeriodMode,
  year: number,
  month: number,
  quarter: number,
) {
  const current = getCurrentReportPeriod();
  if (year !== current.year) return false;
  if (periodMode === 'year') return true;
  if (periodMode === 'quarter') return quarter === current.quarter;
  return month === current.month;
}

export function formatPeriodLabel(
  periodMode: ReportPeriodMode,
  year: number,
  month: number,
  quarter: number,
) {
  if (periodMode === 'year') return `Full year ${year}`;
  if (periodMode === 'quarter') {
    const option = REPORT_QUARTER_OPTIONS.find((entry) => entry.value === quarter);
    return `${option?.label ?? `Q${quarter}`} ${year}`;
  }
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function formatComparisonPeriodLabel(point: {
  year: number;
  month?: number;
  quarter?: number;
}) {
  if (point.quarter != null) {
    return `Q${point.quarter} ${point.year}`;
  }
  if (point.month != null) {
    return new Date(point.year, point.month - 1, 1).toLocaleDateString(undefined, {
      month: 'short',
      year: 'numeric',
    });
  }
  return String(point.year);
}

export function shiftReportUiPeriod(
  periodMode: ReportPeriodMode,
  year: number,
  month: number,
  quarter: number,
  delta: number,
): { year: number; month: number; quarter: number } {
  if (periodMode === 'year') {
    return { year: year + delta, month, quarter };
  }

  if (periodMode === 'quarter') {
    const absolute = year * 4 + quarter - 1 + delta;
    const nextYear = Math.floor(absolute / 4);
    const nextQuarter = ((absolute % 4) + 4) % 4 + 1;
    const startMonth = (nextQuarter - 1) * 3 + 1;
    return { year: nextYear, quarter: nextQuarter, month: startMonth };
  }

  const date = new Date(year, month - 1 + delta, 1);
  const nextYear = date.getFullYear();
  const nextMonth = date.getMonth() + 1;
  return {
    year: nextYear,
    month: nextMonth,
    quarter: Math.floor((nextMonth - 1) / 3) + 1,
  };
}

export function spendModeCopy(mode: ReportSpendMode) {
  const budgetClarifier =
    'Period spend is for the selected reporting period; Annual limit and YTD remaining are year-to-date budget.';

  switch (mode) {
    case 'pipeline':
      return {
        spendLabel: 'In-progress spend',
        monthlyDescription: (year: number) =>
          `Submitted through paid spend by month in ${year}, with category trends.`,
        monthlyEmpty: (year: number) =>
          `No in-progress expenses were recorded in ${year}.`,
        periodEmpty: 'No in-progress expenses were recorded in this period.',
        departmentDescription: `Period in-progress spend vs annual department budget. ${budgetClarifier}`,
        statusDescription: 'Workflow stage mix for in-progress spend in the period.',
        categoryDescription: 'Expense type mix for in-progress spend in the period.',
      };
    case 'approved_unpaid':
      return {
        spendLabel: 'Unpaid approved',
        monthlyDescription: (year: number) =>
          `Unpaid approved liability by month of submission in ${year}, with category trends.`,
        monthlyEmpty: (year: number) =>
          `No unpaid approved claims were recorded in ${year}.`,
        periodEmpty: 'No unpaid approved claims were recorded in this period.',
        departmentDescription: `Period unpaid approved spend vs annual department budget. ${budgetClarifier}`,
        statusDescription: 'Unpaid approved claims for the period (liability view).',
        categoryDescription: 'Expense type mix for unpaid approved claims in the period.',
      };
    default:
      return {
        spendLabel: 'Settled spend',
        monthlyDescription: (year: number) =>
          `Settled spend (approved and paid) by month in ${year}, with category trends.`,
        monthlyEmpty: (year: number) =>
          `No settled expenses were recorded in ${year}.`,
        periodEmpty: 'No settled expenses were recorded in this period.',
        departmentDescription: `Period settled spend vs annual department budget. ${budgetClarifier}`,
        statusDescription: 'Workflow stage mix for settled spend in the period.',
        categoryDescription: 'Expense type mix for settled spend in the period.',
      };
  }
}

export type DepartmentVarianceRow = {
  departmentReference: string;
  departmentName: string;
  departmentCode: string;
  periodSpend: number;
  claimCount: number;
  amountLimit: number | null;
  remainingAmount: number | null;
  utilizationPercent: number | null;
  isOverBudget: boolean;
};

export function buildDepartmentVarianceRows(
  spendRows: SpendingDepartmentRow[],
  budgetRows: BudgetByDepartmentRow[],
): DepartmentVarianceRow[] {
  const spendByRef = new Map(spendRows.map((row) => [row.departmentReference, row]));
  const budgetByRef = new Map(budgetRows.map((row) => [row.departmentReference, row]));
  const references = new Set([...spendByRef.keys(), ...budgetByRef.keys()]);

  return [...references]
    .map((reference) => {
      const spend = spendByRef.get(reference);
      const budget = budgetByRef.get(reference);
      const amountLimit = budget?.amountLimit ?? null;
      const committedAmount = budget?.committedAmount ?? null;
      const remainingAmount =
        amountLimit != null && committedAmount != null
          ? Math.max(0, amountLimit - committedAmount)
          : null;

      return {
        departmentReference: reference,
        departmentName: spend?.departmentName ?? budget?.departmentName ?? 'Unknown',
        departmentCode: spend?.departmentCode ?? budget?.departmentCode ?? '',
        periodSpend: spend?.totalAmount ?? 0,
        claimCount: spend?.count ?? 0,
        amountLimit,
        remainingAmount,
        utilizationPercent: budget?.utilizationPercent ?? null,
        isOverBudget: budget?.isOverBudget ?? false,
      };
    })
    .sort(
      (a, b) =>
        b.periodSpend - a.periodSpend || a.departmentName.localeCompare(b.departmentName),
    );
}
