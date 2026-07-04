import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BudgetUtilizationBar } from '@/features/budgets/components/BudgetUtilizationBar';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { formatNgn } from '@/shared/utils/money';
import type { BudgetResponse } from '@/types/api';

type BudgetsTableProps = {
  budgets: BudgetResponse[];
  togglePending: boolean;
  onEdit: (budget: BudgetResponse) => void;
  onToggleActive: (reference: string, isActive: boolean) => void;
};

export function BudgetsTable({
  budgets,
  togglePending,
  onEdit,
  onToggleActive,
}: BudgetsTableProps) {
  const { budget: budgetCaps } = useActionCapabilities();
  const showMutationActions = budgetCaps.update;
  const showActionsColumn = showMutationActions || budgets.some((budget) => budget.department);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reference</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Limit</TableHead>
          <TableHead>Committed</TableHead>
          <TableHead>Reimbursed</TableHead>
          <TableHead>Remaining</TableHead>
          <TableHead>Utilization</TableHead>
          {showActionsColumn ? <TableHead className="text-right">Actions</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {budgets.map((budget) => (
          <TableRow key={budget.reference}>
            <TableCell>
              <ReferenceCell value={budget.reference} />
            </TableCell>
            <TableCell className="font-medium">
              {budget.department ? (
                <Link
                  to={`/admin/departments/${budget.department.reference}`}
                  className="text-foreground hover:text-primary hover:underline"
                >
                  {budget.department.name}
                </Link>
              ) : (
                '—'
              )}
            </TableCell>
            <TableCell>{budget.year}</TableCell>
            <TableCell>{formatNgn(budget.amountLimit)}</TableCell>
            <TableCell>{formatNgn(budget.committedAmount)}</TableCell>
            <TableCell>{formatNgn(budget.reimbursedAmount)}</TableCell>
            <TableCell>{formatNgn(budget.remainingAmount)}</TableCell>
            <TableCell>
              <BudgetUtilizationBar
                utilizationPercent={budget.utilizationPercent}
                isOverBudget={budget.isOverBudget}
              />
            </TableCell>
            {showActionsColumn ? (
              <TableCell className="text-right">
                {showMutationActions || budget.department ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Budget actions">
                        <DotsThreeVerticalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {budget.department ? (
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/departments/${budget.department.reference}`}>
                            View department
                          </Link>
                        </DropdownMenuItem>
                      ) : null}
                      {showMutationActions ? (
                        <>
                          {budget.department ? <DropdownMenuSeparator /> : null}
                          <DropdownMenuItem onClick={() => onEdit(budget)}>Edit budget</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={togglePending}
                            onClick={() => onToggleActive(budget.reference, !budget.isActive)}
                          >
                            {budget.isActive ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
