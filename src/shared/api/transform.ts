function toCamelCase(key: string): string {
  return key.replace(/_([a-z0-9])/gi, (_, char: string) => char.toUpperCase());
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function deepCamelCaseKeys<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => deepCamelCaseKeys(item)) as T;
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [toCamelCase(key), deepCamelCaseKeys(nested)]),
  ) as T;
}
