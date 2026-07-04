import type { ListBudgetsParams } from '@/features/budgets/api';
import type { ListUsersParams } from '@/features/users/api';
import type { QueryClient } from '@tanstack/react-query';

export const queryKeys = {
  auth: {
    passwordResetValidate: (token: string) => ['auth', 'password-reset', 'validate', token] as const,
  },
  users: {
    all: ['users'] as const,
    me: () => ['users', 'me'] as const,
    list: (params: ListUsersParams & Record<string, unknown>) =>
      ['users', 'list', params] as const,
    statusCounts: () => ['users', 'status-counts'] as const,
    detail: (reference: string) => ['users', reference] as const,
    summary: (reference: string) => ['users', reference, 'summary'] as const,
  },
  roles: {
    all: ['roles'] as const,
    list: (params: { page: number; limit: number; search?: string }) =>
      ['roles', 'list', params] as const,
    catalog: () => ['roles', 'catalog'] as const,
    templates: ['roles', 'templates'] as const,
    permissions: () => ['roles', 'permissions'] as const,
  },
  departments: {
    all: ['departments'] as const,
    catalog: () => ['departments', 'catalog'] as const,
    managedList: () => ['departments-managed-list'] as const,
    list: (params: Record<string, unknown>) => ['departments', 'list', params] as const,
    statusCounts: (year: number) => ['departments', 'status-counts', year] as const,
    detail: (reference: string) => ['departments', reference] as const,
    managedDetail: (reference: string) => ['departments-managed', reference] as const,
    detailSummary: (reference: string, managed: boolean) =>
      [managed ? 'departments-managed' : 'departments', reference, 'detail-summary'] as const,
    managerOptions: (reference: string) =>
      ['departments', reference, 'users', 'manager-options'] as const,
    employees: (reference: string, managed: boolean, params: Record<string, unknown>) =>
      [managed ? 'departments-managed' : 'departments', reference, 'users', params] as const,
    userCount: (reference: string, managed: boolean) =>
      [managed ? 'departments-managed' : 'departments', reference, 'users', 'count'] as const,
    managerHistory: (reference: string, managed: boolean, params: Record<string, unknown>) =>
      [managed ? 'departments-managed' : 'departments', reference, 'manager-history', params] as const,
    budgetSummary: (reference: string, year: number | string, managed: boolean) =>
      [managed ? 'departments-managed' : 'departments', reference, 'budget-summary', year] as const,
    budgetForecast: (reference: string, year: number | string, managed: boolean) =>
      [managed ? 'departments-managed' : 'departments', reference, 'budget-forecast', year] as const,
    teamDashboard: (reference: string, year: number | string, managed: boolean) =>
      [managed ? 'departments-managed' : 'departments', reference, 'team-dashboard', year] as const,
  },
  budgets: {
    all: ['budgets'] as const,
    list: (params: ListBudgetsParams, statusFilter: string, search: string) =>
      ['budgets', 'list', params, statusFilter, search] as const,
    organizationSummary: (year: number) => ['budgets', 'organization-summary', year] as const,
    healthCounts: (year: number) => ['budgets', 'health-counts', year] as const,
    byDepartment: (year: number) => ['budgets', 'by-department', year] as const,
    meSummary: (year: number) => ['budgets', 'me', 'summary', year] as const,
    meForecast: (year: number) => ['budgets', 'me', 'forecast', year] as const,
  },
  approvalLevels: {
    all: ['approval-levels'] as const,
    list: (params: Record<string, unknown>) => ['approval-levels', 'list', params] as const,
    workflowHealth: () => ['approval-levels', 'workflow-health'] as const,
    impact: (reference: string) => ['approval-levels', 'impact', reference] as const,
  },
  policies: {
    all: ['policies'] as const,
    catalog: () => ['policies', 'catalog'] as const,
    catalogFields: () => ['policies', 'catalog', 'fields'] as const,
    catalogTemplates: () => ['policies', 'catalog', 'templates'] as const,
  },
  expenses: {
    all: ['expenses'] as const,
    scope: (scope: 'all' | 'me') => ['expenses', scope] as const,
    list: (scope: 'all' | 'me', params: Record<string, unknown>) =>
      ['expenses', scope, 'list', params] as const,
    statusCounts: (scope: 'all' | 'me') => ['expenses', scope, 'status-counts'] as const,
    detail: (reference: string) => ['expenses', reference] as const,
    comments: (reference: string) => ['expenses', reference, 'comments'] as const,
    policyExceptions: (reference: string) => ['expenses', reference, 'policy-exceptions'] as const,
    activity: (reference: string) => ['expenses', reference, 'activity'] as const,
    policyHints: (category: string) => ['expenses', 'policy-hints', category] as const,
    receipts: (reference: string) => ['receipts', reference] as const,
  },
  approvals: {
    all: ['approvals'] as const,
    summary: () => ['approvals', 'summary'] as const,
    queue: (page: number) => ['approvals', 'queue', page] as const,
  },
  finance: {
    all: ['finance'] as const,
    summary: () => ['finance', 'summary'] as const,
    queue: (page: number) => ['finance', 'queue', page] as const,
  },
  delegations: {
    all: ['delegations'] as const,
    mine: () => ['delegations', 'mine'] as const,
    toMe: () => ['delegations', 'to-me'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    inbox: (filter: string, page: number) => ['notifications', 'inbox', filter, page] as const,
    preferences: () => ['notifications', 'preferences'] as const,
    unreadCount: () => ['notifications', 'unread-count'] as const,
  },
  audit: {
    all: ['audit-logs'] as const,
    list: (params: Record<string, unknown>) => ['audit-logs', 'list', params] as const,
    resource: (resourceReference: string) => ['audit-logs', 'resource', resourceReference] as const,
  },
  accessReview: {
    all: ['access-review'] as const,
  },
  dashboard: {
    personal: (params: Record<string, unknown>) => ['dashboard', 'personal', params] as const,
    team: (params: Record<string, unknown>) => ['dashboard', 'team', params] as const,
  },
  reports: {
    summary: (params: Record<string, unknown>) => ['reports', 'summary', params] as const,
    category: (params: Record<string, unknown>) => ['reports', 'category', params] as const,
    department: (params: Record<string, unknown>) => ['reports', 'department', params] as const,
    monthly: (year: number) => ['reports', 'monthly', year] as const,
  },
} as const;

export async function invalidateExpenses(queryClient: QueryClient, reference?: string) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
  await invalidateNotifications(queryClient);
  if (reference) {
    await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.detail(reference) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.comments(reference) });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.expenses.policyExceptions(reference),
    });
    await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.activity(reference) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.receipts(reference) });
  }
}

export async function invalidateApprovalsAndExpenses(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.approvals.all });
  await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
  await invalidateNotifications(queryClient);
}

export async function invalidateFinanceAndExpenses(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
  await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
  await invalidateNotifications(queryClient);
}

export async function invalidateDepartments(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
}

export async function invalidatePoliciesCatalog(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.policies.catalog() });
}

export async function invalidateDelegations(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.delegations.all });
}

export async function invalidateNotifications(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
}
