export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

export function formatTrendPercent(value: number | null) {
  if (value == null) return 'New activity';
  if (value === 0) return 'No change';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

export const CATEGORY_CHIP_COLORS: Record<string, string> = {
  TRAVEL: 'bg-violet-500/15 text-violet-700',
  MEALS: 'bg-orange-500/15 text-orange-700',
  SUPPLIES: 'bg-sky-500/15 text-sky-700',
  OTHER: 'bg-muted text-muted-foreground',
};

export const MONTH_OPTIONS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export const QUARTER_OPTIONS = [
  { value: '1', label: 'Q1 (Jan–Mar)' },
  { value: '2', label: 'Q2 (Apr–Jun)' },
  { value: '3', label: 'Q3 (Jul–Sep)' },
  { value: '4', label: 'Q4 (Oct–Dec)' },
];

export function formatGreetingDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function toLocalDateIso(date = new Date()) {
  return date.toLocaleDateString('en-CA');
}

export type ReimbursementDuration = {
  value: string;
  unit: string;
  tone: 'fast' | 'typical' | 'slow';
  toneLabel: string;
};

export function formatReimbursementDuration(avgDays: number): ReimbursementDuration {
  let value: string;
  let unit: string;

  if (avgDays < 1 / 24) {
    const minutes = Math.max(1, Math.round(avgDays * 24 * 60));
    value = String(minutes);
    unit = pluralize(minutes, 'minute');
  } else if (avgDays < 1) {
    const hours = avgDays * 24;
    const rounded = hours < 10 ? hours.toFixed(1).replace(/\.0$/, '') : String(Math.round(hours));
    value = rounded;
    unit = Number(rounded) === 1 ? 'hour' : 'hours';
  } else if (avgDays < 10) {
    value = avgDays.toFixed(1).replace(/\.0$/, '');
    unit = Number(value) === 1 ? 'day' : 'days';
  } else {
    const days = Math.round(avgDays);
    value = String(days);
    unit = pluralize(days, 'day');
  }

  const tone = avgDays <= 2 ? 'fast' : avgDays <= 7 ? 'typical' : 'slow';
  const toneLabel =
    tone === 'fast' ? 'Fast turnaround' : tone === 'typical' ? 'Typical pace' : 'Slower pace';

  return { value, unit, tone, toneLabel };
}
