import { api } from '@/shared/api/client';
import { queueExport } from '@/shared/api/export';
import { buildHashedIdempotencyScope, idempotencyHeaders, resetIdempotencyKey } from '@/shared/api/idempotency';
import type {
  ApiResponse,
  ExpenseResponse,
  PaginatedResult,
  PayoutsQueueSummary,
} from '@/types/api';
import { reimburseExpense } from '@/features/expenses/api';

export type ListPayoutsParams = {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'amount' | 'status' | 'submittedAt' | 'approvedAt';
  sortOrder?: 'ASC' | 'DESC';
};

export async function listPayoutsQueue(
  params: ListPayoutsParams = {},
): Promise<PaginatedResult<ExpenseResponse>> {
  const { data } = await api.get<ApiResponse<ExpenseResponse[]>>('/expenses', {
    params: { ...params, status: 'APPROVED' },
  });

  return { items: data.data ?? [], meta: data.meta };
}

export async function fetchPayoutsQueueSummary(): Promise<PayoutsQueueSummary> {
  const { data } = await api.get<ApiResponse<PayoutsQueueSummary>>(
    '/expenses/finance-queue/summary',
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to load Payouts summary');
  }
  return data.data;
}

export { reimburseExpense };

export async function bulkReimburseExpenses(references: string[]) {
  const uniqueReferences = [...new Set(references)].sort();
  const scope = await buildHashedIdempotencyScope(
    'bulk-reimburse',
    uniqueReferences.join(','),
  );
  const { data } = await api.post<ApiResponse<unknown>>(
    '/expenses/reimburse/bulk',
    { references: uniqueReferences },
    { headers: idempotencyHeaders(scope) },
  );
  resetIdempotencyKey(scope);
  return data.data;
}

export async function queuePayrollExport(): Promise<string> {
  return queueExport('/expenses/approved/payroll-export');
}
