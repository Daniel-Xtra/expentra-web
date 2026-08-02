import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatDate, formatLabel } from '@/shared/utils/format';
import { formatNgn } from '@/shared/utils/money';
import { formatUserName } from '@/shared/utils/user';
import type { ExpenseResponse } from '@/types/api';

type ExpensesTableProps = {
  expenses: ExpenseResponse[];
  canViewAll: boolean;
};

export function ExpensesTable({ expenses, canViewAll }: ExpensesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reference</TableHead>
          <TableHead>Title</TableHead>
          {canViewAll ? <TableHead>Employee</TableHead> : null}
          {canViewAll ? <TableHead>Department</TableHead> : null}
          <TableHead>Category</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="w-12 text-right">View</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.reference}>
            <TableCell>
              <ReferenceCell value={expense.reference} />
            </TableCell>
            <TableCell className="max-w-[220px]">
              <p className="line-clamp-1 font-medium text-foreground">{expense.title}</p>
            </TableCell>
            {canViewAll ? (
              <TableCell className="whitespace-normal">
                {expense.user ? formatUserName(expense.user) : '—'}
              </TableCell>
            ) : null}
            {canViewAll ? (
              <TableCell className="whitespace-normal">
                {expense.department?.name ?? '—'}
              </TableCell>
            ) : null}
            <TableCell>{formatLabel(expense.category)}</TableCell>
            <TableCell className="font-medium">{formatNgn(expense.amount)}</TableCell>
            <TableCell>
              <StatusBadge status={expense.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {expense.submittedAt ? formatDate(expense.submittedAt) : '—'}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon-sm"
                asChild
                aria-label={`View ${expense.title}`}
              >
                <Link to={`/expenses/${expense.reference}`}>
                  <ArrowSquareOutIcon className="size-4" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
