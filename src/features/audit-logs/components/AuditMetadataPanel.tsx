import { formatLabel } from '@/shared/utils/format';

type AuditMetadataPanelProps = {
  metadata: Record<string, unknown> | null | undefined;
};

function formatMetaKey(key: string): string {
  const field = key
    .replace(/^previous/, '')
    .replace(/^next/, '')
    .replace(/Reference$/, '');
  return formatLabel(field || key);
}

function formatMetaValue(value: unknown): string {
  if (value == null) {
    return '—';
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => formatMetaValue(item)).join(', ');
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function AuditMetadataPanel({ metadata }: AuditMetadataPanelProps) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No additional change details recorded.</p>
    );
  }

  const entries = Object.entries(metadata);
  const previousKeys = entries.filter(([key]) => key.startsWith('previous'));
  const nextKeys = entries.filter(([key]) => key.startsWith('next'));
  const otherKeys = entries.filter(
    ([key]) => !key.startsWith('previous') && !key.startsWith('next'),
  );

  return (
    <div className="space-y-3 text-sm">
      {previousKeys.length > 0 || nextKeys.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 rounded-md border border-border/60 bg-background p-3">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Before
            </p>
            {previousKeys.length === 0 ? (
              <p className="text-muted-foreground">—</p>
            ) : (
              previousKeys.map(([key, value]) => (
                <p key={key}>
                  <span className="text-muted-foreground">
                    {formatMetaKey(key)}:
                  </span>{' '}
                  <span className="font-medium text-foreground">{formatMetaValue(value)}</span>
                </p>
              ))
            )}
          </div>
          <div className="space-y-1.5 rounded-md border border-border/60 bg-background p-3">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              After
            </p>
            {nextKeys.length === 0 ? (
              <p className="text-muted-foreground">—</p>
            ) : (
              nextKeys.map(([key, value]) => (
                <p key={key}>
                  <span className="text-muted-foreground">
                    {formatMetaKey(key)}:
                  </span>{' '}
                  <span className="font-medium text-foreground">{formatMetaValue(value)}</span>
                </p>
              ))
            )}
          </div>
        </div>
      ) : null}

      {otherKeys.length > 0 ? (
        <div className="space-y-1.5 rounded-md border border-border/60 bg-background p-3">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Details
          </p>
          {otherKeys.map(([key, value]) => (
            <p key={key}>
              <span className="text-muted-foreground">{formatMetaKey(key)}:</span>{' '}
              <span className="font-medium break-all text-foreground">
                {formatMetaValue(value)}
              </span>
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
