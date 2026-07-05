import { api } from '@/shared/api/client';
import type { ApiResponse, DelegationResponse, PaginatedResult } from '@/types/api';

export type ListDelegationsParams = {
  page?: number;
  limit?: number;
};

export type CreateDelegationInput = {
  delegateReference: string;
  startsAt: string;
  endsAt: string;
};

export async function listMyDelegations(
  params: ListDelegationsParams = {},
): Promise<PaginatedResult<DelegationResponse>> {
  const { data } = await api.get<ApiResponse<DelegationResponse[]>>(
    '/approval-delegations/mine',
    { params },
  );
  return { items: data.data ?? [], meta: data.meta };
}

export async function listDelegationsToMe(
  params: ListDelegationsParams = {},
): Promise<PaginatedResult<DelegationResponse>> {
  const { data } = await api.get<ApiResponse<DelegationResponse[]>>(
    '/approval-delegations/delegated-to-me',
    { params },
  );
  return { items: data.data ?? [], meta: data.meta };
}

export async function createDelegation(
  input: CreateDelegationInput,
): Promise<DelegationResponse> {
  const { data } = await api.post<ApiResponse<DelegationResponse>>(
    '/approval-delegations',
    input,
  );
  if (!data.data) {
    throw new Error(data.message || 'Failed to create delegation');
  }
  return data.data;
}

export async function revokeDelegation(reference: string): Promise<void> {
  await api.post(`/approval-delegations/${reference}/revoke`);
}
