import type {
  ExpenseListSortField,
  ExpenseListSortOrder,
  ExpenseStatus,
} from '@/types/api';
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/pagination';

export const expenseSortOptions: Array<{ value: ExpenseListSortField; label: string }> = [
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'submittedAt', label: 'Submitted date' },
  { value: 'createdAt', label: 'Created date' },
  { value: 'amount', label: 'Amount' },
  { value: 'status', label: 'Status' },
];

export function resolveInitialExpenseFilter(searchParams: URLSearchParams) {
  const status = searchParams.get('status');
  if (status === 'DRAFT' || status === 'REJECTED') {
    return 'needs_action';
  }
  return status ?? 'all';
}

export function buildExpenseListParams(
  filter: string,
  page: number,
  sortBy: ExpenseListSortField,
  sortOrder: ExpenseListSortOrder,
) {
  return {
    page,
    limit: DEFAULT_PAGE_SIZE,
    sortBy,
    sortOrder,
    needsAction: filter === 'needs_action' ? true : undefined,
    status:
      filter !== 'all' && filter !== 'needs_action'
        ? (filter as ExpenseStatus)
        : undefined,
  };
}

export type ExpenseListScope = 'all' | 'me';
