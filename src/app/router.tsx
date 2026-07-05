import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LegacyDepartmentOverviewRedirect } from '@/app/legacy-department-overview-redirect';
import {
  ApprovalLevelsPage,
  ApprovalQueuePage,
  AccessReviewPage,
  AuditLogsPage,
  BudgetsPage,
  CreateExpensePage,
  DashboardPage,
  DelegationsPage,
  DepartmentDetailPage,
  DepartmentOverviewPage,
  DepartmentsPage,
  ExpenseDetailPage,
  ExpenseListPage,
  FinanceQueuePage,
  NotificationsPage,
  PoliciesPage,
  ProfilePage,
  ReportsPage,
  RolesPage,
  UserDetailPage,
  UsersPage,
} from '@/app/lazy-pages';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { ResetPasswordRedirect } from '@/features/auth/components/ResetPasswordRedirect';
import { VerifyOtpPage } from '@/features/auth/pages/VerifyOtpPage';
import { SignUpPage } from '@/features/auth/pages/SignUpPage';
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage';
import { AppLayout } from '@/shared/components/AppLayout';
import { CapabilityRoute } from '@/shared/components/CapabilityRoute';
import { DocumentMetadataLayout } from '@/shared/components/DocumentMetadata';
import { HomeRedirect } from '@/shared/components/HomeRedirect';
import { EmailVerifiedRoute } from '@/shared/components/EmailVerifiedRoute';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { protectedRouteConfigs } from '@/shared/navigation';

function routeGuard(id: string) {
  const config = protectedRouteConfigs.find((route) => route.id === id);
  if (!config) {
    throw new Error(`Missing protected route config: ${id}`);
  }

  return (
    <CapabilityRoute
      capabilities={config.capabilities}
      requiresManagedDepartment={config.requiresManagedDepartment}
      fallback={config.fallback}
    />
  );
}

export const router = createBrowserRouter([
  {
    element: <DocumentMetadataLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/signup',
        element: <SignUpPage />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: '/verify-otp',
        element: <VerifyOtpPage />,
      },
      {
        path: '/reset-password',
        element: <ResetPasswordRedirect />,
      },
      {
        path: '/reset-password/new',
        element: <ResetPasswordPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'verify-email', element: <VerifyEmailPage /> },
          {
            element: <EmailVerifiedRoute />,
            children: [
              {
                element: <AppLayout />,
                children: [
                  { index: true, element: <HomeRedirect /> },

                  {
                    element: routeGuard('dashboard'),
                    children: [{ path: 'dashboard', element: <DashboardPage /> }],
                  },
                  {
                    element: routeGuard('expenses'),
                    children: [
                      { path: 'expenses', element: <ExpenseListPage /> },
                      { path: 'expenses/:reference', element: <ExpenseDetailPage /> },
                    ],
                  },
                  {
                    element: routeGuard('expense-create'),
                    children: [{ path: 'expenses/new', element: <CreateExpensePage /> }],
                  },
                  { path: 'profile', element: <ProfilePage /> },

                  {
                    element: routeGuard('approvals'),
                    children: [{ path: 'approvals', element: <ApprovalQueuePage /> }],
                  },
                  {
                    element: routeGuard('department-overview'),
                    children: [
                      { path: 'department-overview', element: <DepartmentOverviewPage /> },
                      {
                        path: 'department-overview/:reference',
                        element: <DepartmentOverviewPage />,
                      },
                      {
                        path: 'my-department',
                        element: <LegacyDepartmentOverviewRedirect />,
                      },
                      {
                        path: 'my-department/:reference',
                        element: <LegacyDepartmentOverviewRedirect />,
                      },
                    ],
                  },
                  {
                    element: routeGuard('finance'),
                    children: [{ path: 'finance', element: <FinanceQueuePage /> }],
                  },
                  {
                    element: routeGuard('admin-reports'),
                    children: [
                      { path: 'admin/reports', element: <ReportsPage /> },
                      { path: 'reports', element: <Navigate to="/admin/reports" replace /> },
                    ],
                  },
                  {
                    element: routeGuard('notifications'),
                    children: [{ path: 'notifications', element: <NotificationsPage /> }],
                  },

                  {
                    element: routeGuard('admin-users'),
                    children: [
                      { path: 'admin/users', element: <UsersPage /> },
                      { path: 'admin/users/:reference', element: <UserDetailPage /> },
                    ],
                  },
                  {
                    element: routeGuard('admin-roles'),
                    children: [{ path: 'admin/roles', element: <RolesPage /> }],
                  },
                  {
                    element: routeGuard('admin-departments'),
                    children: [
                      { path: 'admin/departments', element: <DepartmentsPage /> },
                      { path: 'admin/departments/:reference', element: <DepartmentDetailPage /> },
                      {
                        path: 'admin/departments/:reference/budget',
                        element: <Navigate to=".." replace />,
                      },
                    ],
                  },
                  {
                    element: routeGuard('admin-budgets'),
                    children: [{ path: 'admin/budgets', element: <BudgetsPage /> }],
                  },
                  {
                    element: routeGuard('admin-approval-levels'),
                    children: [
                      { path: 'admin/approval-levels', element: <ApprovalLevelsPage /> },
                    ],
                  },
                  {
                    element: routeGuard('admin-delegations'),
                    children: [{ path: 'admin/delegations', element: <DelegationsPage /> }],
                  },
                  {
                    element: routeGuard('admin-policies'),
                    children: [{ path: 'admin/policies', element: <PoliciesPage /> }],
                  },
                  {
                    element: routeGuard('audit-logs'),
                    children: [{ path: 'admin/audit-logs', element: <AuditLogsPage /> }],
                  },
                  {
                    element: routeGuard('access-review'),
                    children: [{ path: 'admin/access-review', element: <AccessReviewPage /> }],
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
