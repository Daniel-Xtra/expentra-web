import { DownloadSimpleIcon, PlusIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApprovalLevelHealthBanner } from '@/features/approval-levels/components/ApprovalLevelHealthBanner';
import {
  CreateApprovalLevelDialog,
  EditApprovalLevelDialog,
} from '@/features/approval-levels/components/ApprovalLevelFormDialogs';
import { ApprovalLevelOverviewCard } from '@/features/approval-levels/components/ApprovalLevelOverviewCard';
import { ApprovalLevelsTable } from '@/features/approval-levels/components/ApprovalLevelsTable';
import { useApprovalLevelMutations } from '@/features/approval-levels/hooks/use-approval-level-mutations';
import {
  useApprovalLevelCatalogData,
  useApprovalLevelImpact,
  useApprovalLevelsList,
} from '@/features/approval-levels/hooks/use-approval-levels-list';
import { ALL_VALUE, buildImpactDescription } from '@/features/approval-levels/schemas';
import { AppConfirmModal } from '@/shared/reusable/AppConfirmModal';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { FilterCard } from '@/shared/components/FilterCard';
import { SearchInput } from '@/shared/components/SearchInput';
import { getApiErrorMessage, isServerUnavailableError } from '@/shared/api/client';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { QueryStatus } from '@/shared/components/QueryStatus';
import { TablePagination } from '@/shared/components/TablePagination';
import {
  DEFAULT_PAGE_SIZE,
  resolvePaginationMeta,
  shouldShowPagination,
} from '@/shared/lib/pagination';
import { formatLabel } from '@/shared/utils/format';

