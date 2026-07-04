import { api } from '@/shared/api/client';

import { queueExport } from '@/shared/api/export';

import { buildHashedIdempotencyScope, idempotencyHeaders, resetIdempotencyKey } from '@/shared/api/idempotency';

import type {
  ApiResponse,
  ExpenseResponse,
  FinanceQueueSummary,
  PaginatedResult,
} from '@/types/api';
import { reimburseExpense } from '@/features/expenses/api';

export type { ExpenseResponse };



export type ListFinanceParams = {

  page?: number;

  limit?: number;

  status?: string;

};



export async function listFinanceQueue(

  params: ListFinanceParams = {},

): Promise<PaginatedResult<ExpenseResponse>> {

  const { data } = await api.get<ApiResponse<ExpenseResponse[]>>('/expenses', {

    params: { ...params, status: params.status ?? 'APPROVED' },

  });



  return { items: data.data ?? [], meta: data.meta };

}



export async function fetchFinanceQueueSummary(): Promise<FinanceQueueSummary> {

  const { data } = await api.get<ApiResponse<FinanceQueueSummary>>('/expenses/finance-queue/summary');

  if (!data.data) {

    throw new Error(data.message || 'Failed to load finance queue summary');

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

  const result = await queueExport('/expenses/approved/payroll-export');

  return result.message;

}

