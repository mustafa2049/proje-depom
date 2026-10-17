const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

/** Verilen anın (UTC) gün başlangıcını döner. */
export function startOfUtcDay(now: Date): Date {
  return new Date(Math.floor(now.getTime() / MS_PER_DAY) * MS_PER_DAY);
}

/** Gün başlangıcına `days` gün ekler (UTC). */
export function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/** Verilen tarihten `minutes` dakika sonrasını döner. */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MS_PER_MINUTE);
}

/** YYYY-MM-DD biçiminde UTC tarih anahtarı. */
export function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Bugünün UTC gün başlangıcı ile ertesi günün başlangıcı (sınır hariç). */
export function utcDayBounds(now: Date): { start: Date; end: Date } {
  const start = startOfUtcDay(now);
  return { start, end: addUtcDays(start, 1) };
}
