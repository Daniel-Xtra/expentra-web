import {
  BuildingsIcon,
  CheckCircleIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/shared/components/StatCard';

export type DepartmentOverviewStats = {
  total: number;
  activeCount: number;
  inactiveCount: number;
  withManagerCount: number;
  isPartial?: boolean;
};

type DepartmentOverviewCardProps = {
  stats: DepartmentOverviewStats | null;
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

function sharePercent(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

export function DepartmentOverviewCard({ stats, isLoading }: DepartmentOverviewCardProps) {
  if (isLoading) {
    return <OverviewSkeleton />;
  }

  const resolved = stats ?? {
    total: 0,
    activeCount: 0,
    inactiveCount: 0,
    withManagerCount: 0,
  };

  const activeRate = sharePercent(resolved.activeCount, resolved.total);
  const managerRate = sharePercent(resolved.withManagerCount, resolved.total);
  const partialHint = resolved.isPartial ? 'Counts based on loaded departments' : undefined;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Total departments"
        value={resolved.total}
        hint={
          partialHint ??
          `${resolved.activeCount} active · ${resolved.inactiveCount} inactive`
        }
        icon={<BuildingsIcon className="size-4" weight="duotone" />}
        tone="primary"
      />
      <StatCard
        label="Active departments"
        value={resolved.activeCount}
        hint={
          partialHint ??
          (resolved.total > 0
            ? `${activeRate}% currently accepting assignments`
            : 'No departments configured yet')
        }
        icon={<CheckCircleIcon className="size-4" weight="duotone" />}
        tone="success"
      />
      <StatCard
        label="With manager assigned"
        value={resolved.withManagerCount}
        hint={
          partialHint ??
          (resolved.total > 0
            ? `${managerRate}% have a designated lead`
            : 'Assign managers to improve accountability')
        }
        icon={<UsersThreeIcon className="size-4" weight="duotone" />}
        tone={resolved.withManagerCount > 0 ? 'default' : 'warning'}
      />
    </div>
  );
}
