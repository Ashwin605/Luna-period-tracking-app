import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { differenceInDays, format, parseISO } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import {
  InteractionManager,
  RefreshControl,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';

import { CycleCalendar } from '../components/calendar/CycleCalendar';
import { PhaseBar } from '../components/calendar/PhaseBar';
import { AnimatedCard } from '../components/shared/AnimatedCard';
import { AnimatedScreenScaffold } from '../components/shared/AnimatedScreenScaffold';
import { Typography } from '../components/shared/Typography';
import { PhaseConfig, Colors } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import {
  CYCLES_QUERY_KEY,
  LOGS_QUERY_KEY,
} from '../hooks/useCycleData';
import type { TabParamList } from '../navigation/types';
import { useCycleStore } from '../store/cycleStore';
import { useQueryClient } from '@tanstack/react-query';
import { HapticEngine } from '../utils/haptics';

/** Pulsing orb that indicates current cycle phase */
function PhaseOrb({ color, size = 64 }: { color: string; size?: number }) {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.25);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.08, { duration: 1800 }),
        withTiming(0.25, { duration: 1800 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size * 2, height: size * 2 }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size * 2,
            height: size * 2,
            borderRadius: size,
            backgroundColor: color,
          },
          pulseStyle,
        ]}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 10,
        }}
      />
    </View>
  );
}

/** Animated countdown ring */
function CountdownBadge({ days, color }: { days: number; color: string }) {
  const scaleVal = useSharedValue(0);

  useEffect(() => {
    scaleVal.value = withDelay(400, withSpring(1, { damping: 12, stiffness: 180 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleVal.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 72,
          height: 72,
          borderRadius: 36,
          borderWidth: 3,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color + '15',
        },
        animStyle,
      ]}
    >
      <Typography variant="h1" color={color}>
        {days}
      </Typography>
      <Typography variant="caption" color={color} style={{ marginTop: -2 }}>
        days
      </Typography>
    </Animated.View>
  );
}

export function HomeScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const navigation =
    useNavigation<BottomTabNavigationProp<TabParamList, 'Home'>>();
  const prediction = useCycleStore(s => s.prediction);
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState<string | undefined>();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    HapticEngine.light();
    InteractionManager.runAfterInteractions(() => {
      void queryClient
        .invalidateQueries({ queryKey: CYCLES_QUERY_KEY })
        .then(() => queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEY }))
        .finally(() => setRefreshing(false));
    });
  }, [queryClient]);

  const phaseInfo = prediction ? PhaseConfig[prediction.currentPhase] : null;

  const countdown =
    prediction &&
    differenceInDays(parseISO(prediction.nextPeriodDate), new Date());

  return (
    <AnimatedScreenScaffold
      title="Home"
      subtitle="Your cycle at a glance"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.raw.rose}
          colors={[theme.raw.rose]}
        />
      }
    >
      {/* Phase status hero */}
      {prediction && phaseInfo ? (
        <AnimatedCard
          index={0}
          glowColor={phaseInfo.color}
          style={{ marginBottom: theme.spacing.md }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
              <Typography variant="label" color={theme.colors.textSecondary}>
                CURRENT PHASE
              </Typography>
              <Typography
                variant="h2"
                style={{ marginTop: 6 }}
                color={phaseInfo.color}
              >
                {phaseInfo.label}
              </Typography>
              <Typography
                variant="bodySmall"
                color={theme.colors.textSecondary}
                style={{ marginTop: 6, lineHeight: 18 }}
              >
                {phaseInfo.description}
              </Typography>
            </View>
            <PhaseOrb color={phaseInfo.color} size={40} />
          </View>
        </AnimatedCard>
      ) : null}

      {/* Quick stats row */}
      {prediction ? (
        <View
          style={{
            flexDirection: 'row',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.md,
          }}
        >
          <AnimatedCard index={1} style={{ flex: 1 }}>
            <Typography variant="label" color={theme.colors.textSecondary}>
              CYCLE DAY
            </Typography>
            <Typography variant="h1" style={{ marginTop: 4 }}>
              {prediction.currentCycleDay}
            </Typography>
          </AnimatedCard>

          <AnimatedCard index={2} style={{ flex: 1, alignItems: 'center' }}>
            <Typography variant="label" color={theme.colors.textSecondary}>
              NEXT PERIOD
            </Typography>
            {typeof countdown === 'number' ? (
              <CountdownBadge days={countdown} color={theme.raw.rose} />
            ) : (
              <Typography variant="h2" style={{ marginTop: 4 }}>
                {format(parseISO(prediction.nextPeriodDate), 'MMM d')}
              </Typography>
            )}
          </AnimatedCard>
        </View>
      ) : null}

      {/* Calendar card */}
      <AnimatedCard index={3}>
        <CycleCalendar
          visibleMonth={month}
          onChangeMonth={setMonth}
          selectedDate={selected}
          onSelectDate={iso => {
            setSelected(iso);
            HapticEngine.selection();
            navigation.navigate('Log', { date: iso });
          }}
        />
        <PhaseBar />
      </AnimatedCard>

      {/* Fertility window */}
      {prediction ? (
        <AnimatedCard
          index={4}
          style={{ marginTop: theme.spacing.md }}
          glowColor={Colors.follicular}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Typography variant="label" color={theme.colors.textSecondary}>
                FERTILE WINDOW
              </Typography>
              <Typography variant="h3" style={{ marginTop: 4 }}>
                {format(parseISO(prediction.fertileWindowStart), 'MMM d')} –{' '}
                {format(parseISO(prediction.fertileWindowEnd), 'MMM d')}
              </Typography>
            </View>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: Colors.follicular,
                shadowColor: Colors.follicular,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 6,
              }}
            />
          </View>
        </AnimatedCard>
      ) : (
        <AnimatedCard index={1} style={{ marginTop: theme.spacing.md }}>
          <Typography variant="body" color={theme.colors.textSecondary}>
            Log your period to unlock predictions ✨
          </Typography>
        </AnimatedCard>
      )}
    </AnimatedScreenScaffold>
  );
}
