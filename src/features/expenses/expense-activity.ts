import type { ExpenseActivityItem } from '@/types/api';

const AUDIT_ACTION_LABELS: Record<string, string> = {
  EXPENSE_CREATED: 'Expense created',
  EXPENSE_SUBMITTED: 'Submitted for approval',
  EXPENSE_APPROVED: 'Approved',
  EXPENSE_REJECTED: 'Rejected',
  EXPENSE_REIMBURSED: 'Marked as reimbursed',
  EXPENSE_REOPENED: 'Reopened as draft',
  EXPENSE_COMMENT_ADDED: 'Comment added',
  POLICY_VIOLATION: 'Policy exception noted',
  DELEGATION_CREATED: 'Delegation created',
  DELEGATION_REVOKED: 'Delegation revoked',
};

function formatAuditSummary(summary: string): string {
  return (
    AUDIT_ACTION_LABELS[summary] ??
    summary
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase())
  );
}

export function resolveExpenseActivityLabel(
  item: ExpenseActivityItem & { summary?: string },
): string {
  if (item.label?.trim()) {
    return item.label.trim();
  }

  const summary = item.summary?.trim();
  if (!summary) {
    return 'Activity update';
  }

  if (item.type === 'AUDIT' || summary.includes('_')) {
    return formatAuditSummary(summary);
  }

  return summary;
}
