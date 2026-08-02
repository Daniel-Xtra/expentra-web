import {
  ShieldCheckIcon,
  ShieldWarningIcon,
  SlidersHorizontalIcon,
  StackIcon,
} from '@phosphor-icons/react';
import { useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreatePolicyDialog,
  EditPolicyDialog,
} from '@/features/policies/components/PolicyFormDialogs';
import { PoliciesTable } from '@/features/policies/components/PoliciesTable';
import {
  ALL_VALUE,
  severityFilterOptions,
  statusFilterOptions,
} from '@/features/policies/constants';
import { usePoliciesList } from '@/features/policies/hooks/use-policies-list';
import { usePolicyMutations } from '@/features/policies/hooks/use-policy-mutations';
import { formatPolicyConfigSummary } from '@/features/policies/policy-config';
import { PolicyCatalogPanel } from '@/features/policies/components/PolicyCatalogPanel';
import { AppConfirmModal } from '@/shared/reusable/AppConfirmModal';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { FilterCard } from '@/shared/components/FilterCard';
import { SearchInput } from '@/shared/components/SearchInput';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { QueryStatus } from '@/shared/components/QueryStatus';
import { StatCard } from '@/shared/components/StatCard';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import type { PolicyCatalogTemplate } from '@/types/api';

