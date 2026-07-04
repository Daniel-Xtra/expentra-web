import { z } from 'zod';
import { positiveNumberField, requiredField } from '@/shared/lib/zod';
import type { ApprovalLevelResponse } from '@/types/api';
import type { ApprovalApproverType } from '@/features/approval-levels/api';

export const ALL_VALUE = 'all';

export const APPROVER_TYPE_OPTIONS: { value: ApprovalApproverType; label: string }[] = [
  { value: 'department_manager', label: 'Department manager' },
  { value: 'finance_manager', label: 'Finance manager' },
];

export const approvalLevelSchema = z
  .object({
    name: requiredField('Name'),
    approverType: z.enum(['department_manager', 'finance_manager']),
    roleReference: z.string().optional(),
    level: positiveNumberField('Level'),
    description: z.string().max(2000).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.approverType === 'finance_manager' && !values.roleReference?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Role is required for finance manager levels',
        path: ['roleReference'],
      });
    }
  });

export const editApprovalLevelSchema = approvalLevelSchema.extend({
  isActive: z.enum(['active', 'inactive']),
});

export type ApprovalLevelFormValues = z.infer<typeof approvalLevelSchema>;
export type EditApprovalLevelFormValues = z.infer<typeof editApprovalLevelSchema>;

export function toCreatePayload(values: ApprovalLevelFormValues) {
  return {
    name: values.name,
    approverType: values.approverType,
    roleReference:
      values.approverType === 'finance_manager' ? values.roleReference : undefined,
    level: values.level,
    description: values.description?.trim() || null,
  };
}

export function toUpdatePayload(values: EditApprovalLevelFormValues) {
  return {
    ...toCreatePayload(values),
    isActive: values.isActive === 'active',
  };
}

export function defaultFormValues(): ApprovalLevelFormValues {
  return {
    name: '',
    approverType: 'department_manager',
    roleReference: '',
    level: 1,
    description: '',
  };
}

export function toFormValues(level: ApprovalLevelResponse): EditApprovalLevelFormValues {
  return {
    name: level.name,
    approverType: level.approverType,
    roleReference: level.role?.reference ?? '',
    level: level.level,
    description: level.description ?? '',
    isActive: level.isActive ? 'active' : 'inactive',
  };
}

export function buildImpactDescription(
  action: 'deactivate' | 'delete',
  label: string,
  impact?: { pendingExpenseCount: number; historicalDecisionCount: number },
): string {
  const parts = [`${action === 'delete' ? 'Delete' : 'Deactivate'} ${label}?`];

  if (impact) {
    if (impact.pendingExpenseCount > 0) {
      parts.push(
        `${impact.pendingExpenseCount} expense${impact.pendingExpenseCount === 1 ? '' : 's'} may be waiting at this stage.`,
      );
    }
    if (impact.historicalDecisionCount > 0) {
      parts.push(
        `${impact.historicalDecisionCount} historical approval decision${impact.historicalDecisionCount === 1 ? '' : 's'} recorded.`,
      );
    }
  }

  if (action === 'delete') {
    parts.push('This action cannot be undone.');
  }

  return parts.join(' ');
}
