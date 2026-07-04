import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  formatDelegationPeriod,
  getDelegationStatus,
  type DelegationStatus,
} from '@/features/delegations/utils';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { cn } from '@/lib/utils';
import { normalizeReference } from '@/shared/utils/reference';
import { formatUserName } from '@/shared/utils/user';
import type { DelegationResponse, UserResponse } from '@/types/api';

function DelegationStatusBadge({ status }: { status: DelegationStatus }) {
  const label =
    status === 'active'
      ? 'Active'
      : status === 'upcoming'
        ? 'Upcoming'
        : status === 'expired'
          ? 'Expired'
          : 'Revoked';

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        status === 'active' && 'bg-emerald-50 text-emerald-700',
        status === 'upcoming' && 'bg-sky-50 text-sky-700',
        status === 'expired' && 'bg-muted text-muted-foreground',
        status === 'revoked' && 'bg-rose-50 text-rose-700',
      )}
    >
      {label}
    </span>
  );
}

function resolveUser(
  reference: string,
  usersByReference: Map<string, UserResponse>,
): UserResponse | null {
  return usersByReference.get(normalizeReference(reference)) ?? null;
}

type DelegationTableProps = {
  delegations: DelegationResponse[];
  personLabel: string;
  getPersonReference: (delegation: DelegationResponse) => string;
  usersByReference: Map<string, UserResponse>;
  showActions?: boolean;
  revokeDisabled?: boolean;
  onRevoke?: (delegation: DelegationResponse, label: string) => void;
};

export function DelegationTable({
  delegations,
  personLabel,
  getPersonReference,
  usersByReference,
  showActions = false,
  revokeDisabled = false,
  onRevoke,
}: DelegationTableProps) {
  return (
    <Table className="min-w-[52rem]">
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[12rem]">{personLabel}</TableHead>
          <TableHead className="min-w-[13rem]">Period</TableHead>
          <TableHead className="min-w-[11rem]">Reference</TableHead>
          <TableHead className="w-[1%]">Status</TableHead>
          {showActions && <TableHead className="w-[1%] text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {delegations.map((delegation) => {
          const personReference = getPersonReference(delegation);
          const user = resolveUser(personReference, usersByReference);
          const status = getDelegationStatus(delegation);
          const canRevoke = delegation.isActive && status !== 'expired';

          return (
            <TableRow key={delegation.reference}>
              <TableCell>
                <div className="max-w-[16rem] space-y-0.5">
                  <p className="truncate font-medium text-foreground">
                    {user ? formatUserName(user) : personReference}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email ?? '—'}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {formatDelegationPeriod(delegation)}
              </TableCell>
              <TableCell>
                <ReferenceCell value={delegation.reference} variant="compact" />
              </TableCell>
              <TableCell className="w-[1%]">
                <DelegationStatusBadge status={status} />
              </TableCell>
              {showActions && (
                <TableCell className="w-[1%] text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-muted-foreground hover:text-destructive"
                    disabled={!canRevoke || revokeDisabled}
                    onClick={() =>
                      onRevoke?.(
                        delegation,
                        user ? formatUserName(user) : personReference,
                      )
                    }
                  >
                    Revoke
                  </Button>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
