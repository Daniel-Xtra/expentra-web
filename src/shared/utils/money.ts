const ngnFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 2,
});

/** Format integer kobo as Nigerian Naira. */
export function formatNgn(kobo: number): string {
  return ngnFormatter.format(kobo / 100);
}

/** Format integer kobo for currency input fields (e.g. "45.50"). */
export function koboToNairaInput(kobo: number): string {
  return (kobo / 100).toFixed(2);
}

/** Convert naira input (e.g. "45.50") to integer kobo. */
export function nairaToKobo(value: string): number {
  const normalized = value.replace(/,/g, '').trim();
  if (!normalized) {
    return 0;
  }

  const [whole = '0', fraction = ''] = normalized.split('.');
  const paddedFraction = `${fraction}00`.slice(0, 2);
  const kobo = Number(whole) * 100 + Number(paddedFraction);

  if (!Number.isFinite(kobo) || kobo < 0) {
    throw new Error('Invalid amount');
  }

  return kobo;
}
