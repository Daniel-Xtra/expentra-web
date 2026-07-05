import type { AuthorizationMe } from '@/features/auth/types';
import { OrgGrantType } from '@/features/auth/types';
import { GENERATED_CAPABILITY_KEYS } from './generated-capabilities';

const KNOWN_CAPABILITIES = new Set<string>(GENERATED_CAPABILITY_KEYS);

/** Org-grant and composite capabilities used in the UI but not tied to a single permission seed. */
const UI_EXTENSION_CAPABILITIES = new Set([
  'department:read:managed',
  'approval:approve:department',
  'approval:reject:department',
  'notification:read:own',
]);

/** Structural org-grant capabilities — the `*` wildcard must not imply these. */
export const ORG_GRANT_ONLY_CAPABILITIES = new Set([
  'department:read:managed',
  'approval:approve:department',
  'approval:reject:department',
]);

export function isKnownCapability(capability: string): boolean {
  return (
    capability === '*' ||
    KNOWN_CAPABILITIES.has(capability) ||
    UI_EXTENSION_CAPABILITIES.has(capability)
  );
}

export function assertKnownCapabilities(capabilities: string[]): void {
  const unknown = capabilities.filter((cap) => !isKnownCapability(cap));
  if (unknown.length > 0 && import.meta.env.DEV) {
    console.warn(
      '[capabilities] Unknown capability keys (check navigation or regenerate):',
      unknown,
    );
  }
}

export function hasManagedDepartmentAccess(
  authorization?: Pick<AuthorizationMe, 'managedDepartments' | 'orgGrants'> | null,
): boolean {
  if (!authorization) {
    return false;
  }

  if ((authorization.managedDepartments?.length ?? 0) > 0) {
    return true;
  }

  return (
    authorization.orgGrants?.some(
      (grant) => grant.type === OrgGrantType.DEPARTMENT_MANAGER,
    ) ?? false
  );
}

export function canAccess(
  capabilities: string[] | undefined,
  ...required: (string | string[])[]
): boolean {
  if (!capabilities?.length) {
    return false;
  }

  const hasWildcard = capabilities.includes('*');

  return required.some((req) => {
    const checks = Array.isArray(req) ? req : [req];
    return checks.some((capability) => {
      if (capabilities.includes(capability)) {
        return true;
      }

      return hasWildcard && !ORG_GRANT_ONLY_CAPABILITIES.has(capability);
    });
  });
}
