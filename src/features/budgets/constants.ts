import type { BudgetByDepartmentRow, BudgetListSortField, BudgetResponse } from '@/types/api';

export const ALL_VALUE = 'all';

export const statusFilterOptions = [
  { value: ALL_VALUE, label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const sortOptions: Array<{ value: BudgetListSortField; label: string }> = [
  { value: 'utilizationPercent', label: 'Utilization' },
  { value: 'remainingAmount', label: 'Remaining' },
  { value: 'committedAmount', label: 'Committed' },
  { value: 'reimbursedAmount', label: 'Reimbursed' },
  { value: 'amountLimit', label: 'Limit' },
  { value: 'departmentName', label: 'Department' },
  { value: 'year', label: 'Year' },
];

export function buildYearOptions(currentYear: number) {
  return Array.from({ length: 5 }, (_, index) => currentYear - 2 + index).map((year) => ({
    value: String(year),
    label: String(year),
  }));
}

export function buildDepartmentRowsFromBudgets(budgets: BudgetResponse[]): BudgetByDepartmentRow[] {
  return budgets
    .filter((budget) => budget.department && budget.isActive)
    .map((budget) => ({
      departmentReference: budget.department!.reference,
      departmentName: budget.department!.name,
      departmentCode: budget.department!.code,
      committedAmount: budget.committedAmount,
      amountLimit: budget.amountLimit,
      utilizationPercent: budget.utilizationPercent,
      isOverBudget: budget.isOverBudget,
    }));
}
