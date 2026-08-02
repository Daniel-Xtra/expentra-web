import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AppIcon } from '@/shared/reusable/AppIcon';
import type { NotificationPreferenceResponse } from '@/types/api';
import type { UpdateNotificationPreferencesInput } from '../api';

type NotificationPreferencesPanelProps = {
  preferences: NotificationPreferenceResponse;
  isUpdating: boolean;
  canUpdate?: boolean;
  onToggle: (input: UpdateNotificationPreferencesInput) => void;
};

type PreferenceRowProps = {
  title: string;
  description: string;
  icon?: ReactNode;
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
        {icon ? (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
        ) : null}
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
        <div className="divide-y divide-border/60">
          <PreferenceRow
            title="In-app notifications"
            description="Show alerts in your notification inbox and the header bell."
            icon={<AppIcon icon="notification" className="size-4" />}
            enabled={preferences.inAppEnabled}
            disabled={isUpdating || !canUpdate}
            onToggle={() => onToggle({ inAppEnabled: !preferences.inAppEnabled })}
          />
          <PreferenceRow
            title="Email notifications"
            description="Receive important updates in your registered email address."
            icon={<AppIcon icon="message-drop" className="size-10" />}
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
