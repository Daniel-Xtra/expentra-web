import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PlusIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DelegationTable } from '@/features/delegations/components/DelegationTable';
import { CreateDelegationDialog } from '@/features/delegations/components/DelegationFormDialogs';
import { useDelegationMutations } from '@/features/delegations/hooks/use-delegation-mutations';
import { useDelegations } from '@/features/delegations/hooks/use-delegations';
import {
  delegationSchema,
  type DelegationFormValues,
} from '@/features/delegations/schemas';
import type { DelegationTab } from '@/features/delegations/utils';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DataCard } from '@/shared/components/DataCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
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

  const delegations = useDelegations({ grantedPage, receivedPage });

  const form = useForm<DelegationFormValues>({
    resolver: zodResolver(delegationSchema),
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

  const usersByReference = useMemo(
    () =>
      new Map(
        delegations.users.map((user) => [normalizeReference(user.reference), user]),
      ),
    [delegations.users],
  );

  const openCreateForm = () => {
    form.reset({ delegateReference: '', startsAt: '', endsAt: '' });
    setShowForm(true);
  };

  if (delegations.mineQuery.isLoading && !delegations.mineQuery.data) {
    return <LoadingState message="Loading delegations…" />;
  }

  if (delegations.mineQuery.isError) {
    return (
      <ErrorState
        message={(delegations.mineQuery.error as Error).message}
        onRetry={() => void delegations.mineQuery.refetch()}
        retrying={delegations.mineQuery.isFetching}
      />
    );
  }

  return (
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
        users={delegations.users}
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
                action={
                  canManageDelegations ? (
                    <Button onClick={openCreateForm}>
                      <PlusIcon className="size-4" />
                      New delegation
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <DelegationTable
                delegations={delegations.myDelegations}
                personLabel="Delegate"
                getPersonReference={(delegation) => delegation.delegateReference}
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
                getPersonReference={(delegation) => delegation.delegatorReference}
                usersByReference={usersByReference}
              />
            )}
          </DataCard>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
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
  );
}
