import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TagSummary } from '@/features/access-review/components/TagSummary';
import { formatOrgGrantLabel } from '@/features/access-review/utils';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { formatLabel } from '@/shared/utils/format';
import type { AccessReviewRow } from '@/features/access-review/types';

type AccessReviewTableProps = {
  rows: AccessReviewRow[];
};

export function AccessReviewTable({ rows }: AccessReviewTableProps) {
  const [expandedReference, setExpandedReference] = useState<string | null>(null);

  return (
    <Table className="min-w-[56rem]">
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[14rem]">User</TableHead>
          <TableHead className="min-w-[6rem]">Role</TableHead>
          <TableHead className="min-w-[8rem]">Department</TableHead>
          <TableHead className="min-w-[12rem]">Permissions</TableHead>
          <TableHead className="min-w-[10rem]">Org grants</TableHead>
          <TableHead className="min-w-[7rem]">Capabilities</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const isExpanded = expandedReference === row.userReference;

          return (
            <Fragment key={row.userReference}>
              <TableRow>
                <TableCell className="align-top whitespace-normal">
                  <div className="flex min-w-0 flex-col gap-1">
                    <Link
                      to={`/admin/users/${row.userReference}`}
                      className="block font-medium text-foreground hover:underline"
                    >
                      {row.email}
                    </Link>
                    <ReferenceCell value={row.userReference} variant="compact" />
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  {row.roleName ? formatLabel(row.roleName) : '—'}
                </TableCell>
                <TableCell className="align-top">{row.departmentName ?? '—'}</TableCell>
                <TableCell className="align-top whitespace-normal">
                  <TagSummary items={row.permissionNames} limit={2} />
                </TableCell>
                <TableCell className="align-top whitespace-normal">
                  <TagSummary items={row.orgGrants.map(formatOrgGrantLabel)} limit={1} />
                </TableCell>
                <TableCell className="align-top">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-1"
                    onClick={() =>
                      setExpandedReference(isExpanded ? null : row.userReference)
                    }
                  >
                    <Badge variant="secondary" className="h-auto py-0.5 font-normal">
                      {row.capabilities.length}
                    </Badge>
                    <span className="ml-1 text-xs text-muted-foreground">
                      {isExpanded ? 'Hide' : 'View'}
                    </span>
                  </Button>
                </TableCell>
              </TableRow>
              {isExpanded ? (
                <TableRow>
                  <TableCell colSpan={6} className="bg-muted/20 py-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Effective capabilities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {row.capabilities.map((capability) => (
                        <Badge
                          key={capability}
                          variant="outline"
                          className="h-auto py-0.5 font-mono text-[11px] font-normal"
                        >
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