export function ApprovalLevelsPage() {
  const { approvalLevel } = useActionCapabilities();
  const list = useApprovalLevelsList();
  const mutations = useApprovalLevelMutations({ listParams: list.listParams });
  const catalog = useApprovalLevelCatalogData(
    mutations.showForm || Boolean(mutations.editingLevel),
  );
  const deleteImpactQuery = useApprovalLevelImpact(mutations.deleteTarget?.reference);
  const deactivateImpactQuery = useApprovalLevelImpact(mutations.deactivateTarget?.reference);

  const levels = list.levelsQuery.data?.items ?? [];
  const roles = catalog.roles;
  const activeCount = levels.filter((level) => level.isActive).length;
  const meta = resolvePaginationMeta(
    list.levelsQuery.data?.meta,
    list.levelsQuery.data?.items?.length ?? 0,
    list.page,
    DEFAULT_PAGE_SIZE,
  );

  const resetPage = () => list.setPage(1);

  return (
    <QueryStatus
      query={list.levelsQuery}
      loadingMessage="Loading approval levels…"
      renderError={(error, { refetch, isFetching }) => {
        if (isServerUnavailableError(error)) {
          return (
            <PageShell wide className="gap-6">
              <PageHeader
                title="Approval levels"
                description="Define the steps expenses follow before approval"
              />
              <DataCard title="Approval chain">
                <EmptyState
                  title="No approval levels to show"
                  description="We could not reach the server. Try again when the connection is available."
                  action={
                    <Button variant="outline" onClick={refetch}>
                      Retry
                    </Button>
                  }
                />
              </DataCard>
            </PageShell>
          );
        }

        return (
          <PageShell wide className="gap-6">
            <ErrorState
              message={getApiErrorMessage(error)}
              onRetry={refetch}
              retrying={isFetching}
            />
          </PageShell>
        );
      }}
    >
    <PageShell wide className="gap-6">
      <PageHeader
        title="Approval levels"
        description="Define the steps expenses follow before approval."
        actions={
          <div className="flex flex-wrap gap-2">
            {approvalLevel.export ? (
              <Button
                variant="outline"
                className="h-11 font-normal text-sm px-7 hover:bg-white text-[#414651]"
                onClick={() => mutations.exportMutation.mutate()}
                disabled={mutations.exportMutation.isPending || meta.total === 0}
              >
                <DownloadSimpleIcon className="size-4" />
                Export
              </Button>
            ) : null}
            {approvalLevel.create ? (
              <Button className="h-11 font-normal text-sm px-7 bg-primary-500" onClick={mutations.openCreateForm}>
                <PlusIcon className="size-4" />
                Add level
              </Button>
            ) : null}
          </div>
        }
      />

      <ApprovalLevelOverviewCard
        health={list.workflowHealthQuery.data}
        isLoading={list.workflowHealthQuery.isLoading && !list.workflowHealthQuery.data}
      />

      <FilterCard>
        <SearchInput
          field
          placeholder="Search reference, name, role, or description"
          value={list.search}
          onValueChange={(value) => {
            list.setSearch(value);
            resetPage();
          }}
        />
        <div className="w-full sm:w-[140px]">
          <Select
            value={list.statusFilter}
            onValueChange={(value) => {
              list.setStatusFilter(value);
              resetPage();
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterCard>

      <CreateApprovalLevelDialog
        open={mutations.showForm}
        onOpenChange={mutations.setShowForm}
        form={mutations.createForm}
        roles={roles}
        catalogLoading={catalog.isLoading}
        loading={mutations.createMutation.isPending}
        onSubmit={mutations.createForm.handleSubmit((values) =>
          mutations.createMutation.mutateAsync(values),
        )}
      />

      <EditApprovalLevelDialog
        level={mutations.editingLevel}
        open={Boolean(mutations.editingLevel)}
        onOpenChange={(open) => !open && mutations.setEditingLevel(null)}
        form={mutations.editForm}
        roles={roles}
        catalogLoading={catalog.isLoading}
        loading={mutations.updateMutation.isPending}
        onSubmit={mutations.editForm.handleSubmit((values) => {
          if (!mutations.editingLevel) return;
          return mutations.updateMutation.mutateAsync({
            reference: mutations.editingLevel.reference,
            values,
          });
        })}
      />

      <DataCard
        title="Approval chain"
        description={
          levels.length > 0
            ? `${activeCount} active step${activeCount === 1 ? '' : 's'} · expenses move top to bottom`
            : undefined
        }
        footer={
          shouldShowPagination(meta) ? (
            <TablePagination meta={meta} onPageChange={list.setPage} />
          ) : undefined
        }
      >
        {(list.workflowHealthQuery.data?.warnings.length ?? 0) > 0 ? (
          <div className="border-b border-border/50 px-5 py-4">
            <ApprovalLevelHealthBanner warnings={list.workflowHealthQuery.data?.warnings ?? []} />
          </div>
        ) : null}

        {levels.length === 0 ? (
          <EmptyState
            title="No approval levels yet"
            description="Add levels to configure your approval workflow."
            action={
              approvalLevel.create ? (
                <Button onClick={mutations.openCreateForm}>Add level</Button>
              ) : undefined
            }
          />
        ) : (
          <ApprovalLevelsTable
            levels={levels}
            togglePending={mutations.toggleActiveMutation.isPending}
            onEdit={mutations.openEditForm}
            onDeactivate={(level) =>
              mutations.setDeactivateTarget({
                reference: level.reference,
                label: formatLabel(level.name),
              })
            }
            onActivate={(reference) =>
              void mutations.toggleActiveMutation.mutateAsync({ reference, isActive: true })
            }
            onDelete={(level) =>
              mutations.setDeleteTarget({
                reference: level.reference,
                label: formatLabel(level.name),
              })
            }
          />
        )}
      </DataCard>

      <AppConfirmModal
        open={Boolean(mutations.deactivateTarget)}
        onOpenChange={(open) => !open && mutations.setDeactivateTarget(null)}
        title="Deactivate approval level"
        description={buildImpactDescription(
          'deactivate',
          mutations.deactivateTarget?.label ?? 'this level',
          deactivateImpactQuery.data,
        )}
        confirmLabel="Deactivate"
        destructive
        loading={mutations.toggleActiveMutation.isPending}
        onConfirm={async () => {
          await mutations.toggleActiveMutation.mutateAsync({
            reference: mutations.deactivateTarget!.reference,
            isActive: false,
          });
        }}
      />

      <AppConfirmModal
        open={Boolean(mutations.deleteTarget)}
        onOpenChange={(open) => !open && mutations.setDeleteTarget(null)}
        title="Delete approval level"
        description={buildImpactDescription(
          'delete',
          mutations.deleteTarget?.label ?? 'this level',
          deleteImpactQuery.data,
        )}
        confirmLabel="Delete"
        destructive
        loading={mutations.deleteMutation.isPending}
        onConfirm={async () => {
          await mutations.deleteMutation.mutateAsync(mutations.deleteTarget!.reference);
          mutations.setDeleteTarget(null);
        }}
      />
    </PageShell>
    </QueryStatus>
  );
}
