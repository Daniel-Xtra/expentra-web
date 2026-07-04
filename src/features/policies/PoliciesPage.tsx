import {
  ShieldCheckIcon,
  ShieldWarningIcon,
  SlidersHorizontalIcon,
  StackIcon,
} from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PolicyAdminGuide } from '@/features/policies/components/PolicyAdminGuide';
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
import { PolicyCatalogPanel } from '@/features/policies/PolicyCatalogPanel';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { FilterCard } from '@/shared/components/FilterCard';
import { FormField } from '@/shared/components/FormField';
import { SearchField } from '@/shared/components/SearchField';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { StatCard } from '@/shared/components/StatCard';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { formatTotalLabel } from '@/shared/lib/pagination';
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
  const setupComplete =
    catalogReady && list.catalog.templates.length > 0 && stats.active > 0;

  const handleUseTemplate = (template: PolicyCatalogTemplate) => {
    list.setActiveTab('policies');
    mutations.openCreateForm(template);
  };

  if (list.policiesQuery.isLoading && list.catalogQuery.isLoading) {
    return <LoadingState message="Loading policies…" />;
  }

  return (
    <PageShell wide>
      <PageHeader
        title="Expense policies"
        description="Set rules employees see when submitting expenses. Configure fields and templates in Rule catalog, then create active policies here."
        meta={formatTotalLabel(list.policies.length, 'policy', 'policies')}
        actions={
          list.activeTab === 'policies' && policy.create ? (
            <Button
              onClick={() => mutations.openCreateForm()}
              disabled={!catalogReady}
              title={
                catalogReady
                  ? undefined
                  : 'Add condition fields in Rule catalog before creating policies'
              }
            >
              Add policy
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-2">
        <Button
          variant={list.activeTab === 'policies' ? 'default' : 'outline'}
          size="sm"
          onClick={() => list.setActiveTab('policies')}
        >
          Policies
          <span className="ml-1.5 rounded-full bg-background/20 px-1.5 py-0.5 text-xs tabular-nums">
            {list.policies.length}
          </span>
        </Button>
        <Button
          variant={list.activeTab === 'catalog' ? 'default' : 'outline'}
          size="sm"
          onClick={() => list.setActiveTab('catalog')}
        >
          Rule catalog
          <span className="ml-1.5 rounded-full bg-background/20 px-1.5 py-0.5 text-xs tabular-nums">
            {list.catalog.fields.length}
          </span>
        </Button>
      </div>

      {list.activeTab === 'catalog' ? (
        <PolicyCatalogPanel
          catalog={list.catalog}
          policyCount={list.policies.length}
          activePolicyCount={stats.active}
          onUseTemplate={handleUseTemplate}
        />
      ) : (
        <>
          {!setupComplete && (
            <PolicyAdminGuide
              fieldCount={list.catalog.fields.length}
              fieldDefinitionCount={list.catalog.fieldDefinitions.length}
              templateCount={list.catalog.templates.length}
              policyCount={list.policies.length}
              activePolicyCount={stats.active}
              onGoToCatalog={() => list.setActiveTab('catalog')}
              className="mb-2"
            />
          )}

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
              icon={<SlidersHorizontalIcon className="size-4" weight="duotone" />}
            />
          </div>

          <FilterCard>
            <SearchField
             
              htmlFor="policy-search"
              id="policy-search"
              placeholder="Search by reference, name, or rule"
              value={list.search}
              onValueChange={list.setSearch}
            />
            <FormField className="min-w-[160px]">
              <Select value={list.severityFilter} onValueChange={list.setSeverityFilter}>
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
            </FormField>
            <FormField className="min-w-[160px]">
              <Select value={list.statusFilter} onValueChange={list.setStatusFilter}>
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
            </FormField>
          </FilterCard>

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
            title="Policy rules"
            description={
              filteredPolicies.length === list.policies.length
                ? `${list.policies.length} policies`
                : `${filteredPolicies.length} of ${list.policies.length} policies`
            }
          >
            {list.policies.length === 0 ? (
              <EmptyState
                title="No policies yet"
                description={
                  catalogReady
                    ? 'Create policies from a Rule catalog template when possible. Active policies apply when employees submit expenses.'
                    : 'Set up condition fields in Rule catalog first, then return here to create policies.'
                }
                action={
                  catalogReady && policy.create ? (
                    <Button onClick={() => mutations.openCreateForm()}>Add policy</Button>
                  ) : !catalogReady ? (
                    <Button variant="outline" onClick={() => list.setActiveTab('catalog')}>
                      Open Rule catalog
                    </Button>
                  ) : undefined
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
                  void mutations.toggleActiveMutation.mutateAsync({ reference, isActive })
                }
                onDelete={(policy) =>
                  mutations.setDeleteTarget({ reference: policy.reference, label: policy.name })
                }
              />
            )}
          </DataCard>

          <ConfirmDialog
            open={Boolean(mutations.deleteTarget)}
            onOpenChange={(open) => !open && mutations.setDeleteTarget(null)}
            title="Delete policy"
            description={`Delete ${mutations.deleteTarget?.label}? This action cannot be undone.`}
            confirmLabel="Delete"
            destructive
            loading={mutations.deleteMutation.isPending}
            onConfirm={async () => {
              await mutations.deleteMutation.mutateAsync(mutations.deleteTarget!.reference);
              mutations.setDeleteTarget(null);
            }}
          />
        </>
      )}
    </PageShell>
  );
}
