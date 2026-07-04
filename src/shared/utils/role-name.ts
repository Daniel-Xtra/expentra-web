export function normalizeRoleName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const ROLE_NAME_PATTERN = /^[a-z][a-z0-9_]*$/;

export function isValidRoleName(value: string): boolean {
  return ROLE_NAME_PATTERN.test(normalizeRoleName(value));
}
