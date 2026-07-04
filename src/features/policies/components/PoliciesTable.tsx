import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
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
import { PolicyActiveBadge, PolicySeverityBadge } from '@/features/policies/components/policy-badges';
import { formatPolicyConfigSummary } from '@/features/policies/policy-config';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import type { ExpensePolicyResponse, PolicyCatalogResponse } from '@/types/api';

type PoliciesTableProps = {
  policies: ExpensePolicyResponse[];
  catalog: PolicyCatalogResponse;
  togglePending: boolean;
  onEdit: (policy: ExpensePolicyResponse) => void;
  onToggleActive: (reference: string, isActive: boolean) => void;
  onDelete: (policy: ExpensePolicyResponse) => void;
};

export function PoliciesTable({
  policies,
  catalog,
  togglePending,
  onEdit,
  onToggleActive,
  onDelete,
}: PoliciesTableProps) {
  const { policy: policyCaps } = useActionCapabilities();
  const showActions = policyCaps.update || policyCaps.delete;

  return (
    <Table className="min-w-[52rem]">
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[12rem]">Name</TableHead>
          <TableHead className="min-w-[24rem]">Rule summary</TableHead>
          <TableHead className="w-[1%]">Severity</TableHead>
          <TableHead className="w-[1%]">Status</TableHead>
          {showActions ? <TableHead className="w-[1%] text-right">Actions</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {policies.map((policy) => {
          const summary = formatPolicyConfigSummary(catalog, policy);
          return (
            <TableRow key={policy.reference}>
              <TableCell>
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate font-medium text-foreground">{policy.name}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {policy.reference}
                  </p>
                </div>
              </TableCell>
              <TableCell className="whitespace-normal">
                <p className="text-sm leading-relaxed text-muted-foreground break-words">
                  {summary}
                </p>
              </TableCell>
              <TableCell>
                <PolicySeverityBadge severity={policy.severity} />
              </TableCell>
              <TableCell>
                <PolicyActiveBadge isActive={policy.isActive} />
              </TableCell>
              {showActions ? (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Policy actions">
                        <DotsThreeVerticalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {policyCaps.update ? (
                        <DropdownMenuItem onClick={() => onEdit(policy)}>Edit policy</DropdownMenuItem>
                      ) : null}
                      {policyCaps.update ? (
                        <>
                          {policyCaps.delete ? <DropdownMenuSeparator /> : null}
                          <DropdownMenuItem
                            disabled={togglePending}
                            onClick={() => onToggleActive(policy.reference, !policy.isActive)}
                          >
                            {policy.isActive ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </>
                      ) : null}
                      {policyCaps.delete ? (
                        <>
                          {policyCaps.update ? <DropdownMenuSeparator /> : null}
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(policy)}
                          >
                            Delete policy
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              ) : null}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
