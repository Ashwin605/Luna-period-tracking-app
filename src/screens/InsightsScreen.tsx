import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { CycleLengthChart } from '../components/insights/CycleLengthChart';
import { StatCard } from '../components/insights/StatCard';
import { SymptomPattern } from '../components/insights/SymptomPattern';
import { AnimatedCard } from '../components/shared/AnimatedCard';
import { AnimatedScreenScaffold } from '../components/shared/AnimatedScreenScaffold';
import { Typography } from '../components/shared/Typography';
import { Colors } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { useCycleStore } from '../store/cycleStore';
import { computeCycleStats, dominantWeekday } from '../utils/cycleHelpers';

function ConfidenceRing({ percent, color }: { percent: number; color: string }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(600, withTiming(percent / 100, { duration: 1200, easing: Easing.out(Easing.cubic) }));
  }, [percent]);
  const ringStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  return (
    <View style={{ marginTop: 12 }}>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: color + '20', overflow: 'hidden' }}>
        <Animated.View style={[{ height: 8, borderRadius: 4, backgroundColor: color }, ringStyle]} />
      </View>
    </View>
  );
}

export function InsightsScreen() {
  const theme = useTheme();
  const cycles = useCycleStore(s => s.cycles);
  const logs = useCycleStore(s => s.dailyLogs);
  const prediction = useCycleStore(s => s.prediction);
  const stats = useMemo(() => computeCycleStats(cycles), [cycles]);
  const weekday = useMemo(() => dominantWeekday(cycles), [cycles]);
  const patternText = useMemo(() => {
    const parts: string[] = [];
    if (weekday) parts.push(`Your period often starts on a ${weekday}.`);
    if (stats.averageCycleLength) parts.push(`Average cycle length is about ${stats.averageCycleLength} days.`);
    return parts.length === 0 ? 'Keep logging — patterns will emerge as Luna learns your rhythm.' : parts.join(' ');
  }, [weekday, stats.averageCycleLength]);
  const confidencePct = prediction ? Math.round(prediction.confidence * 100) : 0;

  return (
    <AnimatedScreenScaffold title="Insights" subtitle="Understand your cycle trends" accentColor={Colors.luteal}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        <StatCard label="Avg cycle" value={stats.averageCycleLength ? `${stats.averageCycleLength} d` : '—'} accentColor={Colors.rose} index={0} />
        <StatCard label="Avg period" value={stats.averagePeriodLength ? `${stats.averagePeriodLength} d` : '—'} accentColor={Colors.menstrual} index={1} />
        <StatCard label="Longest" value={stats.longestCycle ? `${stats.longestCycle} d` : '—'} accentColor={Colors.luteal} index={2} />
        <StatCard label="Shortest" value={stats.shortestCycle ? `${stats.shortestCycle} d` : '—'} accentColor={Colors.follicular} index={3} />
      </View>
      {prediction ? (
        <AnimatedCard index={4} style={{ marginTop: theme.spacing.lg }} glowColor={Colors.ovulatory}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h3">Prediction confidence</Typography>
            <Typography variant="h2" color={Colors.ovulatory}>{confidencePct}%</Typography>
          </View>
          <ConfidenceRing percent={confidencePct} color={Colors.ovulatory} />
          <Typography variant="bodySmall" color={theme.colors.textSecondary} style={{ marginTop: 10, lineHeight: 18 }}>
            More logs mean sharper forecasts.
          </Typography>
        </AnimatedCard>
      ) : null}
      <AnimatedCard index={5} style={{ marginTop: theme.spacing.lg }}>
        <Typography variant="h3" style={{ marginBottom: 8 }}>✨ Patterns noticed</Typography>
        <Typography variant="body" color={theme.colors.textSecondary} style={{ lineHeight: 22 }}>{patternText}</Typography>
      </AnimatedCard>
      <View style={{ marginTop: theme.spacing.lg }}><CycleLengthChart cycles={cycles} /></View>
      <View style={{ marginTop: theme.spacing.lg }}><SymptomPattern logs={logs} /></View>
    </AnimatedScreenScaffold>
  );
}
