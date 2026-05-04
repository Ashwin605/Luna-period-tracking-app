import { addDays, differenceInDays, format, parseISO } from 'date-fns';

import type {
  CycleEntry,
  CyclePhase,
  PredictionResult,
} from '../../types/cycle';

export const MIN_CYCLES_FOR_PREDICTION = 1;
export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;
export const MAX_CYCLES_FOR_AVERAGE = 12;

function weightedAverage(values: number[]): number {
  const weights = values.map((_, i) => i + 1);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weightedSum = values.reduce(
    (sum, val, i) => sum + val * weights[i],
    0
  );
  return Math.round(weightedSum / totalWeight);
}

export function determinePhase(
  cycleDay: number,
  periodLength: number,
  cycleLength: number
): CyclePhase {
  const ovulationDay = cycleLength - 14;
  const fertileStart = ovulationDay - 5;

  if (cycleDay <= periodLength) return 'menstrual';
  if (cycleDay < fertileStart) return 'follicular';
  if (cycleDay <= ovulationDay + 1) return 'ovulatory';
  return 'luteal';
}

export function runCyclePrediction(
  cycles: CycleEntry[],
  today: Date = new Date(),
  options?: {
    defaultCycleLength?: number | null;
    defaultPeriodLength?: number | null;
  }
): PredictionResult {
  const sortedCycles = [...cycles]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(-MAX_CYCLES_FOR_AVERAGE);

  const completedCycles = sortedCycles.filter(c => c.cycleLength !== null);
  const cycleLengths = completedCycles.map(c => c.cycleLength as number);

  const avgCycleLength =
    cycleLengths.length > 0
      ? weightedAverage(cycleLengths)
      : options?.defaultCycleLength ?? DEFAULT_CYCLE_LENGTH;

  const completedPeriodLengths = sortedCycles
    .filter(c => c.endDate !== null)
    .map(c => c.periodLength);

  const avgPeriodLength =
    completedPeriodLengths.length > 0
      ? weightedAverage(completedPeriodLengths)
      : options?.defaultPeriodLength ?? DEFAULT_PERIOD_LENGTH;

  const latestCycle = sortedCycles[sortedCycles.length - 1];
  const lastPeriodStart = latestCycle
    ? parseISO(latestCycle.startDate)
    : addDays(today, -14);

  const nextPeriodDate = addDays(lastPeriodStart, avgCycleLength);
  const ovulationDate = addDays(nextPeriodDate, -14);
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = addDays(ovulationDate, 1);

  const currentCycleDay = differenceInDays(today, lastPeriodStart) + 1;

  const currentPhase = determinePhase(
    currentCycleDay,
    avgPeriodLength,
    avgCycleLength
  );

  const confidence = Math.min(completedCycles.length / 6, 1);

  return {
    nextPeriodDate: format(nextPeriodDate, 'yyyy-MM-dd'),
    fertileWindowStart: format(fertileWindowStart, 'yyyy-MM-dd'),
    fertileWindowEnd: format(fertileWindowEnd, 'yyyy-MM-dd'),
    ovulationDate: format(ovulationDate, 'yyyy-MM-dd'),
    currentPhase,
    currentCycleDay: Math.max(1, currentCycleDay),
    averageCycleLength: avgCycleLength,
    confidence,
  };
}

export function getMonthPhaseMap(
  year: number,
  month: number,
  cycles: CycleEntry[],
  prediction: PredictionResult
): Record<string, CyclePhase> {
  const map: Record<string, CyclePhase> = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = format(date, 'yyyy-MM-dd');

    const realCycle = cycles.find(c => {
      const start = parseISO(c.startDate);
      const end = c.endDate
        ? parseISO(c.endDate)
        : addDays(start, c.periodLength - 1);
      return date >= start && date <= end;
    });

    if (realCycle) {
      map[dateStr] = 'menstrual';
      continue;
    }

    if (
      dateStr >= prediction.fertileWindowStart &&
      dateStr <= prediction.fertileWindowEnd
    ) {
      map[dateStr] = 'ovulatory';
    } else if (
      dateStr >= prediction.nextPeriodDate &&
      dateStr <=
        format(addDays(parseISO(prediction.nextPeriodDate), 4), 'yyyy-MM-dd')
    ) {
      map[dateStr] = 'predicted_menstrual';
    }
  }

  return map;
}
