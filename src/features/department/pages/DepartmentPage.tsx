import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listManagedDepartments } from '@/features/departments/api';
import { queryKeys } from '@/shared/api/query-keys';
import { DepartmentProfileView } from '@/features/departments/components/DepartmentProfileView';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageShell } from '@/shared/components/PageShell';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function DepartmentPage() {
  const { reference: routeReference } = useParams();
  const navigate = useNavigate();
  const { authorization, isLoading: authLoading } = useAuth();

  const managedQuery = useQuery({
    queryKey: queryKeys.departments.managedList(),
    queryFn: listManagedDepartments,
    enabled: !authLoading,
  });

  const managedDepartments = managedQuery.data ?? authorization?.managedDepartments ?? [];
  const isLoading = authLoading || managedQuery.isLoading;

  const activeReference =
    routeReference &&
    managedDepartments.some((department) => department.reference === routeReference)
      ? routeReference
      : managedDepartments[0]?.reference;

  useEffect(() => {
    if (isLoading || managedDepartments.length !== 1 || routeReference) {
      return;
    }

    navigate(`/department/${managedDepartments[0]!.reference}`, { replace: true });
  }, [isLoading, managedDepartments, navigate, routeReference]);

  if (isLoading) {
    return <LoadingState layout="page" message="Loading…" />;
  }

  if (managedQuery.isError) {
    return (
      <PageShell>
        <ErrorState
          message={(managedQuery.error as Error).message}
          onRetry={() => void managedQuery.refetch()}
          retrying={managedQuery.isFetching}
        />
      </PageShell>
    );
  }

  if (managedDepartments.length === 0) {
    return (
      <PageShell>
        <ErrorState message="You are not assigned as a manager for any department." />
      </PageShell>
    );
  }

  if (!activeReference) {
    return <LoadingState layout="page" message="Loading department…" />;
  }

  return (
    <div className="min-w-0 space-y-4">
      {managedDepartments.length > 1 ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Department</h1>
            <p className="text-sm text-muted-foreground">
              View profile, team, and budget for departments you manage.
            </p>
          </div>
          <Select
            value={activeReference}
            onValueChange={(value) => navigate(`/department/${value}`)}
          >
            <SelectTrigger className="w-full sm:w-[240px] bg-background">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {managedDepartments.map((department) => (
                <SelectItem key={department.reference} value={department.reference}>
                  {department.name} ({department.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <DepartmentProfileView
        key={activeReference}
        reference={activeReference}
        readOnly
        managed
      />
    </div>
  );
}
