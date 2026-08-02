import { useState } from 'react';
import { PencilSimpleIcon } from '@phosphor-icons/react';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppIcon } from '@/shared/reusable/AppIcon';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileAccountDetails } from '@/features/profile/components/ProfileAccountDetails';
import { ProfileQuickLinks } from '@/features/profile/components/ProfileQuickLinks';
import { EditNameDialog } from '@/features/profile/components/modals/edit-name';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { OrgGrantsPanel } from '@/shared/components/OrgGrantsPanel';
import { ErrorState } from '@/shared/components/ErrorState';

import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';
import { formatRoleName } from '@/shared/utils/format';
import { formatUserName } from '@/shared/utils/user';
import { cn } from '@/lib/utils';
import { DialogTrigger } from '@/components/ui/dialog';
import { Dialog } from '@/components/ui/dialog';
import ChangePassword from '../components/modals/change-password';

export function ProfilePage() {
  const { refreshProfile } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const profile = useProfile();

  const departmentPath =
    profile.managedDepartments.length > 0
      ? profile.managedDepartments.length === 1
        ? `/department/${profile.managedDepartments[0].reference}`
        : '/department'
      : undefined;

  if (profile.isLoading) {
    return <LoadingState layout="detail" message="Loading profile…" />;
  }

  if (!profile.user) {
    return (
      <ErrorState
        message="Profile not found"
        onRetry={() => void refreshProfile()}
      />
    );
  }

  const user = profile.user;
  const displayName = formatUserName(user);

  const openEditName = () => {
    profile.profileForm.reset({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
    });
    setShowEditName(true);
  };

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
                        : 'Employee'}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-xs font-medium',
                        user.isEmailVerified
                          ? 'text-emerald-700'
                          : 'text-muted-foreground',
                      )}
                    >
                      {user.isEmailVerified ? (
                        <>
                          <AppIcon icon="shield-check" className="size-3.5" />
                          Verified
                        </>
                      ) : (
                        'Email not verified'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                className="h-11 bg-primary-500 px-7 text-sm font-normal"
                onClick={openEditName}
              >
                <PencilSimpleIcon className="size-4" />
                Edit name
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
            <div className="space-y-4 lg:col-span-2">
              <ProfileAccountDetails user={user} />
            </div>

            <div className="space-y-4">
              <ProfileQuickLinks
                variant="stack"
                canReadNotifications={profile.canReadNotifications}
                departmentPath={departmentPath}
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
          <Card className="w-full max-w-xl border-border/60">
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

      <EditNameDialog
        open={showEditName}
        onOpenChange={(open) => {
          setShowEditName(open);
          if (!open) {
            profile.profileForm.reset({
              firstName: user.firstName ?? '',
              lastName: user.lastName ?? '',
            });
          }
        }}
        form={profile.profileForm}
        loading={profile.updateMutation.isPending}
        onSubmit={async (values) => {
          await profile.updateMutation.mutateAsync(values);
          setShowEditName(false);
        }}
      />
    </PageShell>
  );
}
