import { lazy } from 'react';
import type { ComponentType } from 'react';
import { withLazyPage } from '@/shared/components/LazyPage';

function lazyNamed<T extends Record<string, ComponentType>>(
  factory: () => Promise<T>,
  exportName: keyof T & string,
) {
  return lazy(() => factory().then((module) => ({ default: module[exportName] as ComponentType })));
}

export const DashboardPage = withLazyPage(
  lazyNamed(() => import('@/features/dashboard/DashboardPage'), 'DashboardPage'),
);
export const ExpenseListPage = withLazyPage(
  lazyNamed(() => import('@/features/expenses/ExpenseListPage'), 'ExpenseListPage'),
);
export const ExpenseDetailPage = withLazyPage(
  lazyNamed(() => import('@/features/expenses/ExpenseDetailPage'), 'ExpenseDetailPage'),
);
export const CreateExpensePage = withLazyPage(
  lazyNamed(() => import('@/features/expenses/CreateExpensePage'), 'CreateExpensePage'),
);
export const ProfilePage = withLazyPage(
  lazyNamed(() => import('@/features/users/ProfilePage'), 'ProfilePage'),
);
export const ApprovalQueuePage = withLazyPage(
  lazyNamed(() => import('@/features/approvals/ApprovalQueuePage'), 'ApprovalQueuePage'),
);
export const DepartmentOverviewPage = withLazyPage(
  lazyNamed(() => import('@/features/departments/DepartmentOverviewPage'), 'DepartmentOverviewPage'),
);
export const FinanceQueuePage = withLazyPage(
  lazyNamed(() => import('@/features/finance/FinanceQueuePage'), 'FinanceQueuePage'),
);
export const ReportsPage = withLazyPage(
  lazyNamed(() => import('@/features/reports/ReportsPage'), 'ReportsPage'),
);
export const NotificationsPage = withLazyPage(
  lazyNamed(() => import('@/features/notifications/NotificationsPage'), 'NotificationsPage'),
);
export const UsersPage = withLazyPage(
  lazyNamed(() => import('@/features/users/UsersPage'), 'UsersPage'),
);
export const UserDetailPage = withLazyPage(
  lazyNamed(() => import('@/features/users/UserDetailPage'), 'UserDetailPage'),
);
export const RolesPage = withLazyPage(
  lazyNamed(() => import('@/features/roles/RolesPage'), 'RolesPage'),
);
export const DepartmentsPage = withLazyPage(
  lazyNamed(() => import('@/features/departments/DepartmentsPage'), 'DepartmentsPage'),
);
export const DepartmentDetailPage = withLazyPage(
  lazyNamed(() => import('@/features/departments/DepartmentDetailPage'), 'DepartmentDetailPage'),
);
export const BudgetsPage = withLazyPage(
  lazyNamed(() => import('@/features/budgets/BudgetsPage'), 'BudgetsPage'),
);
export const ApprovalLevelsPage = withLazyPage(
  lazyNamed(() => import('@/features/approval-levels/ApprovalLevelsPage'), 'ApprovalLevelsPage'),
);
export const DelegationsPage = withLazyPage(
  lazyNamed(() => import('@/features/delegations/DelegationsPage'), 'DelegationsPage'),
);
export const PoliciesPage = withLazyPage(
  lazyNamed(() => import('@/features/policies/PoliciesPage'), 'PoliciesPage'),
);
export const AuditLogsPage = withLazyPage(
  lazyNamed(() => import('@/features/audit/AuditLogsPage'), 'AuditLogsPage'),
);
export const AccessReviewPage = withLazyPage(
  lazyNamed(() => import('@/features/access-review/AccessReviewPage'), 'AccessReviewPage'),
);
