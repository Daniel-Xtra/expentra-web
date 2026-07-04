import { Link } from 'react-router-dom';

import { ArrowRightIcon, ClockCounterClockwiseIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';

import {

  Table,

  TableBody,

  TableCell,

  TableHead,

  TableHeader,

  TableRow,

} from '@/components/ui/table';

import { CATEGORY_CHIP_COLORS } from '@/features/dashboard/dashboard-utils';

import { DataCard } from '@/shared/components/DataCard';

import { EmptyState } from '@/shared/components/EmptyState';

import { StatusBadge } from '@/shared/components/StatusBadge';

import { cn } from '@/lib/utils';

import { formatDate, formatLabel } from '@/shared/utils/format';

import { formatNgn } from '@/shared/utils/money';

import type { DashboardRecentExpense } from '@/types/api';



const COMPACT_LIST_LIMIT = 5;



type DashboardRecentExpensesProps = {

  expenses: DashboardRecentExpense[];

  compact?: boolean;

  className?: string;

};



export function DashboardRecentExpenses({

  expenses,

  compact = false,

  className,

}: DashboardRecentExpensesProps) {

  const viewAllAction = (

    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" asChild>

      <Link to="/expenses">

        View all

        <ArrowRightIcon className="size-3.5" />

      </Link>

    </Button>

  );



  if (expenses.length === 0) {

    return (

      <DataCard title="Recent expenses" actions={viewAllAction} className={className}>

        <EmptyState

          compact

          icon={<ClockCounterClockwiseIcon className="size-5 text-muted-foreground" />}

          title="No recent activity"

          description="Create an expense to see it here."

        />

      </DataCard>

    );

  }



  if (compact) {

    const visibleExpenses = expenses.slice(0, COMPACT_LIST_LIMIT);



    return (

      <DataCard title="Recent expenses" actions={viewAllAction} className={cn('flex flex-col', className)}>

        <ul className="max-h-[min(18rem,42vh)] divide-y divide-border/50 overflow-y-auto">

          {visibleExpenses.map((expense) => (

            <li key={expense.reference}>

              <Link

                to={`/expenses/${expense.reference}`}

                className="group block px-4 py-2.5 transition-colors hover:bg-muted/40 sm:px-5"

              >

                <div className="flex items-start justify-between gap-3">

                  <p className="min-w-0 truncate text-sm font-medium text-foreground group-hover:text-primary">

                    {expense.title}

                  </p>

                  <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">

                    {formatNgn(expense.amount)}

                  </p>

                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">

                  <StatusBadge status={expense.status} />

                  <span

                    className={cn(

                      'inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',

                      CATEGORY_CHIP_COLORS[expense.category],

                    )}

                  >

                    {formatLabel(expense.category)}

                  </span>

                  <span className="text-[11px] text-muted-foreground">

                    {formatDate(expense.updatedAt)}

                  </span>

                </div>

              </Link>

            </li>

          ))}

        </ul>

        {expenses.length > COMPACT_LIST_LIMIT ? (

          <div className="border-t border-border/50 px-4 py-2 text-center sm:px-5">

            <Button variant="link" size="sm" className="h-auto px-0 text-xs" asChild>

              <Link to="/expenses">

                {expenses.length - COMPACT_LIST_LIMIT} more in expense list

              </Link>

            </Button>

          </div>

        ) : null}

      </DataCard>

    );

  }



  return (

    <DataCard title="Recent expenses" actions={viewAllAction} className={className}>

      <Table>

        <TableHeader>

          <TableRow>

            <TableHead>Expense</TableHead>

            <TableHead>Category</TableHead>

            <TableHead>Status</TableHead>

            <TableHead>Updated</TableHead>

            <TableHead className="text-right">Amount</TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {expenses.map((expense) => (

            <TableRow key={expense.reference}>

              <TableCell>

                <Link

                  to={`/expenses/${expense.reference}`}

                  className="font-medium text-foreground hover:text-primary hover:underline"

                >

                  {expense.title}

                </Link>

              </TableCell>

              <TableCell>

                <span

                  className={cn(

                    'inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase',

                    CATEGORY_CHIP_COLORS[expense.category],

                  )}

                >

                  {formatLabel(expense.category)}

                </span>

              </TableCell>

              <TableCell>

                <StatusBadge status={expense.status} />

              </TableCell>

              <TableCell className="text-muted-foreground">

                {formatDate(expense.updatedAt)}

              </TableCell>

              <TableCell className="text-right font-medium tabular-nums">

                {formatNgn(expense.amount)}

              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>

    </DataCard>

  );

}


