import {
  ArrowRightIcon,
  BriefcaseIcon,
  CalendarBlankIcon,
  ClockIcon,
  ReceiptIcon,
  TagIcon,
  UserCircleIcon,
} from '@phosphor-icons/react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatDate, formatLabel } from '@/shared/utils/format';
import { formatNgn } from '@/shared/utils/money';
import { formatUserName } from '@/shared/utils/user';
import type { ExpenseResponse } from '@/types/api';

type MetaItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function MetaItem({ icon, label, value }: MetaItemProps) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

type ExpenseSummaryCardProps = {
  expense: ExpenseResponse;
};

export function ExpenseSummaryCard({ expense }: ExpenseSummaryCardProps) {
  return (
    <Card className="overflow-hidden border-border/60">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Claim amount</p>
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {formatNgn(expense.amount)}
            </p>
            {expense.nextStep ? (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <ArrowRightIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{expense.nextStep}</span>
              </p>
            ) : null}
          </div>
          <StatusBadge status={expense.status} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <TagIcon className="size-3.5" />
            {formatLabel(expense.category)}
          </span>
          {expense.department?.name ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <BriefcaseIcon className="size-3.5" />
              {formatLabel(expense.department.name)}
            </span>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetaItem
            icon={<UserCircleIcon className="size-4" />}
            label="Submitter"
            value={expense.user ? formatUserName(expense.user) : '—'}
          />
          <MetaItem
            icon={<CalendarBlankIcon className="size-4" />}
            label="Incurred"
            value={expense.incurredAt ? formatDate(expense.incurredAt) : '—'}
          />
          <MetaItem
            icon={<ClockIcon className="size-4" />}
            label="Submitted"
            value={expense.submittedAt ? formatDate(expense.submittedAt) : '—'}
          />
          <MetaItem
            icon={<CalendarBlankIcon className="size-4" />}
            label="Approved"
            value={expense.approvedAt ? formatDate(expense.approvedAt) : '—'}
          />
          <MetaItem
            icon={<ReceiptIcon className="size-4" />}
            label="Reimbursed"
            value={expense.reimbursedAt ? formatDate(expense.reimbursedAt) : '—'}
          />
          <MetaItem
            icon={<ReceiptIcon className="size-4" />}
            label="Payment ref"
            value={expense.reimbursementReference ?? '—'}
          />
        </div>

        {expense.description?.trim() ? (
          <div className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Description
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{expense.description}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
