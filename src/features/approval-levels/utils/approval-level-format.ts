import { formatRoleName } from '@/shared/utils/format';
import type { ApprovalLevelResponse } from '@/types/api';

export function formatApprovalLevelAssignee(level: ApprovalLevelResponse): {
  primary: string;
  secondary: string;
} {
  if (level.approverType === 'department_manager') {
    return {
      primary: 'Department manager',
      secondary: 'Assigned from expense department',
    };
  }

  return {
    primary: level.role?.name ? formatRoleName(level.role.name) : 'Finance manager',
    secondary: 'Finance manager role',
  };
}
