import { ShieldWarningIcon, WarningCircleIcon } from '@phosphor-icons/react';

import { DataCard } from '@/shared/components/DataCard';

import { EmptyState } from '@/shared/components/EmptyState';

import { cn } from '@/lib/utils';

import { formatLabel } from '@/shared/utils/format';

import { formatNgn } from '@/shared/utils/money';

import type { DashboardPolicyWarning } from '@/types/api';



const POLICY_LIST_LIMIT = 3;



type DashboardPolicyWarningsProps = {

  warnings: DashboardPolicyWarning[];

  className?: string;

};



export function DashboardPolicyWarnings({ warnings, className }: DashboardPolicyWarningsProps) {

  if (warnings.length === 0) {

    return (

      <DataCard title="Policy alerts" className={className}>

        <EmptyState

          compact

          icon={<ShieldWarningIcon className="size-5 text-muted-foreground" />}

          title="No policy alerts"

          description="You're within monthly category limits."

        />

      </DataCard>

    );

  }



  const visibleWarnings = warnings.slice(0, POLICY_LIST_LIMIT);



  return (

    <DataCard title="Policy alerts" className={className}>

      <ul className="divide-y divide-border/50">

        {visibleWarnings.map((warning) => {

          const isOverCap = warning.currentSpend >= warning.capAmount;



          return (

            <li key={`${warning.policyReference}-${warning.category}`}>

              <div className="flex items-start gap-3 px-4 py-2.5 sm:px-5">

                <WarningCircleIcon

                  className={cn(

                    'mt-0.5 size-4 shrink-0',

                    isOverCap ? 'text-destructive' : 'text-amber-600',

                  )}

                  weight="fill"

                />

                <div className="min-w-0 flex-1 space-y-1">

                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">

                    <p className="text-sm font-medium text-foreground">

                      {formatLabel(warning.category)}

                    </p>

                    <span

                      className={cn(

                        'text-xs font-semibold tabular-nums',

                        isOverCap ? 'text-destructive' : 'text-amber-700',

                      )}

                    >

                      {warning.utilizationPercent}%

                    </span>

                  </div>

                  <p className="line-clamp-2 text-xs text-muted-foreground">{warning.message}</p>

                  <p className="text-[11px] text-muted-foreground">

                    {formatNgn(warning.currentSpend)} of {formatNgn(warning.capAmount)} ·{' '}

                    {warning.policyName}

                  </p>

                </div>

              </div>

            </li>

          );

        })}

      </ul>

      {warnings.length > POLICY_LIST_LIMIT ? (

        <p className="border-t border-border/50 px-4 py-2 text-center text-[11px] text-muted-foreground sm:px-5">

          +{warnings.length - POLICY_LIST_LIMIT} more alert

          {warnings.length - POLICY_LIST_LIMIT === 1 ? '' : 's'}

        </p>

      ) : null}

    </DataCard>

  );

}


