import { Link } from 'react-router-dom';
import {
  BuildingsIcon,
  ClipboardTextIcon,
  DotsThreeVerticalIcon,
  IdentificationCardIcon,
  UserCircleIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DepartmentStatusBadge } from '@/features/departments/components/DepartmentStatusBadge';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { formatDate } from '@/shared/utils/format';
import { formatUserName } from '@/shared/utils/user';
import type { DepartmentResponse } from '@/types/api';

type DepartmentHeroPanelProps = {
  department: DepartmentResponse;
  employeeCount?: number;
  readOnly?: boolean;
  onEdit?: () => void;
  onToggleActive?: () => void;
  onDelete?: () => void;
  togglePending?: boolean;
};

export function DepartmentHeroPanel({
  department,
  employeeCount,
  readOnly = false,
  onEdit,
  onToggleActive,
  onDelete,
  togglePending,
}: DepartmentHeroPanelProps) {
  const { department: departmentCaps } = useActionCapabilities();
  const managerLabel = department.manager
    ? formatUserName(department.manager)
    : 'Not assigned';
  const showActions =
    !readOnly && (departmentCaps.update || departmentCaps.delete);

  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BuildingsIcon className="size-7" weight="duotone" />
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {department.name}
                </h1>
                <DepartmentStatusBadge isActive={department.isActive} />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium text-foreground">
                  <IdentificationCardIcon className="size-3.5" />
                  {department.code}
                </span>
                <ReferenceCell value={department.reference} />
              </div>
            </div>
          </div>

          {showActions ? (
            <div className="flex flex-wrap items-center gap-2">
              {departmentCaps.update ? (
                <Button variant="outline" onClick={onEdit}>
                  Edit department
                </Button>
              ) : null}
              {departmentCaps.update || departmentCaps.delete ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="More actions">
                      <DotsThreeVerticalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {departmentCaps.update ? (
                      <DropdownMenuItem disabled={togglePending} onClick={onToggleActive}>
                        {department.isActive ? 'Deactivate department' : 'Activate department'}
                      </DropdownMenuItem>
                    ) : null}
                    {departmentCaps.delete ? (
                      <>
                        {departmentCaps.update ? <DropdownMenuSeparator /> : null}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={onDelete}
                        >
                          Delete department
                        </DropdownMenuItem>
                      </>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 border-t border-border/50 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border/50 bg-background/60 p-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <UserCircleIcon className="size-3.5" />
              Manager
            </div>
            {department.manager ? (
              <>
                <Link
                  to={`/admin/users/${department.manager.reference}`}
                  className="truncate text-sm font-semibold text-foreground hover:text-primary hover:underline"
                >
                  {managerLabel}
                </Link>
                <p className="truncate text-xs text-muted-foreground">{department.manager.email}</p>
              </>
            ) : (
              <p className="truncate text-sm font-semibold text-foreground">{managerLabel}</p>
            )}
          </div>

          <div className="rounded-lg border border-border/50 bg-background/60 p-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ClipboardTextIcon className="size-3.5" />
              Pending approvals
            </div>
            <p className="text-sm font-semibold text-foreground">
              {department.pendingApprovalCount}
            </p>
            {readOnly && department.pendingApprovalCount > 0 ? (
              <Link
                to="/approvals"
                className="text-xs font-medium text-primary hover:underline"
              >
                Review in approval queue
              </Link>
            ) : department.pendingApprovalCount > 0 ? (
              <Link
                to="/approvals"
                className="text-xs font-medium text-primary hover:underline"
              >
                View approval queue
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground">None waiting</p>
            )}
          </div>

          <div className="rounded-lg border border-border/50 bg-background/60 p-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <UsersThreeIcon className="size-3.5" />
              Team members
            </div>
            <p className="text-sm font-semibold text-foreground">
              {employeeCount != null ? employeeCount : '—'}
            </p>
            <p className="text-xs text-muted-foreground">Assigned to this department</p>
          </div>

          <div className="rounded-lg border border-border/50 bg-background/60 p-3 sm:col-span-2 lg:col-span-1">
            <div className="mb-1.5 text-xs font-medium text-muted-foreground">Timeline</div>
            <p className="text-xs text-muted-foreground">
              Created{' '}
              <span className="font-medium text-foreground">
                {formatDate(department.createdAt)}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Updated{' '}
              <span className="font-medium text-foreground">
                {formatDate(department.updatedAt)}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
