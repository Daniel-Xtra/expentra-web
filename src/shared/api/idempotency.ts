const IDEMPOTENCY_HEADER = 'idempotency-key';

const activeKeys = new Map<string, string>();

export function createIdempotencyKey(scope: string): string {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now()}${Math.random().toString(36).slice(2)}`;

  const key = `${scope}-${suffix}`;
  return key.length > 128 ? key.slice(0, 128) : key;
}

export function getIdempotencyKey(scope: string): string {
  const existing = activeKeys.get(scope);
  if (existing) {
    return existing;
  }

  const key = createIdempotencyKey(scope);
  activeKeys.set(scope, key);
  return key;
}

export function resetIdempotencyKey(scope: string): void {
  activeKeys.delete(scope);
}

export function clearAllIdempotencyKeys(): void {
  activeKeys.clear();
}

export async function buildHashedIdempotencyScope(
  prefix: string,
  material: string,
): Promise<string> {
  const payload = new TextEncoder().encode(`${prefix}:${material}`);
  const digest = await crypto.subtle.digest('SHA-256', payload);
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}-${hex}`.slice(0, 128);
}

export function idempotencyHeaders(scope: string): Record<string, string> {
  return {
    [IDEMPOTENCY_HEADER]: getIdempotencyKey(scope),
  };
}
