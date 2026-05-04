import { addDays, differenceInDays, parseISO } from 'date-fns';
import type { CycleEntry, DailyLog } from '../types/cycle';

export function findCycleForDate(
  cycles: CycleEntry[],
  isoDate: string
): CycleEntry | null {
  const target = parseISO(isoDate);
  for (const cycle of cycles) {
    const start = parseISO(cycle.startDate);
    const end = cycle.endDate
      ? parseISO(cycle.endDate)
      : addDays(start, cycle.periodLength - 1);
    if (target >= start && target <= end) {
      return cycle;
    }
  }
  return null;
}

export function computeCycleStats(cycles: CycleEntry[]): {
  averageCycleLength: number | null;
  averagePeriodLength: number | null;
  longestCycle: number | null;
  shortestCycle: number | null;
} {
  const completed = cycles.filter(c => c.cycleLength !== null);
  if (completed.length === 0) {
    return {
      averageCycleLength: null,
      averagePeriodLength: null,
      longestCycle: null,
      shortestCycle: null,
    };
  }
  const lengths = completed.map(c => c.cycleLength as number);
  const periods = completed.map(c => c.periodLength);
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
  return {
    averageCycleLength: Math.round(sum(lengths) / lengths.length),
    averagePeriodLength: Math.round(sum(periods) / periods.length),
    longestCycle: Math.max(...lengths),
    shortestCycle: Math.min(...lengths),
  };
}

export function topSymptoms(
  logs: DailyLog[],
  limit: number = 5
): Array<{ symptom: string; count: number }> {
  const counts = new Map<string, number>();
  for (const log of logs) {
    for (const sym of log.symptoms) {
      counts.set(sym, (counts.get(sym) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function dominantWeekday(cycles: CycleEntry[]): string | null {
  if (cycles.length === 0) return null;
  const counts = new Array(7).fill(0);
  const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  for (const c of cycles) {
    counts[parseISO(c.startDate).getDay()]++;
  }
  let bestIdx = 0;
  for (let i = 1; i < 7; i++) {
    if (counts[i] > counts[bestIdx]) bestIdx = i;
  }
  if (counts[bestIdx] < 2) return null;
  return weekdays[bestIdx];
}

export function computeNextPeriodCountdown(
  nextPeriodIso: string,
  today: Date = new Date()
): number {
  return differenceInDays(parseISO(nextPeriodIso), today);
}
