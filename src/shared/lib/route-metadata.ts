import { SITE_DESCRIPTION, SITE_NAME } from './site-metadata';

type RouteMetadata = {
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
    description:
      'Your claims and spending. Team approvals are on Approvals; team budget on Department.',
  },
  '/expenses': {
    title: 'Expenses',
    description: 'Track drafts, submissions, and reimbursements.',
  },
  '/expenses/new': {
    title: 'New expense',
    description: 'Add claim details, attach a receipt, then submit for approval.',
  },
  '/profile': {
    title: 'Account settings',
    description: 'Manage your profile and account preferences.',
  },
  '/approvals': {
    title: 'Approvals',
    description: 'Oldest first. Clear aging claims so reimbursements are not delayed.',
  },
  '/department': {
    title: 'Department',
    description: 'View profile, team, and budget for departments you manage.',
  },
  '/payouts': {
    title: 'Payouts',
    description: 'Approved claims awaiting reimbursement. Export for your bank run, then mark paid.',
  },
  '/admin/reports': {
    title: 'Reports',
    description: 'Settled spend, budgets, and exceptions for finance review.',
  },
  '/notifications': {
    title: 'Notifications',
    description: 'Approvals, payouts, budgets, and account updates.',
  },
  '/exports': {
    title: 'Exports',
    description: 'Exports download directly to your device.',
  },

  '/admin/users': {
    title: 'Users',
    description: 'Manage employees, assignments, and account access.',
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
    title: 'Roles',
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
