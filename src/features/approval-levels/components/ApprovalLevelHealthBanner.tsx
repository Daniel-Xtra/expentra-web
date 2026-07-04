import { useState } from 'react';
import { CaretDownIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ApprovalLevelHealthWarning } from '@/types/api';

type ApprovalLevelHealthBannerProps = {
  warnings: ApprovalLevelHealthWarning[];
  className?: string;
};

export function ApprovalLevelHealthBanner({
  warnings,
  className,
}: ApprovalLevelHealthBannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (warnings.length === 0) {
    return null;
  }

  const hasCritical = warnings.some((warning) => warning.destructive);
  const preview = warnings[0];

  return (
    <Alert
      variant={hasCritical ? 'destructive' : 'default'}
      className={cn('border-border/60', className)}
    >
      <WarningCircleIcon />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <AlertTitle>
            {warnings.length === 1
              ? preview.title
              : `${warnings.length} workflow issues need attention`}
          </AlertTitle>
          <AlertDescription>
            {expanded || warnings.length === 1 ? (
              <ul className="mt-1 space-y-1">
                {warnings.map((warning) => (
                  <li key={warning.code}>
                    <span className="font-medium text-foreground">{warning.title}:</span>{' '}
                    {warning.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{preview.description}</p>
            )}
          </AlertDescription>
        </div>
        {warnings.length > 1 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 self-start"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Show less' : `View all (${warnings.length})`}
            <CaretDownIcon
              className={cn('size-4 transition-transform', expanded && 'rotate-180')}
            />
          </Button>
        ) : null}
      </div>
    </Alert>
  );
}
