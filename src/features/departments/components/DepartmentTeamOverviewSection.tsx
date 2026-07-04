import { useQuery } from '@tanstack/react-query';
import { DashboardTeamOverview } from '@/features/dashboard/components/DashboardTeamOverview';
import {
  fetchDepartmentTeamDashboard,
  fetchManagedDepartmentTeamDashboard,
} from '@/features/departments/api';
import { queryKeys } from '@/shared/api/query-keys';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';

type DepartmentTeamOverviewSectionProps = {
  reference: string;
  year: string;
  managed?: boolean;
};

export function DepartmentTeamOverviewSection({
  reference,
  year,
  managed = false,
}: DepartmentTeamOverviewSectionProps) {
  const parsedYear = Number(year);
  const highlightPeriod =
    parsedYear === new Date().getFullYear() ? new Date().getMonth() + 1 : undefined;

  const teamQuery = useQuery({
    queryKey: queryKeys.departments.teamDashboard(reference, year, managed),
    queryFn: () =>
      managed
        ? fetchManagedDepartmentTeamDashboard(reference, { year: parsedYear })
        : fetchDepartmentTeamDashboard(reference, { year: parsedYear }),
    enabled: Boolean(reference) && Number.isFinite(parsedYear),
  });

  if (teamQuery.isLoading) {
    return <LoadingState message="Loading spend trend…" />;
  }

  if (teamQuery.isError || !teamQuery.data) {
    return (
      <ErrorState
        message={(teamQuery.error as Error)?.message ?? 'Team overview is unavailable.'}
        onRetry={() => void teamQuery.refetch()}
        retrying={teamQuery.isFetching}
      />
    );
  }

  return (
    <DashboardTeamOverview team={teamQuery.data} highlightPeriod={highlightPeriod} />
  );
}
