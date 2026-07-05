import { useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { canAccess } from '@/shared/lib/capabilities';

function useCaps() {
  const { authorization } = useAuth();
  return authorization?.capabilities ?? [];
}

export function useActionCapabilities() {
  const caps = useCaps();

  return useMemo(
    () => ({
      policy: {
        create: canAccess(caps, 'policy:create'),
        update: canAccess(caps, 'policy:update'),
        delete: canAccess(caps, 'policy:delete'),
        read: canAccess(caps, 'policy:read'),
      },
      budget: {
        create: canAccess(caps, 'budget:create'),
        update: canAccess(caps, 'budget:update'),
        read: canAccess(caps, 'budget:read'),
        export: canAccess(caps, 'budget:read'),
      },
      department: {
        create: canAccess(caps, 'department:create'),
        update: canAccess(caps, 'department:update'),
        delete: canAccess(caps, 'department:delete'),
        read: canAccess(caps, 'department:read'),
        export: canAccess(caps, 'department:read'),
      },
      approval: {
        read: canAccess(caps, 'approval:read'),
        approve: canAccess(caps, [
          'approval:approve',
          'approval:approve:global',
          'approval:approve:department',
        ]),
        reject: canAccess(caps, [
          'approval:reject',
          'approval:reject:global',
          'approval:reject:department',
        ]),
      },
      approvalLevel: {
        create: canAccess(caps, 'approval_level:create'),
        update: canAccess(caps, 'approval_level:update'),
        delete: canAccess(caps, 'approval_level:delete'),
        read: canAccess(caps, 'approval_level:read'),
        export: canAccess(caps, 'approval_level:read'),
      },
      role: {
        create: canAccess(caps, 'role:create'),
        update: canAccess(caps, 'role:update'),
        delete: canAccess(caps, 'role:delete'),
        read: canAccess(caps, 'role:read'),
      },
      user: {
        create: canAccess(caps, 'user:create'),
        update: canAccess(caps, 'user:update'),
        read: canAccess(caps, 'user:read'),
        export: canAccess(caps, 'user:read'),
      },
      expense: {
        create: canAccess(caps, 'expense:create'),
        update: canAccess(caps, ['expense:update', 'expense:update:own']),
        delete: canAccess(caps, ['expense:delete', 'expense:delete:own']),
        submit: canAccess(caps, ['expense:submit', 'expense:submit:own']),
        reimburse: canAccess(caps, 'expense:reimburse'),
        readCompany: canAccess(caps, 'expense:read:company'),
        export: canAccess(caps, ['expense:read:company', 'expense:read']),
        exportPayroll: canAccess(caps, 'expense:reimburse'),
      },
      receipt: {
        upload: canAccess(caps, ['receipt:upload', 'receipt:create', 'receipt:create:own']),
        delete: canAccess(caps, ['receipt:delete', 'receipt:delete:own']),
      },
      report: {
        read: canAccess(caps, 'report:read'),
        export: canAccess(caps, 'report:export'),
      },
      dashboard: {
        read: canAccess(caps, ['dashboard:read', 'dashboard:read:own']),
        readTeam: canAccess(caps, ['dashboard:read:team', 'department:read:managed']),
        export: canAccess(caps, ['dashboard:read', 'dashboard:read:own']),
      },
      departmentManaged: {
        read: canAccess(caps, ['department:read:managed', 'department:read']),
      },
      notification: {
        read: canAccess(caps, ['notification:read', 'notification:read:own']),
        mark: canAccess(caps, ['notification:mark', 'notification:mark:own']),
        update: canAccess(caps, ['notification:update', 'notification:update:own']),
      },
      audit: {
        read: canAccess(caps, 'audit:read'),
        export: canAccess(caps, 'audit:read'),
      },
      delegation: {
        manage: canAccess(caps, [
          'approval:approve',
          'approval:approve:global',
          'approval:approve:department',
        ]),
      },
    }),
    [caps],
  );
}
