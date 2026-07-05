import { useState } from 'react';
import { PencilSimpleIcon } from '@phosphor-icons/react';
import shieldCheckIconUrl from '@/assets/icons/shield-check.png';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AssetIcon } from '@/shared/components/AssetIcon';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileAccountDetails } from '@/features/profile/components/ProfileAccountDetails';
import { ProfileQuickLinks } from '@/features/profile/components/ProfileQuickLinks';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { OrgGrantsPanel } from '@/shared/components/OrgGrantsPanel';
import { ErrorState } from '@/shared/components/ErrorState';

import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { toastError, toastSuccess } from '@/shared/lib/toast';
import { formatRoleName } from '@/shared/utils/format';
import { formatUserName } from '@/shared/utils/user';
import { cn } from '@/lib/utils';
import { DialogTrigger } from '@/components/ui/dialog';
import { Dialog } from '@/components/ui/dialog';
import ChangePassword from '../components/modals/change-password';

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toastSuccess('Copied to clipboard');
  } catch {
    toastError(null, 'Failed to copy');
  }
}

export function ProfilePage() {
  // const [showEditName, setShowEditName] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const profile = useProfile();
  // const newPassword =
  //   useWatch({ control: profile.passwordForm.control, name: 'newPassword' }) ?? '';

  const departmentOverviewPath =
    profile.managedDepartments.length > 0
      ? profile.managedDepartments.length === 1
        ? `/department-overview/${profile.managedDepartments[0].reference}`
        : '/department-overview'
      : undefined;

  if (profile.profileQuery.isLoading) {
    return <LoadingState layout="detail" message="Loading profile…" />;
  }

  if (profile.profileQuery.isError || !profile.profileQuery.data) {
    return (
      <ErrorState
        message={(profile.profileQuery.error as Error)?.message ?? 'Profile not found'}
        onRetry={() => void profile.profileQuery.refetch()}
        retrying={profile.profileQuery.isFetching}
      />
    );
  }

  const user = profile.profileQuery.data;
  const displayName = formatUserName(user);

  const openEditName = () => {
    profile.profileForm.reset({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
    });
    // setShowEditName(true);
  };

  // const handleChangePasswordOpenChange = (open: boolean) => {
  //   setShowChangePassword(open);
  //   if (!open) {
  //     profile.passwordForm.reset();
  //   }
  // };

  return (
    <PageShell wide>
      <PageHeader
        title="Account settings"
        description="Manage your profile and security."
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="border-border/60">
            <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <UserAvatar user={user} size="lg" />

                <div className="min-w-0 space-y-1">
                  <p className="text-lg font-semibold text-foreground">
                    {displayName}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {user.role?.name
                        ? formatRoleName(user.role.name)
                        : "Employee"}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium",
                        user.isEmailVerified
                          ? "text-emerald-700"
                          : "text-muted-foreground",
                      )}
                    >
                      {user.isEmailVerified ? (
                        <>
                          <AssetIcon
                            src={shieldCheckIconUrl}
                            className="size-3.5"
                          />
                          Verified
                        </>
                      ) : (
                        "Email not verified"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <Button className="h-11 font-normal text-sm px-7 bg-primary-500" onClick={openEditName}>
                <PencilSimpleIcon className="size-4" />
                Edit name
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
            <div className="space-y-4 lg:col-span-2">
              <ProfileAccountDetails
                user={user}
                onCopyReference={(reference) => void copyToClipboard(reference)}
              />
            </div>

            <div className="space-y-4">
              <ProfileQuickLinks
                variant="stack"
                canReadNotifications={profile.canReadNotifications}
                departmentOverviewPath={departmentOverviewPath}
              />

              {(profile.orgGrants.length > 0 ||
                profile.managedDepartments.length > 0) && (
                <Card className="border-border/60">
                  <CardContent className="py-4">
                    <OrgGrantsPanel
                      orgGrants={profile.orgGrants}
                      managedDepartments={profile.managedDepartments}
                      compact
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="max-w-xl border-border/60">
            <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="mb-1 text-sm font-semibold text-foreground">
                  Change password
                </h2>
                <p className="text-sm text-muted-foreground">
                  Update your password. You will be signed out of other
                  sessions.
                </p>
              </div>
              <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 shrink-0 px-7 text-sm font-normal text-primary-500"
                    aria-label="Change password"
                  >
                    Change Password
                  </Button>
                </DialogTrigger>
                <ChangePassword closeModal={() => setShowChangePassword(false)} />
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* <FormDialog
        title="Change your password"
        description="Please enter your old password and new password"
        open={showChangePassword}
        onOpenChange={handleChangePasswordOpenChange}
        submitLabel="Save"
        loading={
          profile.passwordForm.formState.isSubmitting ||
          profile.changePasswordMutation.isPending
        }
        className="sm:max-w-md"
        contentClassName="space-y-5 py-6"
        onSubmit={profile.passwordForm.handleSubmit(async (values) => {
          await profile.changePasswordMutation.mutateAsync(values);
          setShowChangePassword(false);
        })}
      >
        <PasswordInputField
          register={profile.passwordForm.register}
          name="currentPassword"
          label="Old password"
          autoComplete="current-password"
          error={profile.passwordForm.formState.errors.currentPassword?.message}
        />
        <PasswordInputField
          register={profile.passwordForm.register}
          name="newPassword"
          label="New password"
          autoComplete="new-password"
          error={profile.passwordForm.formState.errors.newPassword?.message}
          criteriaValue={newPassword}
          showCriteria
        />
      </FormDialog>

      <FormDialog
        title="Edit name"
        open={showEditName}
        onOpenChange={setShowEditName}
        submitLabel="Save changes"
        loading={profile.updateMutation.isPending}
        onSubmit={profile.profileForm.handleSubmit((values) =>
          profile.updateMutation.mutateAsync(values).then(() => setShowEditName(false)),
        )}
      >
        <div className="space-y-4">
          <FormField
            label="First name"
            htmlFor="first-name"
            error={profile.profileForm.formState.errors.firstName?.message}
          >
            <Input
              id="first-name"
              aria-invalid={profile.profileForm.formState.errors.firstName ? true : undefined}
              {...profile.profileForm.register('firstName')}
            />
          </FormField>
          <FormField
            label="Last name"
            htmlFor="last-name"
            error={profile.profileForm.formState.errors.lastName?.message}
          >
            <Input
              id="last-name"
              aria-invalid={profile.profileForm.formState.errors.lastName ? true : undefined}
              {...profile.profileForm.register('lastName')}
            />
          </FormField>
        </div>
      </FormDialog> */}
    </PageShell>
  );
}
