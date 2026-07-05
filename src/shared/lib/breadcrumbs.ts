type Breadcrumb = {
  label: string;
  href?: string;
};

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  expenses: 'Expenses',
  approvals: 'Approvals',
  finance: 'Finance',
  reports: 'Reports',
  notifications: 'Notifications',
  profile: 'Account Settings',
  'department-overview': 'Department overview',
  'verify-email': 'Verify Email',
  admin: 'Administration',
  users: 'Users',
  departments: 'Departments',
  budgets: 'Budgets',
  roles: 'Roles',
  'approval-levels': 'Approval Levels',
  delegations: 'Delegations',
  policies: 'Policies',
  'audit-logs': 'Audit Logs',
  'access-review': 'Access Review',
};

function buildBreadcrumbs(pathname: string): Breadcrumb[] {
  if (pathname === '/') {
    return [{ label: 'Home' }];
  }

  if (pathname.startsWith('/expenses/new')) {
    return [
      { label: 'Expenses', href: '/expenses' },
      { label: 'New Claim' },
    ];
  }

  if (pathname.match(/^\/expenses\/[^/]+$/)) {
    return [
      { label: 'Expenses', href: '/expenses' },
      { label: 'Detail' },
    ];
  }

  if (pathname.match(/^\/admin\/departments\/[^/]+(\/budget)?$/)) {
    return [
      { label: 'Departments', href: '/admin/departments' },
      { label: 'Detail' },
    ];
  }

  if (pathname.match(/^\/department-overview\/[^/]+$/)) {
    return [
      { label: 'Department overview', href: '/department-overview' },
      { label: 'Detail' },
    ];
  }

  if (pathname === '/department-overview') {
    return [{ label: 'Department overview' }];
  }

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: Breadcrumb[] = [];
  let path = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    path += `/${segment}`;
    const isLast = i === segments.length - 1;
    const label = routeLabels[segment] ?? segment;

    crumbs.push({
      label,
      href: isLast ? undefined : path,
    });
  }

  return crumbs;
}

export function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const crumbs = buildBreadcrumbs(pathname);

  if (crumbs.length === 1 && crumbs[0].label === 'Home') {
    return crumbs;
  }

  return [{ label: 'Home', href: '/' }, ...crumbs];
}
