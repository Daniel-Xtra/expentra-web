import { api } from '@/shared/api/client';
import { idempotencyHeaders, resetIdempotencyKey } from '@/shared/api/idempotency';
import type { ApiResponse, ExpenseResponse, PaginatedResult, PendingApprovalSummary } from '@/types/api';

export type BulkApprovalResult = {
  succeeded: Array<{ reference: string }>;
  failed: Array<{ reference: string; reason: string }>;
  partialSuccess: boolean;
  allSucceeded: boolean;
};

export type ListPendingParams = {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'amount' | 'status' | 'submittedAt';
  sortOrder?: 'ASC' | 'DESC';
};

export async function listPendingApprovals(
  params: ListPendingParams = {},
): Promise<PaginatedResult<ExpenseResponse>> {
  const { data } = await api.get<ApiResponse<ExpenseResponse[]>>('/expenses/pending-approval', {
    params,
  });

  return { items: data.data ?? [], meta: data.meta };
}

export async function fetchPendingApprovalSummary(): Promise<PendingApprovalSummary> {
  const { data } = await api.get<ApiResponse<PendingApprovalSummary>>(
    '/expenses/pending-approval/summary',
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to load approvals summary');
  }
  return data.data;
}

export async function approveExpense(
  expenseReference: string,
  options?: { comment?: string; overBudgetAcknowledged?: boolean },
) {
  const scope = `expense-approve-${expenseReference}`;
  const body: Record<string, unknown> = {};
  if (options?.comment) {
    body.comment = options.comment;
  }
  if (options?.overBudgetAcknowledged) {
    body.overBudgetAcknowledged = true;
  }
  const { data } = await api.post<ApiResponse<unknown>>(
    `/approvals/${expenseReference}/approve`,
    body,
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

export async function bulkApproveExpenses(
  references: string[],
  options?: { comment?: string; overBudgetAcknowledged?: boolean },
) {
  const scope = `bulk-approve-${references.join(',')}`;
  const body: Record<string, unknown> = { references };
  if (options?.comment) {
    body.comment = options.comment;
  }
  if (options?.overBudgetAcknowledged) {
    body.overBudgetAcknowledged = true;
  }
  const { data } = await api.post<ApiResponse<BulkApprovalResult>>(
    '/approvals/bulk-approve',
    body,
    { headers: idempotencyHeaders(scope) },
  );
  resetIdempotencyKey(scope);
  if (!data.data) {
    throw new Error(data.message || 'Failed to approve expenses');
  }
  return data.data;
}

export async function bulkRejectExpenses(references: string[], comment: string) {
  const scope = `bulk-reject-${references.join(',')}`;
  const { data } = await api.post<ApiResponse<BulkApprovalResult>>(
    '/approvals/bulk-reject',
    { references, comment },
    { headers: idempotencyHeaders(scope) },
  );
  resetIdempotencyKey(scope);
  if (!data.data) {
    throw new Error(data.message || 'Failed to reject expenses');
  }
  return data.data;
}
