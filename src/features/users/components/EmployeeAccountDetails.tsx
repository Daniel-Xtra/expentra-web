import { Card, CardContent } from '@/components/ui/card';
import { ProfileInfoField } from '@/shared/components/ProfileInfoField';
import { ReferenceCell } from '@/shared/components/ReferenceCell';
import { formatDate } from '@/shared/utils/format';
import type { UserResponse } from '@/types/api';

type EmployeeAccountDetailsProps = {
  user: UserResponse;
};

export function EmployeeAccountDetails({ user }: EmployeeAccountDetailsProps) {
  return (
    <Card className="border-border/60">
      <CardContent className="py-4">
        <h2 className="mb-1 text-sm font-semibold text-foreground">Account details</h2>

        <ProfileInfoField
          label="Employee ID"
          value={<ReferenceCell value={user.reference} variant="compact" />}
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
          label="Member since"
          value={user.createdAt ? formatDate(user.createdAt) : '—'}
        />
        <ProfileInfoField
          label="Last updated"
          value={user.updatedAt ? formatDate(user.updatedAt) : '—'}
        />
      </CardContent>
    </Card>
  );
}