export function PoliciesPage() {
  const { policy } = useActionCapabilities();
  const list = usePoliciesList();
  const mutations = usePolicyMutations(list.catalog);

  const stats = useMemo(() => {
    const active = list.policies.filter((policy) => policy.isActive).length;
    const blocking = list.policies.filter((policy) => policy.severity === 'BLOCK').length;
    const warning = list.policies.filter((policy) => policy.severity === 'WARN').length;
    return { total: list.policies.length, active, blocking, warning };
  }, [list.policies]);

  const filteredPolicies = useMemo(() => {
    const query = list.search.trim().toLowerCase();
    return list.policies.filter((policy) => {
      if (list.severityFilter !== ALL_VALUE && policy.severity !== list.severityFilter) {
        return false;
      }
      if (list.statusFilter === 'active' && !policy.isActive) return false;
      if (list.statusFilter === 'inactive' && policy.isActive) return false;
      if (!query) return true;
      const summary = formatPolicyConfigSummary(list.catalog, policy).toLowerCase();
      return (
        policy.name.toLowerCase().includes(query) ||
        policy.reference.toLowerCase().includes(query) ||
        summary.includes(query)
      );
    });
  }, [list.policies, list.search, list.severityFilter, list.statusFilter, list.catalog]);

  const catalogReady = list.catalog.fields.length > 0;

  const didLandOnCatalog = useRef(false);
  useEffect(() => {
    if (didLandOnCatalog.current || list.catalogQuery.isLoading) {
      return;
    }
    didLandOnCatalog.current = true;
    if (list.catalog.fields.length === 0) {
      list.setActiveTab('catalog');
    }
  }, [list, list.catalog.fields.length, list.catalogQuery.isLoading, list.setActiveTab]);

  const handleUseTemplate = (template: PolicyCatalogTemplate) => {
    list.setActiveTab('policies');
    mutations.openCreateForm(template);
  };

  return (
    <QueryStatus query={list.policiesQuery} loadingMessage="Loading policies…">
      <PageShell wide>
        <PageHeader
          title="Expense policies"
          description="Rules that run when employees submit expenses."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {list.activeTab === 'policies' && policy.create && catalogReady ? (
                <Button
                  className="h-11 font-normal text-sm px-7 bg-primary-500"
                  onClick={() => mutations.openCreateForm()}
                >
                  Add policy
                </Button>
              ) : null}
            </div>
          }
        />

        <Tabs
          value={list.activeTab}
          onValueChange={(value) =>
            list.setActiveTab(value as 'policies' | 'catalog')
          }
          className="mt-0 gap-6"
        >
          <TabsList>
            <TabsTrigger value="policies">
              Policies
              {list.policies.length > 0 ? (
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  {list.policies.length}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="catalog">
              Rule catalog
              {list.catalog.fields.length > 0 ? (
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  {list.catalog.fields.length}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog">
            <PolicyCatalogPanel
              catalog={list.catalog}
              policyCount={list.policies.length}
              activePolicyCount={stats.active}
              onUseTemplate={handleUseTemplate}
            />
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
       

            {list.policies.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Total policies"
                  value={stats.total}
                  hint={`${stats.active} active`}
                  icon={<StackIcon className="size-4" weight="duotone" />}
                  tone="primary"
                />
                <StatCard
                  label="Active"
                  value={stats.active}
                  hint={
                    stats.total > 0
                      ? `${Math.round((stats.active / stats.total) * 100)}% of total`
                      : 'None yet'
                  }
                  icon={<ShieldCheckIcon className="size-4" weight="duotone" />}
                  tone="success"
                />
                <StatCard
                  label="Blocking rules"
                  value={stats.blocking}
                  hint="Prevent submission"
                  icon={<ShieldWarningIcon className="size-4" weight="duotone" />}
                  tone="warning"
                />
                <StatCard
                  label="Warnings"
                  value={stats.warning}
                  hint="Allow with justification"
                  icon={
                    <SlidersHorizontalIcon className="size-4" weight="duotone" />
                  }
                />
              </div>
            ) : null}

            {list.policies.length > 0 ? (
              <FilterCard>
                <SearchInput
                  field
                  id="policy-search"
                  placeholder="Search by reference, name, or rule"
                  value={list.search}
                  onValueChange={list.setSearch}
                />
                <div className="w-full sm:w-[160px]">
                  <Select
                    value={list.severityFilter}
                    onValueChange={list.setSeverityFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severityFilterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-[160px]">
                  <Select
                    value={list.statusFilter}
                    onValueChange={list.setStatusFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusFilterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FilterCard>
            ) : null}

            <CreatePolicyDialog
              open={mutations.showForm}
              onOpenChange={mutations.setShowForm}
              form={mutations.createForm}
              catalog={list.catalog}
              loading={mutations.createMutation.isPending}
              onSubmit={mutations.createForm.handleSubmit((values) =>
                mutations.createMutation.mutateAsync(values),
              )}
            />

            <EditPolicyDialog
              open={Boolean(mutations.editingPolicy)}
              onOpenChange={(open) => !open && mutations.setEditingPolicy(null)}
              form={mutations.editForm}
              catalog={list.catalog}
              loading={mutations.updateMutation.isPending}
              onSubmit={mutations.editForm.handleSubmit((values) => {
                if (!mutations.editingPolicy) return;
                return mutations.updateMutation.mutateAsync({
                  reference: mutations.editingPolicy.reference,
                  values,
                });
              })}
            />

            <DataCard
              title="Policies"
              description={
                list.policies.length === 0
                  ? undefined
                  : filteredPolicies.length === list.policies.length
                    ? `${list.policies.length} policies · Summaries show match behavior at submit`
                    : `${filteredPolicies.length} of ${list.policies.length} policies`
              }
            >
              {list.policies.length === 0 ? (
                <EmptyState
                  title={
                    catalogReady
                      ? 'No policies yet'
                      : 'Policies need a rule catalog first'
                  }
                  description={
                    catalogReady
                      ? 'Create a policy to check expenses at submit. You can start from a template if you have one.'
                      : 'Add condition fields in Rule catalog, then create policies here.'
                  }
                />
              ) : filteredPolicies.length === 0 ? (
                <EmptyState
                  title="No matching policies"
                  description="Try adjusting your search or filters."
                />
              ) : (
                <PoliciesTable
                  policies={filteredPolicies}
                  catalog={list.catalog}
                  togglePending={mutations.toggleActiveMutation.isPending}
                  onEdit={mutations.openEditForm}
                  onToggleActive={(reference, isActive) =>
                    void mutations.toggleActiveMutation.mutateAsync({
                      reference,
                      isActive,
                    })
                  }
                  onDelete={(policy) =>
                    mutations.setDeleteTarget({
                      reference: policy.reference,
                      label: policy.name,
                    })
                  }
                />
              )}
            </DataCard>

            <AppConfirmModal
              open={Boolean(mutations.deleteTarget)}
              onOpenChange={(open) => !open && mutations.setDeleteTarget(null)}
              title="Delete policy"
              description={`Delete ${mutations.deleteTarget?.label}? This action cannot be undone.`}
              confirmLabel="Delete"
              destructive
              loading={mutations.deleteMutation.isPending}
              onConfirm={async () => {
                await mutations.deleteMutation.mutateAsync(
                  mutations.deleteTarget!.reference,
                );
                mutations.setDeleteTarget(null);
              }}
            />
          </TabsContent>
        </Tabs>
      </PageShell>
    </QueryStatus>
  );
}
