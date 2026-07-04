import type { Icon } from '@phosphor-icons/react';
import {
  BuildingsIcon,
  CheckCircleIcon,
  CircleDashedIcon,
  ClockIcon,
  CurrencyDollarIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDateTime, formatRelativeTime } from '@/shared/utils/format';
import { formatUserName } from '@/shared/utils/user';
import type { ExpenseApprovalChainStep } from '@/types/api';

type ExpenseApprovalChainProps = {
  steps: ExpenseApprovalChainStep[];
};

const APPROVER_CONFIG: Record<
  ExpenseApprovalChainStep['approverType'],
  { label: string; icon: Icon }
> = {
  department_manager: {
    label: 'Department manager',
    icon: BuildingsIcon,
  },
  finance_manager: {
    label: 'Finance manager',
    icon: CurrencyDollarIcon,
  },
};

type StepVisual = {
  ringClassName: string;
  icon: Icon;
  statusLabel: string;
  badgeClassName: string;
};

function getStepVisual(status: ExpenseApprovalChainStep['status']): StepVisual {
  switch (status) {
    case 'approved':
      return {
        ringClassName: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        icon: CheckCircleIcon,
        statusLabel: 'Approved',
        badgeClassName: 'bg-emerald-50 text-emerald-700',
      };
    case 'rejected':
      return {
        ringClassName: 'bg-rose-50 text-rose-700 ring-rose-100',
        icon: XCircleIcon,
        statusLabel: 'Rejected',
        badgeClassName: 'bg-rose-50 text-rose-700',
      };
    case 'pending':
      return {
        ringClassName: 'bg-amber-50 text-amber-700 ring-amber-100',
        icon: ClockIcon,
        statusLabel: 'Current step',
        badgeClassName: 'bg-amber-50 text-amber-700',
      };
    default:
      return {
        ringClassName: 'bg-muted text-muted-foreground ring-border',
        icon: CircleDashedIcon,
        statusLabel: 'Up next',
        badgeClassName: 'bg-muted text-muted-foreground',
      };
  }
}

function workflowSummary(steps: ExpenseApprovalChainStep[]): string {
  const rejected = steps.find((step) => step.status === 'rejected');
  if (rejected) {
    return `Rejected at ${APPROVER_CONFIG[rejected.approverType].label.toLowerCase()}`;
  }

  const pending = steps.find((step) => step.status === 'pending');
  if (pending) {
    return `Awaiting ${APPROVER_CONFIG[pending.approverType].label.toLowerCase()}`;
  }

  if (steps.every((step) => step.status === 'approved')) {
    return 'All stages complete';
  }

  return 'In progress';
}

function progressLabel(steps: ExpenseApprovalChainStep[]): string {
  const completed = steps.filter((step) => step.status === 'approved').length;
  return `${completed} of ${steps.length}`;
}

function stepSubtitle(step: ExpenseApprovalChainStep, index: number): string {
  if (step.decidedBy) {
    return formatUserName(step.decidedBy);
  }

  if (step.status === 'pending') {
    return 'Waiting for review';
  }

  if (step.status === 'waiting') {
    return `Stage ${index + 1} · Opens after prior approval`;
  }

  return `Stage ${index + 1}`;
}

export function ExpenseApprovalChain({ steps }: ExpenseApprovalChainProps) {
  if (steps.length === 0) {
    return null;
  }

  const summary = workflowSummary(steps);
  const allComplete = steps.every((step) => step.status === 'approved');

  return (
    <Card className="overflow-hidden border-border/60">
      <CardHeader className="border-b border-border/50 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold">Approval workflow</CardTitle>
            <CardDescription>{summary}</CardDescription>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
              allComplete
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {progressLabel(steps)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="px-4 py-3">
          {steps.map((step, index) => {
            const approver = APPROVER_CONFIG[step.approverType];
            const visual = getStepVisual(step.status);
            const StepIcon = visual.icon;
            const isLast = index === steps.length - 1;
            const nextStep = steps[index + 1];
            const connectorIsComplete =
              step.status === 'approved' && nextStep && nextStep.status !== 'waiting';
            const decidedAtLabel = step.decidedAt
              ? formatRelativeTime(step.decidedAt)
              : null;
            const decidedAtTitle = step.decidedAt
              ? formatDateTime(step.decidedAt)
              : undefined;

            return (
              <li
                key={`${step.level}-${step.approverType}`}
                className="relative flex gap-3 pb-4 last:pb-0"
              >
                {!isLast ? (
                  <span
                    aria-hidden
                    className={cn(
                      'absolute top-9 left-[17px] h-[calc(100%-1.25rem)] w-px',
                      connectorIsComplete ? 'bg-emerald-200' : 'bg-border/80',
                    )}
                  />
                ) : null}
                <div
                  className={cn(
                    'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-card',
                    visual.ringClassName,
                  )}
                >
                  <StepIcon className="size-4" weight="duotone" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{approver.label}</p>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                            visual.badgeClassName,
                          )}
                        >
                          {visual.statusLabel}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {stepSubtitle(step, index)}
                      </p>
                    </div>
                    {decidedAtLabel ? (
                      <time
                        className="shrink-0 text-right text-[11px] text-muted-foreground"
                        dateTime={step.decidedAt}
                        title={decidedAtTitle}
                      >
                        {decidedAtLabel}
                      </time>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
