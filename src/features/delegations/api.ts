import { api } from '@/shared/api/client';
import type { ApiResponse, DelegationResponse } from '@/types/api';

export type CreateDelegationInput = {
  delegateReference: string;
  startsAt: string;
  endsAt: string;
};

export async function listMyDelegations(): Promise<DelegationResponse[]> {
  const { data } = await api.get<ApiResponse<DelegationResponse[]>>('/approval-delegations/mine');
  return data.data ?? [];
}

export async function listDelegationsToMe(): Promise<DelegationResponse[]> {
  const { data } = await api.get<ApiResponse<DelegationResponse[]>>(
    '/approval-delegations/delegated-to-me',
  );
  return data.data ?? [];
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
