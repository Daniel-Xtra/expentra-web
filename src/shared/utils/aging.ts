/** True when `date` is strictly older than `days` days ago. */
export function isAgingByDays(date?: string | null, days = 0): boolean {
  if (!date) return false;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(date).getTime() < cutoff;
}
