import { api } from '@/shared/api/client';
import { queueExport } from '@/shared/api/export';
import { idempotencyHeaders, resetIdempotencyKey } from '@/shared/api/idempotency';
import { downloadBlob } from '@/shared/utils/download';
import type {
  ApiResponse,
  ExpenseActivityItem,
  ExpenseCategory,
  ExpenseCommentResponse,
  ExpenseDuplicateCheckResult,
  ExpenseListSortField,
  ExpenseListSortOrder,
  ExpensePolicyExceptionResponse,
  ExpensePolicyHint,
  ExpenseResponse,
  ExpenseStatusCounts,
  PaginatedResult,
  PolicyEvaluationResult,
  ReceiptResponse,
} from '@/types/api';

export type { ExpenseListSortField, ExpenseListSortOrder };

export type CreateExpenseInput = {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  incurredAt?: string;
};

export type ListExpensesParams = {
  page?: number;
  limit?: number;
  status?: string;
  needsAction?: boolean;
  actionableOnly?: boolean;
  sortBy?: ExpenseListSortField;
  sortOrder?: ExpenseListSortOrder;
};

export async function listMyExpenses(
  params: ListExpensesParams = {},
): Promise<PaginatedResult<ExpenseResponse>> {
  const { data } = await api.get<ApiResponse<ExpenseResponse[]>>('/expenses/me', { params });
  return { items: data.data ?? [], meta: data.meta };
}

export async function listExpenses(
  params: ListExpensesParams = {},
): Promise<PaginatedResult<ExpenseResponse>> {
  const { data } = await api.get<ApiResponse<ExpenseResponse[]>>('/expenses', { params });
  return { items: data.data ?? [], meta: data.meta };
}

export async function fetchMyExpenseStatusCounts(): Promise<ExpenseStatusCounts> {
  const { data } = await api.get<ApiResponse<ExpenseStatusCounts>>('/expenses/me/status-counts');
  if (!data.data) {
    throw new Error(data.message || 'Failed to load expense status counts');
  }
  return data.data;
}

export async function fetchExpenseStatusCounts(): Promise<ExpenseStatusCounts> {
  const { data } = await api.get<ApiResponse<ExpenseStatusCounts>>('/expenses/status-counts');
  if (!data.data) {
    throw new Error(data.message || 'Failed to load expense status counts');
  }
  return data.data;
}

export async function exportMyExpenses(params: ListExpensesParams = {}) {
  const result = await queueExport('/expenses/me/export', params);
  return result.message;
}

export async function exportExpenses(params: ListExpensesParams = {}) {
  const result = await queueExport('/expenses/export', params);
  return result.message;
}

export async function fetchExpensePolicyHints(
  category?: ExpenseCategory,
): Promise<ExpensePolicyHint[]> {
  const { data } = await api.get<ApiResponse<ExpensePolicyHint[]>>('/expenses/policy-hints', {
    params: category ? { category } : undefined,
  });
  return data.data ?? [];
}

export async function checkExpenseDuplicate(input: {
  amount: number;
  category: ExpenseCategory;
  excludeReference?: string;
  windowDays?: number;
}): Promise<ExpenseDuplicateCheckResult> {
  const { data } = await api.post<ApiResponse<ExpenseDuplicateCheckResult>>(
    '/expenses/check-duplicate',
    input,
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to check duplicate expense');
  }
  return data.data;
}

export async function getExpense(reference: string): Promise<ExpenseResponse> {
  const { data } = await api.get<ApiResponse<ExpenseResponse>>(`/expenses/${reference}`);
  if (!data.data) {
    throw new Error(data.message || 'Expense not found');
  }
  return data.data;
}

export async function createExpense(input: CreateExpenseInput): Promise<ExpenseResponse> {
  const { data } = await api.post<ApiResponse<ExpenseResponse>>('/expenses', input);
  if (!data.data) {
    throw new Error(data.message || 'Failed to create expense');
  }
  return data.data;
}

export async function updateExpense(
  reference: string,
  input: Partial<CreateExpenseInput & { incurredAt?: string | null }>,
): Promise<ExpenseResponse> {
  const { data } = await api.patch<ApiResponse<ExpenseResponse>>(
    `/expenses/${reference}`,
    input,
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to update expense');
  }
  return data.data;
}

