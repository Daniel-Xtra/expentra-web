export type DepartmentManagerHistoryUserRef = {
  reference: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
};

export type DepartmentManagerHistoryResponse = {
  reference: string;
  manager: DepartmentManagerHistoryUserRef | null;
  assignedBy: DepartmentManagerHistoryUserRef | null;
  startedAt: string;
  endedAt: string | null;
  isCurrent: boolean;
};

export type DepartmentResponse = {
  reference: string;
  name: string;
  code: string;
  isActive: boolean;
  hasManager: boolean;
  pendingApprovalCount: number;
  headcount?: number;
  hasBudget?: boolean;
  utilizationPercent?: number | null;
  isOverBudget?: boolean;
  isNearLimit?: boolean;
  manager: DepartmentManagerHistoryUserRef | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentListSortField =
  | 'name'
  | 'createdAt'
  | 'headcount'
  | 'utilizationPercent'
  | 'pendingApprovals';

export type DepartmentHealthFilter = 'over_budget' | 'near_limit' | 'within_limit';

export type DepartmentExpenseStats = {
  year: number;
  totalCount: number;
  draftCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  reimbursedCount: number;
  totalAmountYtd: number;
  pendingReimbursementAmount: number;
};

export type DepartmentRecentExpense = {
  reference: string;
  title: string;
  amount: number;
  status: string;
  createdAt: string;
  submitterName?: string | null;
};

export type DepartmentDetailSummary = {
  department: DepartmentResponse;
  expenseStats: DepartmentExpenseStats;
  recentExpenses: DepartmentRecentExpense[];
};
