import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { EmptyState } from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageShell } from '@/shared/components/PageShell';

export function ExportsPage() {
  return (
    <PageShell>
      <PageHeader title="Exports" />
      <EmptyState
        title="Exports"
        description="Exports download directly to your device. Use Export on each page to download a file."
        icon={<DownloadSimpleIcon className="size-6" aria-hidden />}
      />
    </PageShell>
  );
}
