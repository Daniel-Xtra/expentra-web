import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataCard } from '@/shared/components/DataCard';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatNgn } from '@/shared/utils/money';
import { formatDate } from '@/shared/utils/format';
import type { DepartmentDetailSummary, ExpenseStatus } from '@/types/api';

type DepartmentExpenseSectionProps = {
  summary: DepartmentDetailSummary;
};

export function DepartmentExpenseSection({ summary }: DepartmentExpenseSectionProps) {
  return (
    <DataCard title="Recent expenses" description="Latest claims from this department.">
      {summary.recentExpenses.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-muted-foreground">
          No expense claims yet for this department.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Submitter</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.recentExpenses.map((expense) => (
              <TableRow key={expense.reference}>
                <TableCell>
                  <ReferenceCell value={expense.reference} variant="compact" />
                </TableCell>
                <TableCell>
                  <Link
                    to={`/expenses/${expense.reference}`}
                    className="font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {expense.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {expense.submitterName ?? '—'}
                </TableCell>
                <TableCell className="tabular-nums">{formatNgn(expense.amount)}</TableCell>
                <TableCell>
                  <StatusBadge status={expense.status as ExpenseStatus} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(expense.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DataCard>
  );
}
