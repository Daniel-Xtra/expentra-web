import type { Icon } from '@phosphor-icons/react';
import {
  ChatCircleIcon,
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  PaperPlaneTiltIcon,
  ProhibitIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/shared/components/EmptyState';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/shared/utils/format';
import { formatUserName } from '@/shared/utils/user';
import type { ExpenseActivityItem } from '@/types/api';
import { resolveExpenseActivityLabel } from '../expense-activity';

function getActivityIcon(item: ExpenseActivityItem): {
  icon: Icon;
  className: string;
} {
  const summary = (item.summary ?? item.label ?? '').toUpperCase();

  if (summary.includes('SUBMITTED') || summary.includes('SUBMIT')) {
    return { icon: PaperPlaneTiltIcon, className: 'bg-sky-50 text-sky-700 ring-sky-100' };
  }
  if (summary.includes('APPROVED') || summary.includes('APPROVE')) {
    return { icon: CheckCircleIcon, className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' };
  }
  if (summary.includes('REJECTED') || summary.includes('REJECT')) {
    return { icon: ProhibitIcon, className: 'bg-rose-50 text-rose-700 ring-rose-100' };
  }
  if (summary.includes('POLICY') || summary.includes('JUSTIFICATION')) {
    return { icon: WarningCircleIcon, className: 'bg-amber-50 text-amber-700 ring-amber-100' };
  }
  if (item.type === 'COMMENT' || summary.includes('COMMENT')) {
    return { icon: ChatCircleIcon, className: 'bg-violet-50 text-violet-700 ring-violet-100' };
  }

  return { icon: ClockCounterClockwiseIcon, className: 'bg-muted text-muted-foreground ring-border' };
}

type ExpenseActivityTimelineProps = {
  items: ExpenseActivityItem[];
  className?: string;
};

export function ExpenseActivityTimeline({ items, className }: ExpenseActivityTimelineProps) {
  return (
    <Card className={cn('overflow-hidden border-border/60', className)}>
      <CardHeader className="border-b border-border/50 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold">Activity</CardTitle>
            <CardDescription>Submission, approval, and policy events</CardDescription>
          </div>
          {items.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {items.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="max-h-[min(20rem,45vh)] overflow-y-auto p-0">
        {items.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Events on this claim will appear here."
            className="py-8"
          />
        ) : (
          <ul className="px-4 py-3">
            {items.map((item, index) => {
              const { icon: ActivityIcon, className: iconClassName } = getActivityIcon(item);
              const label = resolveExpenseActivityLabel(item);
              const isLast = index === items.length - 1;

              return (
                <li key={`${item.occurredAt}-${index}`} className="relative flex gap-3 pb-4 last:pb-0">
                  {!isLast && (
                    <span
                      className="absolute top-9 left-[17px] h-[calc(100%-1.25rem)] w-px bg-border/80"
                      aria-hidden
                    />
                  )}
                  <div
                    className={cn(
                      'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-card',
                      iconClassName,
                    )}
                  >
                    <ActivityIcon className="size-4" weight="duotone" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <time
                        className="shrink-0 text-[11px] text-muted-foreground"
                        dateTime={item.occurredAt}
                      >
                        {formatRelativeTime(item.occurredAt)}
                      </time>
                    </div>
                    {item.actor && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatUserName(item.actor)}
                      </p>
                    )}
                    {typeof item.metadata?.justification === 'string' && (
                      <blockquote className="mt-2 border-l-2 border-amber-300/80 bg-amber-50/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                        {item.metadata.justification}
                      </blockquote>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
