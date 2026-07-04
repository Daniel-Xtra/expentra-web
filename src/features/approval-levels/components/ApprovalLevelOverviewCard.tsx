import {
  FlowArrowIcon,
  GitBranchIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { StatCard } from '@/shared/components/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import type { ApprovalLevelWorkflowHealth } from '@/types/api';

type ApprovalLevelOverviewCardProps = {
  health?: ApprovalLevelWorkflowHealth;
  isLoading?: boolean;
};

function OverviewSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="border-border/60">
          <CardContent className="space-y-3 pt-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ApprovalLevelOverviewCard({
  health,
  isLoading,
}: ApprovalLevelOverviewCardProps) {
  if (isLoading || !health) {
    return <OverviewSkeleton />;
  }

  const { counts, warnings } = health;
  const destructiveCount = warnings.filter((warning) => warning.destructive).length;
  const hasIssues = warnings.length > 0;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Active chain steps"
        value={counts.active}
        hint={
          counts.active > 0
            ? `${counts.active} step${counts.active === 1 ? '' : 's'} in the live approval flow`
            : 'No active levels — expenses auto-approve'
        }
        icon={<FlowArrowIcon className="size-4" weight="duotone" />}
        tone={counts.active > 0 ? 'primary' : 'warning'}
      />
      <StatCard
        label="Configured levels"
        value={counts.total}
        hint={`${counts.active} active · ${counts.inactive} inactive`}
        icon={<GitBranchIcon className="size-4" weight="duotone" />}
        tone="default"
      />
      <StatCard
        label="Workflow health"
        value={hasIssues ? warnings.length : 'Healthy'}
        hint={
          hasIssues
            ? `${destructiveCount} critical · ${warnings.length - destructiveCount} advisory`
            : 'Chain is ready for expense routing'
        }
        icon={<WarningCircleIcon className="size-4" weight="duotone" />}
        tone={destructiveCount > 0 ? 'warning' : hasIssues ? 'default' : 'success'}
      />
    </div>
  );
}
