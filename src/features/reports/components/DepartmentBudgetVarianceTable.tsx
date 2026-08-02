import { BuildingsIcon } from '@phosphor-icons/react';
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
import { cn } from '@/lib/utils';
import { formatNgn } from '@/shared/utils/money';
import type { DepartmentVarianceRow } from '@/features/reports/report-utils';
import { ReportTableSkeleton } from '@/features/reports/components/ReportTableSkeleton';

type DepartmentBudgetVarianceTableProps = {
  description: string;
  rows: DepartmentVarianceRow[];
  loading: boolean;
  showVarianceColumns: boolean;
};

export function DepartmentBudgetVarianceTable({
  description,
  rows,
  loading,
  showVarianceColumns,
}: DepartmentBudgetVarianceTableProps) {
  return (
    <DataCard title="Department budget vs actual" description={description}>
      {loading ? (
        <ReportTableSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<BuildingsIcon className="size-6" aria-hidden />}
          title="No department data"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Claims</TableHead>
              <TableHead className="text-right">Period spend</TableHead>
              {showVarianceColumns ? (
                <>
                  <TableHead className="text-right">Annual limit</TableHead>
                  <TableHead className="text-right">YTD remaining</TableHead>
                  <TableHead className="text-right">Util % (YTD)</TableHead>
                </>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.departmentReference}>
                <TableCell>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{row.departmentName}</p>
                    {row.departmentCode ? (
                      <p className="text-xs text-muted-foreground">{row.departmentCode}</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.claimCount}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatNgn(row.periodSpend)}
                </TableCell>
                {showVarianceColumns ? (
                  <>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {row.amountLimit != null ? formatNgn(row.amountLimit) : '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {row.remainingAmount != null ? formatNgn(row.remainingAmount) : '—'}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right tabular-nums',
                        row.isOverBudget
                          ? 'font-medium text-amber-700'
                          : 'text-muted-foreground',
                      )}
                    >
                      {row.utilizationPercent != null
                        ? `${row.utilizationPercent.toFixed(1)}%`
                        : '—'}
                    </TableCell>
                  </>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DataCard>
  );
}
