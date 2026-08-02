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
  lazyNamed(() => import('@/features/dashboard/pages/DashboardPage'), 'DashboardPage'),
);
export const ExpenseListPage = withLazyPage(
  lazyNamed(() => import('@/features/expenses/pages/ExpenseListPage'), 'ExpenseListPage'),
);
export const ExpenseDetailPage = withLazyPage(
  lazyNamed(() => import('@/features/expenses/pages/ExpenseDetailPage'), 'ExpenseDetailPage'),
);
export const CreateExpensePage = withLazyPage(
  lazyNamed(() => import('@/features/expenses/pages/CreateExpensePage'), 'CreateExpensePage'),
);
export const ProfilePage = withLazyPage(
  lazyNamed(() => import('@/features/profile/pages/ProfilePage'), 'ProfilePage'),
);
export const ApprovalQueuePage = withLazyPage(
  lazyNamed(() => import('@/features/approvals/pages/ApprovalQueuePage'), 'ApprovalQueuePage'),
);
export const DepartmentPage = withLazyPage(
  lazyNamed(() => import('@/features/department/pages/DepartmentPage'), 'DepartmentPage'),
);
export const PayoutsPage = withLazyPage(
  lazyNamed(() => import('@/features/payouts/pages/PayoutsPage'), 'PayoutsPage'),
);
export const ReportsPage = withLazyPage(
  lazyNamed(() => import('@/features/reports/pages/ReportsPage'), 'ReportsPage'),
);
export const NotificationsPage = withLazyPage(
  lazyNamed(() => import('@/features/notifications/pages/NotificationsPage'), 'NotificationsPage'),
);
export const ExportsPage = withLazyPage(
  lazyNamed(() => import('@/features/exports/pages/ExportsPage'), 'ExportsPage'),
);
export const UsersPage = withLazyPage(
  lazyNamed(() => import('@/features/users/pages/UsersPage'), 'UsersPage'),
);
export const UserDetailPage = withLazyPage(
  lazyNamed(() => import('@/features/users/pages/UserDetailPage'), 'UserDetailPage'),
);
export const RolesPage = withLazyPage(
  lazyNamed(() => import('@/features/roles/pages/RolesPage'), 'RolesPage'),
);
export const DepartmentsPage = withLazyPage(
  lazyNamed(() => import('@/features/departments/pages/DepartmentsPage'), 'DepartmentsPage'),
);
export const DepartmentDetailPage = withLazyPage(
  lazyNamed(() => import('@/features/departments/pages/DepartmentDetailPage'), 'DepartmentDetailPage'),
);
export const BudgetsPage = withLazyPage(
  lazyNamed(() => import('@/features/budgets/pages/BudgetsPage'), 'BudgetsPage'),
);
export const ApprovalLevelsPage = withLazyPage(
  lazyNamed(() => import('@/features/approval-levels/pages/ApprovalLevelsPage'), 'ApprovalLevelsPage'),
);
export const DelegationsPage = withLazyPage(
  lazyNamed(() => import('@/features/delegations/pages/DelegationsPage'), 'DelegationsPage'),
);
export const PoliciesPage = withLazyPage(
  lazyNamed(() => import('@/features/policies/pages/PoliciesPage'), 'PoliciesPage'),
);
export const AuditLogsPage = withLazyPage(
  lazyNamed(() => import('@/features/audit-logs/pages/AuditLogsPage'), 'AuditLogsPage'),
);
export const AccessReviewPage = withLazyPage(
  lazyNamed(() => import('@/features/access-review/pages/AccessReviewPage'), 'AccessReviewPage'),
);
