import type { PermissionResponse, PermissionsGroupedResponse } from '@/types/api';

const LABEL_WORDS = [
  'management',
  'notifications',
  'notification',
  'permissions',
  'permission',
  'departments',
  'department',
  'approvals',
  'approval',
  'expenses',
  'expense',
  'delegations',
  'delegation',
  'policies',
  'policy',
  'budgets',
  'budget',
  'reports',
  'report',
  'settings',
  'reimbursements',
  'reimbursement',
  'employees',
  'employee',
  'finance',
  'audit',
  'users',
  'user',
  'roles',
  'role',
  'admin',
  'team',
  'logs',
  'log',
  'levels',
  'level',
  'queue',
  'create',
  'update',
  'delete',
  'manage',
  'view',
  'read',
  'write',
  'export',
  'import',
  'approve',
  'reject',
  'submit',
  'assign',
].sort((a, b) => b.length - a.length);

export type PermissionGroup = {
  key: string;
  label: string;
  permissions: PermissionResponse[];
};

function normalizeLabelSource(value: string): string {
  return value
    .replace(/[:._-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitCompactWords(value: string): string {
  const lower = value.toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (!lower) {
    return value;
  }

  const words: string[] = [];
  let index = 0;

  while (index < lower.length) {
    let matched = false;

    for (const word of LABEL_WORDS) {
      if (lower.startsWith(word, index)) {
        words.push(word);
        index += word.length;
        matched = true;
        break;
      }
    }

    if (matched) {
      continue;
    }

    let end = lower.length;
    for (const word of LABEL_WORDS) {
      const pos = lower.indexOf(word, index + 1);
      if (pos !== -1 && pos < end) {
        end = pos;
      }
    }

    if (end === index) {
      words.push(lower[index]);
      index += 1;
    } else {
      words.push(lower.slice(index, end));
      index = end;
    }
  }

  return words.join(' ');
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Uppercase enum identifiers such as APPROVED, UNDER_REVIEW, MEALS. */
function formatEnumIdentifier(value: string): string | null {
  if (!/^[A-Z][A-Z0-9_]*$/.test(value)) {
    return null;
  }

  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export function formatLabel(value: string): string {
  if (!value) {
    return value;
  }

  const enumLabel = formatEnumIdentifier(value);
  if (enumLabel) {
    return enumLabel;
  }

  let text = normalizeLabelSource(value);

  if (!/\s/.test(text)) {
    const compact = splitCompactWords(text);
    if (compact.includes(' ')) {
      text = compact;
    }
  }

  return toTitleCase(text);
}

/** Humanize stored role identifiers without splitting plain words like "manager". */
export function formatRoleName(value: string): string {
  if (!value) {
    return value;
  }

  const text = value
    .replace(/[:._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return toTitleCase(text);
}

export function formatPermissionLabel(permission: PermissionResponse): string {
  const source = permission.description?.trim() || permission.name?.trim();
  if (!source) {
    return '—';
  }

  return formatLabel(source);
}

export function formatPermissionGroups(
  groups: PermissionsGroupedResponse,
): PermissionGroup[] {
  const byResource = new Map<string, PermissionResponse[]>();

  for (const [groupKey, permissions] of Object.entries(groups)) {
    if (!Array.isArray(permissions)) {
      continue;
    }

    for (const permission of permissions) {
      if (!permission?.reference) {
        continue;
      }

      const resourceValue =
        typeof permission.resource === 'string'
          ? permission.resource.trim()
          : String(permission.resource ?? '').trim();
      const resourceKey = resourceValue || groupKey || 'general';
      const list = byResource.get(resourceKey) ?? [];
      if (!list.some((item) => item.reference === permission.reference)) {
        list.push(permission);
      }
      byResource.set(resourceKey, list);
    }
  }

  return Array.from(byResource.entries())
    .map(([key, permissions]) => ({
      key,
      label: formatLabel(key),
      permissions: [...permissions].sort((a, b) =>
        formatPermissionLabel(a).localeCompare(formatPermissionLabel(b)),
      ),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) {
    return '—';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) {
    return '—';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return '—';
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Compact relative time for activity feeds (e.g. "5m ago"). */
export function formatRelativeTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (!Number.isFinite(diffMs) || diffMs < 0) {
    return date.toLocaleString();
  }

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) {
    return 'Just now';
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) {
    return `${diffHr}h ago`;
  }

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) {
    return `${diffDay}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}
