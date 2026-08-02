import { Link } from 'react-router-dom';
import { WarningCircleIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { DataCard } from '@/shared/components/DataCard';
import { formatNgn } from '@/shared/utils/money';
import { formatLabel } from '@/shared/utils/format';
import type { DashboardPolicyWarning } from '@/types/api';

type DashboardPolicyWarningsProps = {
  warnings: DashboardPolicyWarning[];
};

export function DashboardPolicyWarnings({ warnings }: DashboardPolicyWarningsProps) {
  if (!warnings.length) {
    return null;
  }

  return (
    <DataCard
      title="Policy watch"
      description="Categories approaching your active policy caps this period."
      contentClassName="space-y-3 p-4 sm:p-5"
    >
      <ul className="space-y-3">
        {warnings.map((warning) => (
          <li
            key={`${warning.policyReference}-${warning.category}`}
            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-3"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <WarningCircleIcon
                className="mt-0.5 size-4 shrink-0 text-amber-700"
                weight="duotone"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {warning.policyName || formatLabel(warning.category)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {warning.message ||
                    `${formatLabel(warning.category)} is at ${warning.utilizationPercent.toFixed(0)}% of the cap.`}
                </p>
              </div>
            </div>
            <div className="text-right text-xs tabular-nums text-muted-foreground">
              <p className="font-medium text-foreground">
                {formatNgn(warning.currentSpend)} / {formatNgn(warning.capAmount)}
              </p>
              <p>{warning.utilizationPercent.toFixed(0)}% used</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <Link to="/expenses?status=DRAFT">Review my expenses</Link>
        </Button>
      </div>
    </DataCard>
  );
}
