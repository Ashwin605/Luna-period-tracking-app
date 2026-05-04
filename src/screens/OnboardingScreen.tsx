import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated';

import { AnimatedButton } from '../components/shared/AnimatedButton';
import { AnimatedCard } from '../components/shared/AnimatedCard';
import { Typography } from '../components/shared/Typography';
import { refreshCyclesIntoStore } from '../hooks/useCycleData';
import { useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';
import { persistUserSettings } from '../hooks/useSettingsBootstrap';
import { createCycle } from '../services/database/cycleRepository';
import { useSettingsStore } from '../store/settingsStore';
import { format } from 'date-fns';
import { HapticEngine } from '../utils/haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS = 4;

function ProgressDots({ current, total }: { current: number; total: number }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i <= current;
        return (
          <View key={i} style={{
            width: i === current ? 24 : 8, height: 8, borderRadius: 4,
            backgroundColor: active ? theme.raw.rose : theme.colors.border,
          }} />
        );
      })}
    </View>
  );
}

export function OnboardingScreen() {
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [lastPeriod, setLastPeriod] = useState(new Date());
  const [cycleLen, setCycleLen] = useState(28);
  const [showPicker, setShowPicker] = useState(false);
  const setOnboardingComplete = useSettingsStore(s => s.setOnboardingComplete);
  const setCycleLengthOverride = useSettingsStore(s => s.setCycleLengthOverride);
  const { requestAccess, register } = useNotifications();

  const onDateChange = (_: DateTimePickerEvent, date?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (date) { setLastPeriod(date); HapticEngine.selection(); }
  };

  const nextStep = (n: number) => { HapticEngine.stepAdvance(); setStep(n); };

  const finish = async () => {
    const startDate = format(lastPeriod, 'yyyy-MM-dd');
    await createCycle({ startDate, periodLength: 5 });
    await refreshCyclesIntoStore();
    setCycleLengthOverride(cycleLen);
    setOnboardingComplete(true);
    const snapshot = useSettingsStore.getState();
    await persistUserSettings({ cycleLengthOverride: cycleLen, periodLengthOverride: snapshot.periodLengthOverride, biometricLockEnabled: snapshot.biometricLockEnabled, themeMode: snapshot.themeMode, onboardingComplete: true, lastBackgroundedAt: snapshot.lastBackgroundedAt });
    HapticEngine.success();
  };

  const handleNotifStep = async () => { await requestAccess(); await register(); await finish(); };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, padding: theme.spacing.lg, justifyContent: 'center' }}>
        <ProgressDots current={step} total={STEPS} />

        {step === 0 ? (
          <Animated.View entering={FadeIn.duration(500)}>
            <AnimatedCard index={0} glowColor={theme.raw.rose}>
              <View style={{ alignItems: 'center', paddingVertical: theme.spacing.lg }}>
                <Typography variant="h1" align="center">🌙</Typography>
                <Typography variant="h1" align="center" style={{ marginTop: theme.spacing.md }}>Welcome to Luna</Typography>
                <Typography variant="body" color={theme.colors.textSecondary} align="center" style={{ marginTop: theme.spacing.md, lineHeight: 22 }}>
                  Your private cycle companion.{'\n'}Everything stays on this device.
                </Typography>
              </View>
              <AnimatedButton label="Get started" onPress={() => nextStep(1)} fullWidth style={{ marginTop: theme.spacing.lg }} />
            </AnimatedCard>
          </Animated.View>
        ) : null}

        {step === 1 ? (
          <Animated.View entering={SlideInRight.duration(400).springify()}>
            <AnimatedCard index={0}>
              <Typography variant="h3">When did your last period start?</Typography>
              <Typography variant="bodySmall" color={theme.colors.textSecondary} style={{ marginTop: 8 }}>This helps Luna make your first predictions.</Typography>
              <AnimatedButton label={format(lastPeriod, 'MMMM d, yyyy')} variant="secondary" onPress={() => setShowPicker(true)} fullWidth style={{ marginTop: theme.spacing.md }} />
              {showPicker ? <DateTimePicker value={lastPeriod} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} maximumDate={new Date()} /> : null}
              <AnimatedButton label="Continue" onPress={() => nextStep(2)} fullWidth style={{ marginTop: theme.spacing.lg }} />
            </AnimatedCard>
          </Animated.View>
        ) : null}

        {step === 2 ? (
          <Animated.View entering={SlideInRight.duration(400).springify()}>
            <AnimatedCard index={0}>
              <Typography variant="h3">How long is your usual cycle?</Typography>
              <Typography variant="h1" style={{ marginTop: theme.spacing.lg, textAlign: 'center' }} color={theme.raw.rose}>{Math.round(cycleLen)} days</Typography>
              <Slider minimumValue={21} maximumValue={45} step={1} value={cycleLen} onValueChange={(v: number) => { setCycleLen(v); HapticEngine.tick(); }} minimumTrackTintColor={theme.raw.rose} maximumTrackTintColor={theme.colors.border} thumbTintColor={theme.raw.rose} style={{ marginTop: theme.spacing.md }} />
              <AnimatedButton label="Continue" onPress={() => nextStep(3)} fullWidth style={{ marginTop: theme.spacing.lg }} />
            </AnimatedCard>
          </Animated.View>
        ) : null}

        {step === 3 ? (
          <Animated.View entering={SlideInRight.duration(400).springify()}>
            <AnimatedCard index={0}>
              <Typography variant="h3">Stay on track with reminders</Typography>
              <Typography variant="bodySmall" color={theme.colors.textSecondary} style={{ marginTop: 8, lineHeight: 18 }}>
                Luna can remind you before your period, when your fertile window opens, and to log symptoms.
              </Typography>
              <AnimatedButton label="Enable notifications" onPress={handleNotifStep} fullWidth style={{ marginTop: theme.spacing.lg }} />
              <AnimatedButton label="Skip for now" variant="ghost" onPress={finish} fullWidth style={{ marginTop: theme.spacing.sm }} />
            </AnimatedCard>
          </Animated.View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
