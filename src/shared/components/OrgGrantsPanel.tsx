import { OrgGrantType, type OrgGrant } from '@/types/auth';
import { BuildingsIcon, InfoIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import type { DepartmentRef } from '@/types/refs';

type OrgGrantsPanelProps = {
  orgGrants?: OrgGrant[];
  managedDepartments?: DepartmentRef[];
  className?: string;
  compact?: boolean;
};

export function OrgGrantsPanel({
  orgGrants = [],
  managedDepartments = [],
  className,
  compact = false,
}: OrgGrantsPanelProps) {
  const managerGrants = orgGrants.filter(
    (grant) => grant.type === OrgGrantType.DEPARTMENT_MANAGER,
  );

  if (managerGrants.length === 0 && managedDepartments.length === 0) {
    return null;
  }

  const departments =
    managedDepartments.length > 0
      ? managedDepartments
      : managerGrants.map((grant) => ({
          reference: grant.reference ?? '',
          name: grant.label ?? 'Department',
          code: undefined,
        }));

  return (
    <div className={className}>
      <div className="mb-2 flex items-center gap-2">
        <BuildingsIcon className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Organization access</h3>
      </div>
      {!compact && (
        <p className="mb-3 text-xs text-muted-foreground">
          These grants come from org structure, not the role permissions editor. Department
          managers can approve expenses for their departments.
        </p>
      )}
      <ul className="space-y-2">
        {departments.map((department) => (
          <li key={department.reference || department.name}>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Department manager</p>
                <p className="text-xs text-muted-foreground">{department.name}</p>
              </div>
              {department.reference ? (
                <Link
                  to={`/admin/departments/${department.reference}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View department
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {!compact && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
          Includes approval, delegation, and department overview access for managed teams.
        </p>
      )}
    </div>
  );
}

export function OrgGrantsCallout() {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-muted-foreground">
      <InfoIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
      <p>
        Department manager approval is granted by assigning someone as a department manager,
        not through role permissions below.
      </p>
    </div>
  );
}
