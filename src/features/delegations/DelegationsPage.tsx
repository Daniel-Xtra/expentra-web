import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PlusIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DelegationTable } from '@/features/delegations/components/DelegationTable';
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
import { FormDialog } from '@/shared/components/FormDialog';
import { FormField } from '@/shared/components/FormField';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { RhfSelectField } from '@/shared/components/RhfSelectField';
import { useActionCapabilities } from '@/shared/hooks/use-action-capabilities';
import { normalizeReference } from '@/shared/utils/reference';
import { formatUserName } from '@/shared/utils/user';

export function DelegationsPage() {
  const caps = useActionCapabilities();
  const canManageDelegations = caps.delegation.manage;
  const [activeTab, setActiveTab] = useState<DelegationTab>('granted');
  const [showForm, setShowForm] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<{
    reference: string;
    label: string;
  } | null>(null);

  const delegations = useDelegations();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DelegationFormValues>({
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
      reset({ delegateReference: '', startsAt: '', endsAt: '' });
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
    reset({ delegateReference: '', startsAt: '', endsAt: '' });
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
            <Button onClick={openCreateForm}>
              <PlusIcon className="size-4" />
              New delegation
            </Button>
          ) : undefined
        }
      />

      <FormDialog
        title="New delegation"
        description="Choose a colleague and the period they can approve on your behalf."
        open={showForm}
        onOpenChange={setShowForm}
        submitLabel="Create delegation"
        loading={createMutation.isPending}
        onSubmit={handleSubmit((values) => createMutation.mutateAsync(values))}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RhfSelectField
            control={control}
            name="delegateReference"
            label="Delegate"
            placeholder="Select colleague"
            error={errors.delegateReference?.message}
            className="sm:col-span-2"
            options={delegations.users.map((user) => ({
              value: user.reference,
              label: `${formatUserName(user)} · ${user.email}`,
            }))}
          />
          <FormField label="Starts" htmlFor="delegation-starts" error={errors.startsAt?.message}>
            <Input
              id="delegation-starts"
              type="date"
              aria-invalid={errors.startsAt ? true : undefined}
              {...register('startsAt')}
            />
          </FormField>
          <FormField label="Ends" htmlFor="delegation-ends" error={errors.endsAt?.message}>
            <Input
              id="delegation-ends"
              type="date"
              aria-invalid={errors.endsAt ? true : undefined}
              {...register('endsAt')}
            />
          </FormField>
        </div>
      </FormDialog>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as DelegationTab)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="granted">
            My delegations
            {delegations.myDelegations.length > 0 && (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {delegations.myDelegations.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="received">
            Delegated to me
            {delegations.delegationsToMe.length > 0 && (
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {delegations.delegationsToMe.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="granted">
          <DataCard>
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
          <DataCard>
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
