import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { addDays, differenceInDays, format, parseISO } from 'date-fns';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  Layout,
} from 'react-native-reanimated';

import { EnergySlider } from '../components/logging/EnergySlider';
import { FlowSelector } from '../components/logging/FlowSelector';
import { MoodSelector } from '../components/logging/MoodSelector';
import { SymptomChips } from '../components/logging/SymptomChips';
import { AnimatedButton } from '../components/shared/AnimatedButton';
import { AnimatedCard } from '../components/shared/AnimatedCard';
import { AnimatedScreenScaffold } from '../components/shared/AnimatedScreenScaffold';
import { Typography } from '../components/shared/Typography';
import { useTheme } from '../hooks/useTheme';
import {
  CYCLES_QUERY_KEY,
  useUpsertLogMutation,
} from '../hooks/useCycleData';
import {
  createCycle,
  listCycles,
  updateCycle,
} from '../services/database/cycleRepository';
import type { TabParamList } from '../navigation/types';
import { useCycleStore } from '../store/cycleStore';
import type { EnergyScore, FlowLevel, MoodScore } from '../types/cycle';
import { findCycleForDate } from '../utils/cycleHelpers';
import { todayIso } from '../utils/dateHelpers';
import { HapticEngine } from '../utils/haptics';

type LogRoute = RouteProp<TabParamList, 'Log'>;

