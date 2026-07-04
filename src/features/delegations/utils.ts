import type { DelegationResponse } from '@/types/api';

export type DelegationStatus = 'active' | 'upcoming' | 'expired' | 'revoked';
export type DelegationTab = 'granted' | 'received';

export function getDelegationStatus(delegation: DelegationResponse): DelegationStatus {
  if (!delegation.isActive) {
    return 'revoked';
  }

  const now = Date.now();
  const startsAt = new Date(delegation.startsAt).getTime();
  const endsAt = new Date(delegation.endsAt).getTime();

  if (now < startsAt) {
    return 'upcoming';
  }
  if (now > endsAt) {
    return 'expired';
  }
  return 'active';
}

export function formatDelegationDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDelegationPeriod(delegation: DelegationResponse): string {
  return `${formatDelegationDate(delegation.startsAt)} – ${formatDelegationDate(delegation.endsAt)}`;
}
