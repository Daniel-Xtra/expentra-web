import { api } from '@/shared/api/client';
import { idempotencyHeaders, resetIdempotencyKey } from '@/shared/api/idempotency';
import type { ApiResponse, ExpenseResponse, PaginatedResult, QueueSummary } from '@/types/api';

export type ListPendingParams = {
  page?: number;
  limit?: number;
  status?: string;
};

export async function listPendingApprovals(
  params: ListPendingParams = {},
): Promise<PaginatedResult<ExpenseResponse>> {
  const { data } = await api.get<ApiResponse<ExpenseResponse[]>>('/expenses/pending-approval', {
    params,
  });

  return { items: data.data ?? [], meta: data.meta };
}

export async function fetchPendingApprovalSummary(): Promise<QueueSummary> {
  const { data } = await api.get<ApiResponse<QueueSummary>>('/expenses/pending-approval/summary');
  return data.data ?? {};
}

export async function approveExpense(expenseReference: string, comment?: string) {
  const scope = `expense-approve-${expenseReference}`;
  const { data } = await api.post<ApiResponse<unknown>>(
    `/approvals/${expenseReference}/approve`,
    comment ? { comment } : {},
    { headers: idempotencyHeaders(scope) },
  );
  resetIdempotencyKey(scope);
  return data.data;
}

export async function rejectExpense(expenseReference: string, comment: string) {
  const scope = `expense-reject-${expenseReference}`;
  const { data } = await api.post<ApiResponse<unknown>>(
    `/approvals/${expenseReference}/reject`,
    { comment },
    { headers: idempotencyHeaders(scope) },
  );
  resetIdempotencyKey(scope);
  return data.data;
}
