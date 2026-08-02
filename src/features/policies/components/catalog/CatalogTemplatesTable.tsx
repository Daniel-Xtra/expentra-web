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
import { StatusPill } from '@/shared/components/StatusPill';
import type { PolicyCatalogTemplate } from '@/types/api';

type CatalogTemplatesTableProps = {
  templates: PolicyCatalogTemplate[];
  togglePending: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canUseTemplate?: boolean;
  onUseTemplate?: (template: PolicyCatalogTemplate) => void;
  onToggle: (template: PolicyCatalogTemplate) => void;
  onDelete: (reference: string) => void;
};

export function CatalogTemplatesTable({
  templates,
  togglePending,
  canUpdate = true,
  canDelete = true,
  canUseTemplate = true,
  onUseTemplate,
  onToggle,
  onDelete,
}: CatalogTemplatesTableProps) {
  const showActions =
    canUpdate || canDelete || (Boolean(onUseTemplate) && canUseTemplate);

  return (
    <Table className="whitespace-normal">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[160px]">Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[100px] whitespace-nowrap">Match</TableHead>
          <TableHead className="w-[100px] whitespace-nowrap">Conditions</TableHead>
          <TableHead className="w-[90px] whitespace-nowrap">Status</TableHead>
          {showActions ? (
            <TableHead className="w-[72px] whitespace-nowrap text-right">Actions</TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => (
          <TableRow key={template.reference}>
            <TableCell className="align-top font-medium whitespace-normal break-words">
              {template.name}
            </TableCell>
            <TableCell className="align-top whitespace-normal">
              <p className="text-sm leading-relaxed break-words text-muted-foreground">
                {template.description}
              </p>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {template.match === 'all' ? 'All (AND)' : 'Any (OR)'}
            </TableCell>
            <TableCell className="whitespace-nowrap">{template.conditions.length}</TableCell>
            <TableCell className="whitespace-nowrap">
              <StatusPill active={template.isActive} />
            </TableCell>
            {showActions ? (
              <TableCell className="whitespace-nowrap text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Template actions">
                      <DotsThreeVerticalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onUseTemplate && canUseTemplate ? (
                      <>
                        <DropdownMenuItem
                          disabled={!template.isActive}
                          onClick={() => onUseTemplate(template)}
                        >
                          Use template
                        </DropdownMenuItem>
                        {(canUpdate || canDelete) && <DropdownMenuSeparator />}
                      </>
                    ) : null}
                    {canUpdate ? (
                      <DropdownMenuItem disabled={togglePending} onClick={() => onToggle(template)}>
                        {template.isActive ? 'Hide template' : 'Show template'}
                      </DropdownMenuItem>
                    ) : null}
                    {canDelete ? (
                      <>
                        {canUpdate ? <DropdownMenuSeparator /> : null}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete(template.reference)}
                        >
                          Delete template
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
