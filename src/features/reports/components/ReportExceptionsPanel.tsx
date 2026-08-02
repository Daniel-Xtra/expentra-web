import { WarningCircleIcon, UserIcon } from '@phosphor-icons/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatNgn } from '@/shared/utils/money';
import type { PolicyViolationSummary, TopSpenderRow } from '@/types/api';

type ReportExceptionsPanelProps = {
  policyViolations?: PolicyViolationSummary | null;
  topSpenders?: TopSpenderRow[] | null;
};

function displayName(row: TopSpenderRow) {
  const name = [row.firstName, row.lastName].filter(Boolean).join(' ').trim();
  return name || row.userEmail;
}

export function ReportExceptionsPanel({
  policyViolations,
  topSpenders,
}: ReportExceptionsPanelProps) {
  const violations = policyViolations ?? {
    exceptionCount: 0,
    expenseCount: 0,
    byPolicy: [],
  };
  const spenders = topSpenders ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <DataCard
        title="Policy exceptions"
        description={`${violations.exceptionCount} noted exception${
          violations.exceptionCount === 1 ? '' : 's'
        } across ${violations.expenseCount} claim${
          violations.expenseCount === 1 ? '' : 's'
        } in the period.`}
      >
        {violations.exceptionCount === 0 ? (
          <EmptyState
            icon={<WarningCircleIcon className="size-6" aria-hidden />}
            title="No policy exceptions"
            description="No justified policy violations were recorded in this period."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy</TableHead>
                <TableHead className="text-right">Exceptions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {violations.byPolicy.map((row) => (
                <TableRow key={row.policyReference}>
                  <TableCell>
                    <p className="font-medium">
                      {row.policyName ?? 'Unknown policy'}
                    </p>
                    {row.policyReference !== 'unknown' ? (
                      <p className="text-xs text-muted-foreground">{row.policyReference}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataCard>

      <DataCard
        title="Top spenders"
        description="Highest claim totals in the selected period and mode."
      >
        {spenders.length === 0 ? (
          <EmptyState
            icon={<UserIcon className="size-6" aria-hidden />}
            title="No spenders"
            description="No claims match this period."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Claims</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spenders.map((row) => (
                <TableRow key={row.userReference}>
                  <TableCell>
                    <p className="truncate font-medium">{displayName(row)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.departmentName ?? row.userEmail}
                    </p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatNgn(row.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataCard>
    </div>
  );
}
