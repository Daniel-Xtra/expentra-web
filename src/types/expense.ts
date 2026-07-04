import type { DepartmentRef } from '@/types/refs';

export type ExpenseCategory = 'TRAVEL' | 'MEALS' | 'SUPPLIES' | 'OTHER';

export type ExpenseListSortField =
  | 'createdAt'
  | 'updatedAt'
  | 'amount'
  | 'status'
  | 'submittedAt';

export type ExpenseListSortOrder = 'ASC' | 'DESC';

export type ExpenseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REIMBURSED';

export type ExpenseApprovalChainStep = {
  level: number;
  name: string;
  approverType: 'department_manager' | 'finance_manager';
  status: 'waiting' | 'pending' | 'approved' | 'rejected';
  decidedAt?: string;
  decidedBy?: {
    reference: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
};

export type ExpenseResponse = {
  reference: string;
  title: string;
  description?: string | null;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  status: ExpenseStatus;
  submittedAt?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  reimbursedAt?: string | null;
  incurredAt?: string | null;
  reimbursementReference?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  nextStep?: string;
  rejectionReason?: string;
  approvalChain?: ExpenseApprovalChainStep[];
  canActOnApproval?: boolean;
  department?: DepartmentRef | null;
  user?: {
    reference: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

export type ExpenseStatusCount = {
  status: ExpenseStatus;
  count: number;
};

export type ExpenseStatusCounts = {
  byStatus: ExpenseStatusCount[];
  needsAction: number;
};

export type ExpensePolicyHint = {
  category: ExpenseCategory;
  policyName: string;
  capAmount: number;
  currentSpend: number;
  remainingAmount: number;
  utilizationPercent: number;
};

export type ExpenseDuplicateCheckResult = {
  isDuplicate: boolean;
  message?: string;
};

export type ExpenseCommentResponse = {
  reference: string;
  body: string;
  author: {
    reference: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type ExpensePolicyExceptionResponse = {
  reference: string;
  policyReference: string;
  policyName: string | null;
  justification: string;
  createdAt: string;
  author: {
    reference: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

export type ExpenseActivityItem = {
  type: string;
  label?: string;
  summary?: string;
  occurredAt: string;
  actor?: {
    reference: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  metadata?: Record<string, unknown> | null;
};

export type PolicyViolation = {
  policyReference: string;
  policyName: string;
  ruleType: string;
  severity: 'BLOCK' | 'WARN';
  message: string;
};

export type PolicyEvaluationResult = {
  violations: PolicyViolation[];
  blockingViolations: PolicyViolation[];
  warningViolations: PolicyViolation[];
};

export type ReceiptResponse = {
  reference: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  secureUrl?: string;
};
