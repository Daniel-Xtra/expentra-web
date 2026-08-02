export const AUDIT_ACTION_OPTIONS = [
  'EXPENSE_CREATED',
  'EXPENSE_SUBMITTED',
  'EXPENSE_APPROVED',
  'EXPENSE_REJECTED',
  'EXPENSE_REIMBURSED',
  'EXPENSE_REOPENED',
  'EXPENSE_COMMENT_ADDED',
  'POLICY_VIOLATION',
  'DELEGATION_CREATED',
  'DELEGATION_REVOKED',
  'DEPARTMENT_MANAGER_CHANGED',
  'USER_DEPARTMENT_CHANGED',
  'USER_SUSPENDED',
  'ROLE_PERMISSIONS_CHANGED',
  'USER_ROLE_CHANGED',
] as const;

const AUDIT_ACTION_LABELS: Record<string, string> = {
  ROLE_PERMISSIONS_CHANGED: 'Role permissions changed',
  USER_ROLE_CHANGED: 'User role changed',
  USER_DEPARTMENT_CHANGED: 'User department changed',
  DEPARTMENT_MANAGER_CHANGED: 'Department manager changed',
  DELEGATION_CREATED: 'Delegation created',
  DELEGATION_REVOKED: 'Delegation revoked',
  EXPENSE_CREATED: 'Expense created',
  EXPENSE_SUBMITTED: 'Expense submitted',
  EXPENSE_APPROVED: 'Expense approved',
  EXPENSE_REJECTED: 'Expense rejected',
  EXPENSE_REIMBURSED: 'Expense reimbursed',
  EXPENSE_REOPENED: 'Expense reopened',
  EXPENSE_COMMENT_ADDED: 'Expense comment added',
  POLICY_VIOLATION: 'Policy violation',
  USER_SUSPENDED: 'User suspended',
};

export function formatAuditAction(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action.replace(/_/g, ' ').toLowerCase();
}

export function auditResourcePath(
  resourceType: string,
  resourceReference: string,
): string | null {
  switch (resourceType) {
    case 'EXPENSE':
      return `/expenses/${resourceReference}`;
    case 'USER':
      return `/admin/users/${resourceReference}`;
    case 'DEPARTMENT':
      return `/admin/departments/${resourceReference}`;
    case 'POLICY':
      return `/admin/policies`;
    case 'ROLE':
      return `/admin/roles`;
    case 'DELEGATION':
      return `/admin/delegations`;
    default:
      return null;
  }
}
