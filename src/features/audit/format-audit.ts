const AUDIT_ACTION_LABELS: Record<string, string> = {
  ROLE_PERMISSIONS_CHANGED: 'Role permissions changed',
  USER_ROLE_CHANGED: 'User role changed',
  USER_DEPARTMENT_CHANGED: 'User department changed',
  DEPARTMENT_MANAGER_CHANGED: 'Department manager changed',
  DELEGATION_CREATED: 'Delegation created',
  DELEGATION_REVOKED: 'Delegation revoked',
  EXPENSE_SUBMITTED: 'Expense submitted',
  EXPENSE_APPROVED: 'Expense approved',
  EXPENSE_REJECTED: 'Expense rejected',
  EXPENSE_REIMBURSED: 'Expense reimbursed',
  EXPENSE_REOPENED: 'Expense reopened',
  EXPENSE_COMMENT_ADDED: 'Expense comment added',
  POLICY_VIOLATION: 'Policy violation',
};

export function formatAuditAction(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action.replace(/_/g, ' ').toLowerCase();
}

export function formatAuditMetadata(action: string, metadata?: Record<string, unknown> | null): string | null {
  if (!metadata) {
    return null;
  }

  if (action === 'ROLE_PERMISSIONS_CHANGED' && Array.isArray(metadata.permissionNames)) {
    const names = metadata.permissionNames as string[];
    return `${names.length} permission${names.length === 1 ? '' : 's'}`;
  }

  if (action === 'USER_ROLE_CHANGED') {
    const previous = metadata.previousRoleReference ?? 'none';
    const next = metadata.nextRoleReference ?? 'unknown';
    return `Role ${String(previous)} → ${String(next)}`;
  }

  return null;
}
