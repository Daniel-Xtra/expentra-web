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
import { StatusPill } from '@/shared/components/StatusPill';
import { cn } from '@/lib/utils';
import { normalizeReference } from '@/shared/utils/reference';
import { formatUserName } from '@/shared/utils/user';
import type {
  DelegationPerson,
  DelegationResponse,
  UserResponse,
} from '@/types/api';

function DelegationStatusBadge({ status }: { status: DelegationStatus }) {
  if (status === 'active') {
    return <StatusPill active />;
  }

  const label =
    status === 'upcoming' ? 'Upcoming' : status === 'expired' ? 'Expired' : 'Revoked';

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        status === 'upcoming' && 'bg-sky-50 text-sky-700',
        status === 'expired' && 'bg-muted text-muted-foreground',
        status === 'revoked' && 'bg-rose-50 text-rose-700',
      )}
    >
      {label}
    </span>
  );
}

function resolvePerson(
  person: DelegationPerson | undefined,
  reference: string,
  usersByReference: Map<string, UserResponse>,
): DelegationPerson | UserResponse | null {
  if (person?.email || person?.firstName || person?.lastName) {
    return person;
  }
  return usersByReference.get(normalizeReference(reference)) ?? person ?? null;
}

type DelegationTableProps = {
  delegations: DelegationResponse[];
  personLabel: string;
  getPerson: (delegation: DelegationResponse) => {
    reference: string;
    person?: DelegationPerson;
  };
  usersByReference: Map<string, UserResponse>;
  showActions?: boolean;
  revokeDisabled?: boolean;
  onRevoke?: (delegation: DelegationResponse, label: string) => void;
};

export function DelegationTable({
  delegations,
  personLabel,
  getPerson,
  usersByReference,
  showActions = false,
  revokeDisabled = false,
  onRevoke,
}: DelegationTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{personLabel}</TableHead>
          <TableHead className="hidden md:table-cell">Period</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead className="w-[1%]">Status</TableHead>
          {showActions && <TableHead className="w-[1%] text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {delegations.map((delegation) => {
          const { reference: personReference, person } = getPerson(delegation);
          const user = resolvePerson(person, personReference, usersByReference);
          const status = getDelegationStatus(delegation);
          const canRevoke = delegation.isActive && status !== 'expired';
          const displayName = formatUserName(user);
          const displayEmail = user?.email?.trim() || null;

          return (
            <TableRow key={delegation.reference}>
              <TableCell>
                <div className="max-w-[16rem] space-y-0.5">
                  <p className="truncate font-medium text-foreground">
                    {displayName !== '—' ? displayName : personReference}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {displayEmail ?? '—'}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums md:hidden">
                    {formatDelegationPeriod(delegation)}
                  </p>
                </div>
              </TableCell>
              <TableCell className="hidden text-muted-foreground tabular-nums md:table-cell">
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
                        displayName !== '—' ? displayName : personReference,
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
