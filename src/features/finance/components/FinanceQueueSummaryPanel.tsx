import {
  ClockIcon,
  CurrencyCircleDollarIcon,
  ReceiptIcon,
  WalletIcon,
} from '@phosphor-icons/react';
import { StatCard } from '@/shared/components/StatCard';
import { formatDateTime, formatRelativeTime } from '@/shared/utils/format';
import { formatNgn } from '@/shared/utils/money';
import type { FinanceQueueSummary } from '@/types/api';

type FinanceQueueSummaryPanelProps = {
  summary: FinanceQueueSummary;
};

export function FinanceQueueSummaryPanel({ summary }: FinanceQueueSummaryPanelProps) {
  const hasQueue = summary.approvedCount > 0;
  const oldestLabel = summary.oldestApprovedAt
    ? formatRelativeTime(summary.oldestApprovedAt)
    : '—';
  const oldestHint = summary.oldestApprovedAt
    ? `Approved ${formatDateTime(summary.oldestApprovedAt)}`
    : 'No claims awaiting payout';

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Awaiting reimbursement"
        value={summary.approvedCount}
        hint={hasQueue ? 'Approved, not yet paid out' : 'Queue is clear'}
        icon={<ReceiptIcon className="size-4" weight="duotone" />}
        tone={hasQueue ? 'warning' : 'default'}
      />
      <StatCard
        label="Total payout"
        value={formatNgn(summary.approvedAmount)}
        hint={`${summary.currency} combined claim value`}
        icon={<CurrencyCircleDollarIcon className="size-4" weight="duotone" />}
        tone="primary"
      />
      <StatCard
        label="Oldest in queue"
        value={oldestLabel}
        hint={oldestHint}
        icon={<ClockIcon className="size-4" weight="duotone" />}
      />
      <StatCard
        label="Average claim"
        value={
          hasQueue ? formatNgn(Math.round(summary.approvedAmount / summary.approvedCount)) : '—'
        }
        hint={hasQueue ? 'Per approved expense' : 'No claims to average'}
        icon={<WalletIcon className="size-4" weight="duotone" />}
      />
    </div>
  );
}
