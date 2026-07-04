import { SITE_DESCRIPTION, SITE_NAME } from './site-metadata';

export type RouteMetadata = {
  title: string;
  description: string;
  noIndex?: boolean;
};

const AUTH_DESCRIPTION = `Sign in to ${SITE_NAME} to manage expense claims and approvals.`;

const ROUTE_METADATA: Record<string, RouteMetadata> = {
  '/login': {
    title: 'Sign in',
    description: AUTH_DESCRIPTION,
    noIndex: true,
  },
  '/signup': {
    title: 'Create account',
    description: `Create your ${SITE_NAME} account to start submitting expense claims.`,
    noIndex: true,
  },
  '/forgot-password': {
    title: 'Forgot password',
    description: `Reset your ${SITE_NAME} account password.`,
    noIndex: true,
  },
  '/verify-otp': {
    title: 'Verify code',
    description: `Enter the verification code sent to your email.`,
    noIndex: true,
  },
  '/reset-password': {
    title: 'Reset password',
    description: `Choose a new password for your ${SITE_NAME} account.`,
    noIndex: true,
  },
  '/reset-password/new': {
    title: 'Set new password',
    description: `Choose a new password for your ${SITE_NAME} account.`,
    noIndex: true,
  },
  '/verify-email': {
    title: 'Verify email',
    description: `Confirm your email address to continue using ${SITE_NAME}.`,
    noIndex: true,
  },
  '/dashboard': {
    title: 'Dashboard',
    description: 'Overview of your spending, team activity, and department budget.',
  },
  '/expenses': {
    title: 'Expenses',
    description: 'View and manage your expense claims.',
  },
  '/expenses/new': {
    title: 'New expense',
    description: 'Create a new expense claim draft.',
  },
  '/profile': {
    title: 'Account settings',
    description: 'Manage your profile and account preferences.',
  },
  '/approvals': {
    title: 'Approval queue',
    description: 'Review and action submitted expense claims awaiting approval.',
  },
  '/finance': {
    title: 'Finance queue',
    description: 'Process approved expenses ready for reimbursement.',
  },
  '/admin/reports': {
    title: 'Reports',
    description: 'Organization spending analytics, budgets, and trends.',
  },
  '/notifications': {
    title: 'Notifications',
    description: 'Updates on expense approvals, budgets, and account activity.',
  },
  '/admin/users': {
    title: 'Team management',
    description: 'Manage users, roles, and access across the organization.',
  },
  '/admin/departments': {
    title: 'Departments',
    description: 'Manage departments, managers, and team structure.',
  },
  '/admin/budgets': {
    title: 'Budgets',
    description: 'Set and monitor annual department budget limits.',
  },
  '/admin/roles': {
    title: 'Roles & permissions',
    description: 'Configure roles and permission assignments.',
  },
  '/admin/approval-levels': {
    title: 'Approval levels',
    description: 'Configure expense approval workflow levels.',
  },
  '/admin/delegations': {
    title: 'Delegations',
    description: 'Manage temporary approval delegations.',
  },
  '/admin/policies': {
    title: 'Policies',
    description: 'Expense compliance rules and policy configuration.',
  },
  '/admin/audit-logs': {
    title: 'Audit logs',
    description: 'Review system activity and administrative changes.',
  },
  '/admin/access-review': {
    title: 'Access review',
    description: 'Review effective permissions and capabilities for active users.',
  },
};

function matchRouteMetadata(pathname: string): RouteMetadata | null {
  if (ROUTE_METADATA[pathname]) {
    return ROUTE_METADATA[pathname];
  }

  if (pathname.match(/^\/expenses\/[^/]+$/)) {
    return {
      title: 'Expense detail',
      description: 'View expense claim details, receipts, and approval history.',
    };
  }

  if (pathname.match(/^\/admin\/departments\/[^/]+$/)) {
    return {
      title: 'Department detail',
      description: 'Department profile, team members, and budget utilization.',
    };
  }

  if (pathname.match(/^\/admin\/users\/[^/]+$/)) {
    return {
      title: 'Employee detail',
      description: 'Employee profile, work assignment, and expense activity.',
    };
  }

  if (pathname === '/') {
    return {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    };
  }

  return null;
}

export function getRouteMetadata(pathname: string): RouteMetadata {
  return (
    matchRouteMetadata(pathname) ?? {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    }
  );
}
