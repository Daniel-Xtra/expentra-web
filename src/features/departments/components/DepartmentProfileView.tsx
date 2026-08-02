import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { DepartmentBudgetSection } from '@/features/departments/components/DepartmentBudgetSection';
import { DepartmentEmployeesSection } from '@/features/departments/components/DepartmentEmployeesSection';
import { DepartmentHeroPanel } from '@/features/departments/components/DepartmentHeroPanel';
import { DepartmentManagerHistorySection } from '@/features/departments/components/DepartmentManagerHistorySection';
import { DepartmentOperationalAlerts } from '@/features/departments/components/DepartmentOperationalAlerts';
import {
  fetchDepartmentBudgetSummary,
  fetchDepartmentDetailSummary,
  fetchManagedDepartmentDetailSummary,
  fetchManagedDepartmentBudgetSummary,
  getDepartment,
  getManagedDepartment,
  listDepartmentUsers,
  listManagedDepartmentUsers,
} from '@/features/departments/api';
import { queryKeys } from '@/shared/api/query-keys';
import { DepartmentTeamOverviewSection } from '@/features/departments/components/DepartmentTeamOverviewSection';
import { DepartmentExpenseSection } from '@/features/departments/components/DepartmentExpenseSection';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { usePageMetadata } from '@/shared/hooks/use-page-metadata';

type DepartmentProfileViewProps = {
  reference: string;
  readOnly?: boolean;
  managed?: boolean;
  backTo?: string;
  backLabel?: string;
  onEdit?: () => void;
  onToggleActive?: () => void;
  onDelete?: () => void;
  togglePending?: boolean;
};

export function DepartmentProfileView({
  reference,
  readOnly = false,
  managed = false,
  backTo,
  backLabel,
  onEdit,
  onToggleActive,
  onDelete,
  togglePending,
}: DepartmentProfileViewProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));

  const departmentQuery = useQuery({
    queryKey: managed
      ? queryKeys.departments.managedDetail(reference)
      : queryKeys.departments.detail(reference),
    queryFn: () => (managed ? getManagedDepartment(reference) : getDepartment(reference)),
    enabled: Boolean(reference),
  });

  usePageMetadata(
    departmentQuery.data
      ? {
          title: readOnly
            ? `Department overview — ${departmentQuery.data.name}`
            : departmentQuery.data.name,
          description: `Department profile, team, and budget for ${departmentQuery.data.name}.`,
        }
      : null,
  );

  const budgetSummaryQuery = useQuery({
    queryKey: queryKeys.departments.budgetSummary(reference, year, managed),
    queryFn: () =>
      managed
        ? fetchManagedDepartmentBudgetSummary(reference, Number(year))
        : fetchDepartmentBudgetSummary(reference, Number(year)),
    enabled: Boolean(reference),
  });

  const employeeCountQuery = useQuery({
    queryKey: queryKeys.departments.userCount(reference, managed),
    queryFn: () =>
      (managed ? listManagedDepartmentUsers : listDepartmentUsers)(reference, {
        page: 1,
        limit: 1,
      }),
    enabled: Boolean(reference),
  });

  const detailSummaryQuery = useQuery({
    queryKey: queryKeys.departments.detailSummary(reference, managed),
    queryFn: () =>
      managed
        ? fetchManagedDepartmentDetailSummary(reference)
        : fetchDepartmentDetailSummary(reference),
    enabled: Boolean(reference),
  });

  if (departmentQuery.isLoading) {
    return <LoadingState layout="page" message="Loading department…" />;
  }

  if (departmentQuery.isError || !departmentQuery.data) {
    return (
      <ErrorState
        message={(departmentQuery.error as Error)?.message ?? 'Department not found'}
        onRetry={() => void departmentQuery.refetch()}
        retrying={departmentQuery.isFetching}
      />
    );
  }

  const department = departmentQuery.data;

  return (
    <PageShell wide className="gap-6">
      {backTo ? <PageHeader backTo={backTo} backLabel={backLabel} /> : null}

      <DepartmentHeroPanel
        department={department}
        employeeCount={employeeCountQuery.data?.meta?.total}
        readOnly={readOnly}
        onEdit={onEdit}
        onToggleActive={onToggleActive}
        onDelete={onDelete}
        togglePending={togglePending}
      />

      <DepartmentOperationalAlerts department={department} readOnly={readOnly} />

      <DepartmentBudgetSection
        department={department}
        year={year}
        onYearChange={setYear}
        summary={budgetSummaryQuery.data}
        isLoading={budgetSummaryQuery.isLoading}
        readOnly={readOnly}
        managed={managed}
      />

      <DepartmentTeamOverviewSection
        reference={department.reference}
        year={year}
        managed={managed}
      />

      {detailSummaryQuery.data ? (
        <DepartmentExpenseSection summary={detailSummaryQuery.data} />
      ) : null}

      <DepartmentManagerHistorySection
        departmentReference={department.reference}
        managed={managed}
      />

      <DepartmentEmployeesSection
        departmentReference={department.reference}
        managerReference={department.manager?.reference}
        readOnly={readOnly}
        managed={managed}
      />
    </PageShell>
  );
}
