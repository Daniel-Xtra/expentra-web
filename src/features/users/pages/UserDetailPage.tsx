import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EditEmployeeDialog } from '@/features/users/components/modals/edit-employee';
import { UserProfileView } from '@/features/users/components/UserProfileView';
import {
  adminUpdateUser,
  fetchUserDetailSummary,
} from '@/features/users/api';
import { NONE_VALUE } from '@/features/users/constants';
import {
  editEmployeeSchema,
  type EditEmployeeFormValues,
} from '@/features/users/schemas';
import { useUserCatalogData } from '@/features/users/hooks/use-users-list';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageShell } from '@/shared/components/PageShell';
import { canAccess } from '@/shared/lib/capabilities';
import { handleMutationError } from '@/shared/api/form-errors';
import { toastSuccess } from '@/shared/lib/toast';
import { formatUserName } from '@/shared/utils/user';
import { usePageMetadata } from '@/shared/hooks/use-page-metadata';
import { queryKeys } from '@/shared/api/query-keys';

export function UserDetailPage() {
  const { reference = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authorization } = useAuth();
  const canManage = canAccess(authorization?.capabilities, 'user:update');
  const [editingOpen, setEditingOpen] = useState(false);
  const userCatalog = useUserCatalogData(canManage && editingOpen);

  const summaryQuery = useQuery({
    queryKey: queryKeys.users.summary(reference),
    queryFn: () => fetchUserDetailSummary(reference),
    enabled: Boolean(reference),
  });

  usePageMetadata(
    summaryQuery.data
      ? {
          title: formatUserName(summaryQuery.data.user),
          description: `Employee profile and expense activity for ${summaryQuery.data.user.email}.`,
        }
      : null,
  );

  const editEmployeeForm = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: { roleReference: NONE_VALUE, departmentReference: NONE_VALUE },
  });

  const updateUserMutation = useMutation({
    mutationFn: (input: {
      roleReference?: string | null;
      departmentReference?: string | null;
      isActive?: boolean;
      displayName?: string;
    }) => adminUpdateUser(reference, input),
    onSuccess: async (_data, variables) => {
      if (variables.isActive === false) {
        toastSuccess('Employee deactivated');
      } else if (variables.isActive === true) {
        toastSuccess('Employee activated');
      } else {
        toastSuccess(
          variables.displayName
            ? `${variables.displayName} updated successfully`
            : 'Employee updated',
        );
        setEditingOpen(false);
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.users.summary(reference),
      });
    },
    onError: (err) =>
      handleMutationError(err, {
        setError: editEmployeeForm.setError,
        fallback: 'Failed to update employee',
      }),
  });

  if (summaryQuery.isLoading) {
    return <LoadingState layout="detail" message="Loading employee…" />;
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <PageShell wide className="space-y-4">
        <ErrorState
          message={(summaryQuery.error as Error)?.message ?? 'Employee not found'}
          onRetry={() => void summaryQuery.refetch()}
          retrying={summaryQuery.isFetching}
        />
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')}>
          Back to users
        </Button>
      </PageShell>
    );
  }

  const summary = summaryQuery.data;
  const user = summary.user;

  const openEdit = () => {
    editEmployeeForm.reset({
      roleReference: user.role?.reference ?? NONE_VALUE,
      departmentReference: user.department?.reference ?? NONE_VALUE,
    });
    setEditingOpen(true);
  };

  return (
    <>
      <UserProfileView
        summary={summary}
        backTo="/admin/users"
        canManage={canManage}
        onEdit={canManage ? openEdit : undefined}
        onToggleActive={
          canManage
            ? () =>
                void updateUserMutation.mutateAsync({
                  isActive: !user.isActive,
                  displayName: formatUserName(user),
                })
            : undefined
        }
        togglePending={updateUserMutation.isPending}
      />

      {canManage ? (
        <EditEmployeeDialog
          user={editingOpen ? user : null}
          onOpenChange={(open) => {
            if (!open) {
              setEditingOpen(false);
            }
          }}
          form={editEmployeeForm}
          loading={updateUserMutation.isPending}
          catalogLoading={userCatalog.isLoading}
          onSubmit={editEmployeeForm.handleSubmit((values) =>
            updateUserMutation.mutateAsync({
              displayName: formatUserName(user),
              roleReference:
                values.roleReference === NONE_VALUE ? null : values.roleReference,
              departmentReference:
                values.departmentReference === NONE_VALUE
                  ? null
                  : values.departmentReference,
            }),
          )}
          allRoles={userCatalog.allRoles}
          departments={userCatalog.departments}
        />
      ) : null}
    </>
  );
}
