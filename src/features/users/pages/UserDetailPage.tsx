import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { UserProfileView } from '@/features/users/components/UserProfileView';
import {
  adminUpdateUser,
  fetchUserDetailSummary,
} from '@/features/users/api';
import { NONE_VALUE } from '@/features/users/constants';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageShell } from '@/shared/components/PageShell';
import { canAccess } from '@/shared/lib/capabilities';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import { formatUserName } from '@/shared/utils/user';
import { usePageMetadata } from '@/shared/hooks/use-page-metadata';
import { queryKeys } from '@/shared/api/query-keys';

const editEmployeeSchema = z.object({
  roleReference: z.string(),
  departmentReference: z.string(),
});

type EditEmployeeFormValues = z.infer<typeof editEmployeeSchema>;

export function UserDetailPage() {
  const { reference = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authorization } = useAuth();
  const canManage = canAccess(authorization?.capabilities, 'user:update');

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
    }) => adminUpdateUser(reference, input),
    onSuccess: async () => {
      toastSuccess('Employee updated');
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (err) => toastError(err, 'Failed to update employee'),
  });

  if (summaryQuery.isLoading) {
    return <LoadingState layout="detail" message="Loading employee…" />;
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <PageShell className="max-w-5xl space-y-4">
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
                })
            : undefined
        }
        togglePending={updateUserMutation.isPending}
      />

 
    </>
  );
}
