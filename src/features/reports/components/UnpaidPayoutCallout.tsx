import {
  PayoutLiabilitySummary,
  type PayoutLiabilityMetrics,
} from '@/features/payouts/components/PayoutLiabilitySummary';
import type { PendingPayoutSummary } from '@/types/api';

type UnpaidPayoutCalloutProps = {
  payout?: PendingPayoutSummary;
  canOpenPayouts?: boolean;
};

function toMetrics(payout: PendingPayoutSummary): PayoutLiabilityMetrics {
  return {
    currency: payout.currency,
    count: payout.count,
    totalAmount: payout.totalAmount,
    oldestApprovedAt: payout.oldestApprovedAt,
  };
}

/** Reports first-viewport unpaid handoff — thin wrapper over shared liability summary. */
export function UnpaidPayoutCallout({
  payout,
  canOpenPayouts,
}: UnpaidPayoutCalloutProps) {
  if (!payout) {
    return null;
  }

  return (
    <PayoutLiabilitySummary
      metrics={toMetrics(payout)}
      showOpenPayouts={canOpenPayouts}
    />
  );
}
