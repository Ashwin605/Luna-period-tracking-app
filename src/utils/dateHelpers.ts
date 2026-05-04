import {
  addDays,
  differenceInDays,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns';

export const ISO_DATE = 'yyyy-MM-dd';

export function todayIso(): string {
  return format(startOfDay(new Date()), ISO_DATE);
}

export function toIso(date: Date): string {
  return format(date, ISO_DATE);
}

export function fromIso(value: string): Date {
  return parseISO(value);
}

export function daysBetween(a: Date | string, b: Date | string): number {
  const da = typeof a === 'string' ? parseISO(a) : a;
  const db = typeof b === 'string' ? parseISO(b) : b;
  return differenceInDays(da, db);
}

export function addDaysIso(value: string, days: number): string {
  return format(addDays(parseISO(value), days), ISO_DATE);
}

export function isSameIsoDay(a: string, b: string): boolean {
  return isSameDay(parseISO(a), parseISO(b));
}

export function getMonthBounds(year: number, month: number): {
  start: Date;
  end: Date;
} {
  const ref = new Date(year, month, 1);
  return { start: startOfMonth(ref), end: endOfMonth(ref) };
}

export function nowIsoTimestamp(): string {
  return new Date().toISOString();
}
