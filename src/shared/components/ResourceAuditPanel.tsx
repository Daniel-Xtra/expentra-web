import { useAuth } from '@/features/auth/use-auth';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState';
import { useResourceAuditLogs } from '@/shared/hooks/use-resource-audit-logs';
import { canAccess } from '@/shared/lib/capabilities';
import { formatAuditAction } from '@/features/audit/format-audit';
import { formatLabel } from '@/shared/utils/format';
import { formatUserName } from '@/shared/utils/user';

type ResourceAuditPanelProps = {
  resourceReference: string;
};

export function ResourceAuditPanel({ resourceReference }: ResourceAuditPanelProps) {
  const { authorization } = useAuth();
  const canViewAudit = canAccess(authorization?.capabilities, 'audit:read');

  const auditQuery = useResourceAuditLogs(resourceReference, canViewAudit);

  if (!canViewAudit) {
    return null;
  }

  if (auditQuery.isLoading) {
    return <LoadingState layout="auth" message="Loading audit trail…" />;
  }

  const logs = auditQuery.data ?? [];

  return (
    <DataCard title="Audit trail">
      {logs.length === 0 ? (
        <EmptyState title="No audit entries" description="Changes to this record will appear here." />
      ) : (
        <ul className="divide-y divide-border/60">
          {logs.map((log) => (
            <li key={log.reference} className="flex items-start justify-between gap-4 px-6 py-3.5 text-sm">
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-foreground">{formatAuditAction(log.action)}</p>
                <p className="text-xs text-muted-foreground">
                  {log.actor ? formatUserName(log.actor) : 'System'} · {formatLabel(log.resourceType)}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DataCard>
  );
}
