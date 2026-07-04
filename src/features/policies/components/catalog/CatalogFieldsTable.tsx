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
import { PolicyActiveBadge } from '@/features/policies/components/policy-badges';
import { formatLabel } from '@/shared/utils/format';
import type { PolicyCatalogField } from '@/types/api';

type CatalogFieldsTableProps = {
  fields: PolicyCatalogField[];
  togglePending: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  onEdit: (field: PolicyCatalogField) => void;
  onToggle: (field: PolicyCatalogField) => void;
  onDelete: (reference: string) => void;
};

export function CatalogFieldsTable({
  fields,
  togglePending,
  canUpdate = true,
  canDelete = true,
  onEdit,
  onToggle,
  onDelete,
}: CatalogFieldsTableProps) {
  const showActions = canUpdate || canDelete;

  return (
    <Table className="whitespace-normal">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[140px]">Label</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[100px] whitespace-nowrap">Value type</TableHead>
          <TableHead className="w-[90px] whitespace-nowrap">Operators</TableHead>
          <TableHead className="w-[90px] whitespace-nowrap">Status</TableHead>
          {showActions ? (
            <TableHead className="w-[72px] whitespace-nowrap text-right">Actions</TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map((field) => (
          <TableRow key={field.reference}>
            <TableCell className="align-top font-medium whitespace-normal">{field.label}</TableCell>
            <TableCell className="align-top whitespace-normal">
              <p className="text-sm leading-relaxed break-words text-muted-foreground">
                {field.description}
              </p>
            </TableCell>
            <TableCell className="whitespace-nowrap">{formatLabel(field.valueType)}</TableCell>
            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
              {field.operators.length}
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <PolicyActiveBadge isActive={field.isActive} />
            </TableCell>
            {showActions ? (
              <TableCell className="whitespace-nowrap text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Field actions">
                      <DotsThreeVerticalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canUpdate ? (
                      <DropdownMenuItem onClick={() => onEdit(field)}>Edit field</DropdownMenuItem>
                    ) : null}
                    {canUpdate ? (
                      <>
                        {canDelete ? <DropdownMenuSeparator /> : null}
                        <DropdownMenuItem
                          disabled={togglePending}
                          onClick={() => onToggle(field)}
                        >
                          {field.isActive ? 'Hide field' : 'Show field'}
                        </DropdownMenuItem>
                      </>
                    ) : null}
                    {canDelete ? (
                      <>
                        {canUpdate ? <DropdownMenuSeparator /> : null}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete(field.reference)}
                        >
                          Delete field
                        </DropdownMenuItem>
                      </>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
