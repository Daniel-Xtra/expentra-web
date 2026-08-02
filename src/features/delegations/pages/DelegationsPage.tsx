import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PlusIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DelegationTable } from '@/features/delegations/components/DelegationTable';
import { CreateDelegationDialog } from '@/features/delegations/components/DelegationFormDialogs';
import { useDelegationMutations } from '@/features/delegations/hooks/use-delegation-mutations';
import {
  useDelegationUserCatalog,
  useDelegations,
} from '@/features/delegations/hooks/use-delegations';
import {
  createDelegationSchema,
  getMinDelegationDate,
  type DelegationFormValues,
} from '@/features/delegations/schemas';
import type { DelegationTab } from '@/features/delegations/utils';
import { AppConfirmModal } from '@/shared/reusable/AppConfirmModal';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { QueryStatus } from '@/shared/components/QueryStatus';
import { TablePagination } from '@/shared/components/TablePagination';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { shouldShowPagination } from '@/shared/lib/pagination';
import { normalizeReference } from '@/shared/utils/reference';

export function DelegationsPage() {
  const caps = useActionCapabilities();
  const canManageDelegations = caps.delegation.manage;
  const [activeTab, setActiveTab] = useState<DelegationTab>('granted');
  const [grantedPage, setGrantedPage] = useState(1);
  const [receivedPage, setReceivedPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<{
    reference: string;
    label: string;
  } | null>(null);

  const delegations = useDelegations({ grantedPage, receivedPage, loadUsers: true });
  const catalog = useDelegationUserCatalog(showForm);

  const minDelegationDate = getMinDelegationDate();

  const form = useForm<DelegationFormValues>({
    resolver: zodResolver(createDelegationSchema(minDelegationDate)),
    defaultValues: {
      delegateReference: '',
      startsAt: '',
      endsAt: '',
    },
  });

  const { createMutation, revokeMutation } = useDelegationMutations({
    onCreateSuccess: () => {
      setShowForm(false);
      form.reset({ delegateReference: '', startsAt: '', endsAt: '' });
    },
    onRevokeSuccess: () => setRevokeTarget(null),
  });

  const usersByReference = useMemo(() => {
    const merged = new Map<string, (typeof delegations.users)[number]>();
    for (const user of [...delegations.users, ...catalog.users]) {
      merged.set(normalizeReference(user.reference), user);
    }
    return merged;
  }, [delegations.users, catalog.users]);

  const openCreateForm = () => {
    form.reset({ delegateReference: '', startsAt: '', endsAt: '' });
    setShowForm(true);
  };

  return (
    <QueryStatus query={delegations.mineQuery} loadingMessage="Loading delegations…">
    <PageShell wide>
      <PageHeader
        title="Approval delegations"
        description="Delegate your approval authority while you are away."
        actions={
          canManageDelegations ? (
            <Button onClick={openCreateForm} className="h-11 font-normal text-sm px-7 bg-primary-500">
              <PlusIcon className="size-4" />
              New delegation
            </Button>
          ) : undefined
        }
      />

      <CreateDelegationDialog
        open={showForm}
        onOpenChange={setShowForm}
        form={form}
        users={catalog.users}
        catalogLoading={catalog.isLoading}
        loading={createMutation.isPending}
        onSubmit={form.handleSubmit((values) => createMutation.mutateAsync(values))}
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as DelegationTab)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="granted">
            My delegations
            {delegations.grantedMeta.total > 0 && (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {delegations.grantedMeta.total}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="received">
            Delegated to me
            {delegations.receivedMeta.total > 0 && (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {delegations.receivedMeta.total}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="granted">
          <DataCard
            footer={
              shouldShowPagination(delegations.grantedMeta) ? (
                <TablePagination
                  meta={delegations.grantedMeta}
                  onPageChange={setGrantedPage}
                />
              ) : undefined
            }
          >
            {delegations.myDelegations.length === 0 ? (
              <EmptyState
                title="No delegations yet"

              />
            ) : (
              <DelegationTable
                delegations={delegations.myDelegations}
                personLabel="Delegate"
                getPerson={(delegation) => ({
                  reference: delegation.delegateReference,
                  person: delegation.delegate,
                })}
                usersByReference={usersByReference}
                showActions={canManageDelegations}
                revokeDisabled={revokeMutation.isPending}
                onRevoke={(delegation, label) =>
                  setRevokeTarget({ reference: delegation.reference, label })
                }
              />
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="received">
          <DataCard
            footer={
              shouldShowPagination(delegations.receivedMeta) ? (
                <TablePagination
                  meta={delegations.receivedMeta}
                  onPageChange={setReceivedPage}
                />
              ) : undefined
            }
          >
            {delegations.toMeQuery.isLoading && !delegations.toMeQuery.data ? (
              <LoadingState message="Loading…" />
            ) : delegations.delegationsToMe.length === 0 ? (
              <EmptyState title="No delegations received" />
            ) : (
              <DelegationTable
                delegations={delegations.delegationsToMe}
                personLabel="From"
                getPerson={(delegation) => ({
                  reference: delegation.delegatorReference,
                  person: delegation.delegator,
                })}
                usersByReference={usersByReference}
              />
            )}
          </DataCard>
        </TabsContent>
      </Tabs>

      <AppConfirmModal
        open={Boolean(revokeTarget)}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Revoke delegation"
        description={`Revoke delegation to ${revokeTarget?.label}?`}
        confirmLabel="Revoke"
        destructive
        loading={revokeMutation.isPending}
        onConfirm={async () => {
          if (!revokeTarget) return;
          await revokeMutation.mutateAsync(revokeTarget.reference);
        }}
      />
    </PageShell>
    </QueryStatus>
  );
}