export function LogScreen() {
  const theme = useTheme();
  const route = useRoute<LogRoute>();
  const queryClient = useQueryClient();
  const initialDate = route.params?.date ?? todayIso();

  const [date, setDate] = useState(initialDate);
  const [pickerDate, setPickerDate] = useState(parseISO(initialDate));
  const [showPicker, setShowPicker] = useState(false);
  const [mood, setMood] = useState<MoodScore>(3);
  const [flow, setFlow] = useState<FlowLevel>('none');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [energy, setEnergy] = useState<EnergyScore>(3);
  const [notes, setNotes] = useState('');

  const cycles = useCycleStore(s => s.cycles);
  const dailyLogs = useCycleStore(s => s.dailyLogs);
  const upsert = useUpsertLogMutation();

  // Save button animation
  const savePulse = useSharedValue(1);

  useEffect(() => {
    const iso = route.params?.date;
    if (iso) {
      setDate(iso);
      setPickerDate(parseISO(iso));
    }
  }, [route.params?.date]);

  useEffect(() => {
    const log = dailyLogs.find(l => l.date === date);
    if (log) {
      setMood(log.mood);
      setFlow(log.flow);
      setSymptoms(log.symptoms);
      setEnergy(log.energyLevel);
      setNotes(log.notes ?? '');
    } else {
      setMood(3);
      setFlow('none');
      setSymptoms([]);
      setEnergy(3);
      setNotes('');
    }
  }, [date, dailyLogs]);

  const toggleSymptom = useCallback((s: string) => {
    HapticEngine.selection();
    setSymptoms(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  }, []);

  const onDateChange = (_: DateTimePickerEvent, d?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (d) {
      setPickerDate(d);
      setDate(format(d, 'yyyy-MM-dd'));
      HapticEngine.selection();
    }
  };

  const maybeStartPeriod = (): Promise<boolean> => {
    const heavyFlow: FlowLevel[] = ['light', 'medium', 'heavy'];
    if (!heavyFlow.includes(flow)) return Promise.resolve(true);

    const existing = findCycleForDate(cycles, date);
    if (existing) return Promise.resolve(true);

    return new Promise(resolve => {
      HapticEngine.warning();
      Alert.alert(
        'Period starting?',
        'Log this as the first day of a new period?',
        [
          {
            text: 'Not now',
            style: 'cancel',
            onPress: () => resolve(true),
          },
          {
            text: 'Yes, start period',
            onPress: () => {
              void (async () => {
                const latest = await listCycles();
                const sorted = [...latest].sort((a, b) =>
                  a.startDate.localeCompare(b.startDate)
                );
                const open = sorted.filter(c => c.endDate === null);
                const prev = open[open.length - 1];
                const start = parseISO(date);
                if (prev && prev.startDate !== date) {
                  const prevStart = parseISO(prev.startDate);
                  const end = addDays(start, -1);
                  const cycleLength = differenceInDays(start, prevStart);
                  await updateCycle(prev.id, {
                    endDate: format(end, 'yyyy-MM-dd'),
                    cycleLength: Math.max(1, cycleLength),
                  });
                }
                await createCycle({
                  startDate: date,
                  periodLength: 5,
                });
                const refreshed = await listCycles();
                useCycleStore.getState().setCycles(refreshed);
                await queryClient.invalidateQueries({
                  queryKey: CYCLES_QUERY_KEY,
                });
                HapticEngine.heavy();
                resolve(true);
              })();
            },
          },
        ],
        { cancelable: true, onDismiss: () => resolve(false) }
      );
    });
  };

  const onSave = async () => {
    const proceed = await maybeStartPeriod();
    if (!proceed) return;

    const latest = await listCycles();
    const cycleId = findCycleForDate(latest, date)?.id ?? null;

    await upsert.mutateAsync({
      date,
      cycleId,
      mood,
      flow,
      symptoms,
      energyLevel: energy,
      notes: notes.trim() || null,
    });
    await HapticEngine.success();
    Alert.alert('Saved ✨', 'Your daily log has been saved.');
  };

  return (
    <AnimatedScreenScaffold title="Daily log" subtitle={date}>
      <AnimatedCard index={0}>
        <Typography variant="label" color={theme.colors.textSecondary}>
          DATE
        </Typography>
        <AnimatedButton
          label={format(pickerDate, 'MMMM d, yyyy')}
          variant="secondary"
          onPress={() => setShowPicker(true)}
          fullWidth
          style={{ marginTop: theme.spacing.sm }}
        />
        {showPicker ? (
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        ) : null}
      </AnimatedCard>

      <AnimatedCard index={1} style={{ marginTop: theme.spacing.md }}>
        <Typography variant="h3">Mood</Typography>
        <View style={{ marginTop: theme.spacing.sm }}>
          <MoodSelector value={mood} onChange={(v) => { HapticEngine.selection(); setMood(v); }} />
        </View>
      </AnimatedCard>

      <AnimatedCard index={2} style={{ marginTop: theme.spacing.md }}>
        <Typography variant="h3">Flow</Typography>
        <View style={{ marginTop: theme.spacing.sm }}>
          <FlowSelector value={flow} onChange={(v) => { HapticEngine.selection(); setFlow(v); }} />
        </View>
      </AnimatedCard>

      <AnimatedCard index={3} style={{ marginTop: theme.spacing.md }}>
        <Typography variant="h3">Symptoms</Typography>
        <View style={{ marginTop: theme.spacing.sm }}>
          <SymptomChips selected={symptoms} onToggle={toggleSymptom} />
        </View>
      </AnimatedCard>

      <AnimatedCard index={4} style={{ marginTop: theme.spacing.md }}>
        <EnergySlider value={energy} onChange={(v) => { HapticEngine.tick(); setEnergy(v); }} />
      </AnimatedCard>

      <AnimatedCard index={5} style={{ marginTop: theme.spacing.md }}>
        <Typography variant="h3">Notes</Typography>
        <TextInput
          value={notes}
          onChangeText={t => setNotes(t.slice(0, 500))}
          placeholder="Anything else on your mind?"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
          style={{
            marginTop: theme.spacing.sm,
            minHeight: 100,
            textAlignVertical: 'top',
            color: theme.colors.textPrimary,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
            fontSize: 15,
            lineHeight: 22,
          }}
        />
        <Typography
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ marginTop: 4, textAlign: 'right' }}
        >
          {notes.length}/500
        </Typography>
      </AnimatedCard>

      <AnimatedButton
        label="Save log"
        onPress={() => void onSave()}
        loading={upsert.isPending}
        fullWidth
        style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.lg }}
      />
    </AnimatedScreenScaffold>
  );
}
