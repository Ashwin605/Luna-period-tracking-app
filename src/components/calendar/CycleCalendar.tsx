import {
  addMonths,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  subMonths,
} from 'date-fns';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { getMonthPhaseMap } from '../../services/prediction/cycleEngine';
import { useCycleStore } from '../../store/cycleStore';
import type { CyclePhase } from '../../types/cycle';
import { todayIso } from '../../utils/dateHelpers';
import { Typography } from '../shared/Typography';
import { DayCell } from './DayCell';

interface Props {
  visibleMonth: Date;
  onChangeMonth: (next: Date) => void;
  selectedDate?: string;
  onSelectDate: (isoDate: string) => void;
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type Cell =
  | { kind: 'empty' }
  | {
      kind: 'day';
      day: number;
      iso: string;
      phase: CyclePhase | null;
    };

export function CycleCalendar({
  visibleMonth,
  onChangeMonth,
  selectedDate,
  onSelectDate,
}: Props) {
  const theme = useTheme();
  const cycles = useCycleStore(s => s.cycles);
  const prediction = useCycleStore(s => s.prediction);

  const phaseMap = useMemo(() => {
    if (!prediction) return {};
    return getMonthPhaseMap(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      cycles,
      prediction
    );
  }, [cycles, prediction, visibleMonth]);

  const weeks = useMemo(() => {
    const start = startOfMonth(visibleMonth);
    const end = endOfMonth(visibleMonth);
    const leading = getDay(start);
    const totalDays = end.getDate();

    const flat: Cell[] = [];

    for (let i = 0; i < leading; i++) {
      flat.push({ kind: 'empty' });
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth(),
        d
      );
      const iso = format(date, 'yyyy-MM-dd');
      flat.push({
        kind: 'day',
        day: d,
        iso,
        phase: phaseMap[iso] ?? null,
      });
    }

    while (flat.length % 7 !== 0) {
      flat.push({ kind: 'empty' });
    }

    const rows: Cell[][] = [];
    for (let i = 0; i < flat.length; i += 7) {
      rows.push(flat.slice(i, i + 7));
    }
    return rows;
  }, [visibleMonth, phaseMap]);

  const today = todayIso();
  const headerLabel = format(visibleMonth, 'MMMM yyyy');

  return (
    <View>
      <View style={styles.header}>
        <Pressable
          onPress={() => onChangeMonth(subMonths(visibleMonth, 1))}
          style={styles.navBtn}
        >
          <Typography variant="h3" color={theme.colors.textSecondary}>
            {'<'}
          </Typography>
        </Pressable>
        <Typography variant="h3">{headerLabel}</Typography>
        <Pressable
          onPress={() => onChangeMonth(addMonths(visibleMonth, 1))}
          style={styles.navBtn}
        >
          <Typography variant="h3" color={theme.colors.textSecondary}>
            {'>'}
          </Typography>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((d, i) => (
          <View key={`${d}-${i}`} style={styles.weekday}>
            <Typography
              variant="label"
              color={theme.colors.textSecondary}
              align="center"
            >
              {d}
            </Typography>
          </View>
        ))}
      </View>

      {weeks.map((row, ri) => (
        <View key={`row-${ri}`} style={styles.row}>
          {row.map((cell, ci) =>
            cell.kind === 'day' ? (
              <View key={cell.iso} style={styles.cellSlot}>
                <DayCell
                  day={cell.day}
                  isoDate={cell.iso}
                  phase={cell.phase}
                  isToday={cell.iso === today}
                  isSelected={cell.iso === selectedDate}
                  isCurrentMonth
                  onPress={onSelectDate}
                />
              </View>
            ) : (
              <View key={`e-${ri}-${ci}`} style={styles.cellSlot} />
            )
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekday: {
    flex: 1,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
  },
  cellSlot: {
    flex: 1,
    aspectRatio: 1,
  },
});
