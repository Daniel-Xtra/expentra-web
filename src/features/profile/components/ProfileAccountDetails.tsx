import { ProfileInfoField } from '@/shared/components/ProfileInfoField';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, formatLabel } from '@/shared/utils/format';
import type { UserResponse } from '@/types/api';

type ProfileAccountDetailsProps = {
  user: UserResponse;
};

export function ProfileAccountDetails({ user }: ProfileAccountDetailsProps) {
  return (
    <Card className="border-border/60">
      <CardContent className="py-4">
        <h2 className="mb-1 text-sm font-semibold text-foreground">Account details</h2>

        <ProfileInfoField
          label="Employee ID"
          value={<ReferenceCell value={user.reference} variant="compact" />}
        />
        <ProfileInfoField
          label="Department"
          value={user.department?.name ? formatLabel(user.department.name) : '—'}
        />
        <ProfileInfoField
          label="Email verification"
          value={
            user.isEmailVerified
              ? user.emailVerifiedAt
                ? `Verified on ${formatDate(user.emailVerifiedAt)}`
                : 'Verified'
              : 'Not verified'
          }
        />
        <ProfileInfoField
          label="Account status"
          value={user.isActive ? 'Active' : 'Inactive'}
        />
        {user.createdAt ? (
          <ProfileInfoField label="Member since" value={formatDate(user.createdAt)} />
        ) : null}
      </CardContent>
    </Card>
  );
}
