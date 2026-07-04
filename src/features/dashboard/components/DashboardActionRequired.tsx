import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  PencilSimpleLineIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { DataCard } from '@/shared/components/DataCard';
import { pluralize } from '@/features/dashboard/dashboard-utils';
import { formatNgn } from '@/shared/utils/money';
import type { DashboardActionBucket } from '@/types/api';

type DashboardActionRequiredProps = {
  drafts: DashboardActionBucket;
  rejected: DashboardActionBucket;
  className?: string;
};

function ActionRow({
  icon,
  title,
  description,
  count,
  amount,
  to,
  tone,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  count: number;
  amount: number;
  to: string;
  tone: 'default' | 'danger';
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={
            tone === 'danger'
              ? 'flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600'
              : 'flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700'
          }
        >
          {icon}
        </div>
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="text-xs text-muted-foreground">
            {count} {pluralize(count, 'claim')} · {formatNgn(amount)}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="shrink-0" asChild>
        <Link to={to}>
          Review
          <ArrowRightIcon className="size-3.5" />
        </Link>
      </Button>
    </div>
  );
}

export function DashboardActionRequired({
  drafts,
  rejected,
  className,
}: DashboardActionRequiredProps) {
  const totalActions = drafts.count + rejected.count;

  if (totalActions === 0) {
    return null;
  }

  return (
    <DataCard title="Needs your attention" className={className}>
      <div className="space-y-3 p-4 sm:p-5">
        {drafts.count > 0 ? (
          <ActionRow
            icon={<PencilSimpleLineIcon className="size-5" weight="duotone" />}
            title="Draft expenses"
            description="Finish and submit these claims to start approval."
            count={drafts.count}
            amount={drafts.totalAmount}
            to="/expenses?status=DRAFT"
            tone="default"
          />
        ) : null}
        {rejected.count > 0 ? (
          <ActionRow
            icon={<XCircleIcon className="size-5" weight="duotone" />}
            title="Rejected expenses"
            description="Update and resubmit these claims after reviewing feedback."
            count={rejected.count}
            amount={rejected.totalAmount}
            to="/expenses?status=REJECTED"
            tone="danger"
          />
        ) : null}
      </div>
    </DataCard>
  );
}
