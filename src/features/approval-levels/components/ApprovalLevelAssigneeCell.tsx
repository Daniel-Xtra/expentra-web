import { BriefcaseIcon, UsersThreeIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { formatApprovalLevelAssignee } from '@/features/approval-levels/utils/approval-level-format';
import type { ApprovalLevelResponse } from '@/types/api';

type ApprovalLevelAssigneeCellProps = {
  level: ApprovalLevelResponse;
};

export function ApprovalLevelAssigneeCell({ level }: ApprovalLevelAssigneeCellProps) {
  const assignee = formatApprovalLevelAssignee(level);
  const isDepartmentManager = level.approverType === 'department_manager';

  return (
    <div className="flex min-w-[180px] items-start gap-3">
      <div
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border',
          isDepartmentManager
            ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-400'
            : 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-400',
        )}
      >
        {isDepartmentManager ? (
          <UsersThreeIcon className="size-4" weight="duotone" />
        ) : (
          <BriefcaseIcon className="size-4" weight="duotone" />
        )}
      </div>
      <div className="min-w-0 space-y-0.5">
        <p className="font-medium text-foreground">{assignee.primary}</p>
        {assignee.secondary ? (
          <p className="text-xs text-muted-foreground">{assignee.secondary}</p>
        ) : null}
      </div>
    </div>
  );
}