export async function deleteExpense(reference: string): Promise<void> {
  await api.delete(`/expenses/${reference}`);
}

export type SubmitExpenseOptions = {
  policyJustifications?: Record<string, string>;
};

export async function checkExpenseSubmitPolicies(
  reference: string,
): Promise<PolicyEvaluationResult> {
  const { data } = await api.post<ApiResponse<PolicyEvaluationResult>>(
    `/expenses/${reference}/submit/check`,
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to check expense policies');
  }
  return data.data;
}

export async function submitExpense(
  reference: string,
  options?: SubmitExpenseOptions,
): Promise<ExpenseResponse> {
  const scope = `expense-submit-${reference}`;
  const { data } = await api.post<ApiResponse<ExpenseResponse>>(
    `/expenses/${reference}/submit`,
    options?.policyJustifications
      ? { policyJustifications: options.policyJustifications }
      : undefined,
    { headers: idempotencyHeaders(scope) },
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to submit expense');
  }
  resetIdempotencyKey(scope);
  return data.data;
}

export async function reopenExpense(reference: string): Promise<ExpenseResponse> {
  const { data } = await api.post<ApiResponse<ExpenseResponse>>(
    `/expenses/${reference}/reopen`,
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to reopen expense');
  }
  return data.data;
}

export async function reimburseExpense(reference: string): Promise<ExpenseResponse> {
  const scope = `expense-reimburse-${reference}`;
  const { data } = await api.post<ApiResponse<ExpenseResponse>>(
    `/expenses/${reference}/reimburse`,
    undefined,
    { headers: idempotencyHeaders(scope) },
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to reimburse expense');
  }
  resetIdempotencyKey(scope);
  return data.data;
}

export async function listExpenseComments(reference: string): Promise<ExpenseCommentResponse[]> {
  const { data } = await api.get<ApiResponse<ExpenseCommentResponse[]>>(
    `/expenses/${reference}/comments`,
  );
  return data.data ?? [];
}

export async function addExpenseComment(
  reference: string,
  body: string,
): Promise<ExpenseCommentResponse> {
  const { data } = await api.post<ApiResponse<ExpenseCommentResponse>>(
    `/expenses/${reference}/comments`,
    { body },
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to add comment');
  }
  return data.data;
}

export async function listExpensePolicyExceptions(
  reference: string,
): Promise<ExpensePolicyExceptionResponse[]> {
  const { data } = await api.get<ApiResponse<ExpensePolicyExceptionResponse[]>>(
    `/expenses/${reference}/policy-exceptions`,
  );
  return data.data ?? [];
}

export async function listExpenseActivity(reference: string): Promise<ExpenseActivityItem[]> {
  const { data } = await api.get<ApiResponse<ExpenseActivityItem[]>>(
    `/expenses/${reference}/activity`,
  );
  return data.data ?? [];
}

export async function listReceipts(expenseReference: string): Promise<ReceiptResponse[]> {
  const { data } = await api.get<ApiResponse<ReceiptResponse[]>>(
    `/expenses/${expenseReference}/receipts`,
  );
  return data.data ?? [];
}

export async function uploadReceipt(
  expenseReference: string,
  file: File,
): Promise<ReceiptResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<ApiResponse<ReceiptResponse>>(
    `/expenses/${expenseReference}/receipts/upload`,
    formData,
  );

  if (!data.data) {
    throw new Error(data.message || 'Failed to upload receipt');
  }

  return data.data;
}

export async function deleteReceipt(
  expenseReference: string,
  receiptReference: string,
): Promise<void> {
  await api.delete(`/expenses/${expenseReference}/receipts/${receiptReference}`);
}

export async function fetchReceiptBlob(
  expenseReference: string,
  receiptReference: string,
): Promise<Blob> {
  const { data } = await api.get<Blob>(
    `/expenses/${expenseReference}/receipts/${receiptReference}/download`,
    { responseType: 'blob' },
  );
  return data;
}

export async function downloadReceipt(
  expenseReference: string,
  receiptReference: string,
  fileName: string,
): Promise<void> {
  const blob = await fetchReceiptBlob(expenseReference, receiptReference);
  downloadBlob(blob, fileName);
}
