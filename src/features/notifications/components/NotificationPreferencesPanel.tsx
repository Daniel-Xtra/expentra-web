import type { ReactNode } from 'react';
import messageDropIconUrl from '@/assets/icons/message-drop.png';
import notificationIconUrl from '@/assets/icons/notification.png';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AssetIcon } from '@/shared/components/AssetIcon';
import type { NotificationPreferenceResponse } from '@/types/api';

type NotificationPreferencesPanelProps = {
  preferences: NotificationPreferenceResponse;
  isUpdating: boolean;
  canUpdate?: boolean;
  onToggle: (input: { emailEnabled?: boolean; inAppEnabled?: boolean }) => void;
};

type PreferenceRowProps = {
  title: string;
  description: string;
  icon: ReactNode;
  enabled: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

function PreferenceRow({
  title,
  description,
  icon,
  enabled,
  disabled,
  onToggle,
}: PreferenceRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          enabled ? 'bg-primary' : 'bg-muted',
        )}
      >
        <span
          className={cn(
            'pointer-events-none block size-5 rounded-full bg-background shadow-sm ring-0 transition-transform',
            enabled ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
}

export function NotificationPreferencesPanel({
  preferences,
  isUpdating,
  canUpdate = true,
  onToggle,
}: NotificationPreferencesPanelProps) {
  return (
    <Card className="border-border/60">
      <CardContent className="py-4">
        <div className="mb-2 space-y-1">
          <h2 className="text-sm font-semibold text-foreground">Delivery channels</h2>
          <p className="text-sm text-muted-foreground">
            Choose how you want to receive updates about expenses, approvals, and budgets.
          </p>
        </div>

        <div className="divide-y divide-border/60">
          <PreferenceRow
            title="In-app notifications"
            description="Show alerts in your notification inbox and the header bell."
            icon={<AssetIcon src={notificationIconUrl} className="size-4" />}
            enabled={preferences.inAppEnabled}
            disabled={isUpdating || !canUpdate}
            onToggle={() => onToggle({ inAppEnabled: !preferences.inAppEnabled })}
          />
          <PreferenceRow
            title="Email notifications"
            description="Receive important updates in your registered email address."
            icon={<AssetIcon src={messageDropIconUrl} className="size-12" />}
            enabled={preferences.emailEnabled}
            disabled={isUpdating || !canUpdate}
            onToggle={() => onToggle({ emailEnabled: !preferences.emailEnabled })}
          />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Last updated {new Date(preferences.updatedAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
