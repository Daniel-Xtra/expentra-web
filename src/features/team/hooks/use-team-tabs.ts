import { useLocation, useNavigate } from 'react-router-dom';
import { getTeamTabFromPath, type TeamTab } from '@/features/team/constants';

type UseTeamTabsOptions = {
  canManageUsers: boolean;
  canManageRoles: boolean;
};

export function useTeamTabs({ canManageUsers, canManageRoles }: UseTeamTabsOptions) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnameTab = getTeamTabFromPath(location.pathname);

  const activeTab: TeamTab =
    pathnameTab === 'roles' && canManageRoles
      ? 'roles'
      : pathnameTab === 'employees' && canManageUsers
        ? 'employees'
        : canManageUsers
          ? 'employees'
          : 'roles';

  const handleTabChange = (value: string) => {
    navigate(value === 'roles' ? '/admin/roles' : '/admin/users', { replace: true });
  };

  const isTabLoading = (
    employeesLoading: boolean,
    rolesLoading: boolean,
  ) =>
    (pathnameTab === 'employees' && canManageUsers && employeesLoading) ||
    (pathnameTab === 'roles' && canManageRoles && rolesLoading);

  return {
    pathnameTab,
    activeTab,
    handleTabChange,
    isTabLoading,
  };
}
