import * as LocalAuthentication from 'expo-local-authentication';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, withSpring, Easing, FadeIn } from 'react-native-reanimated';

import { useTheme } from '../hooks/useTheme';
import { useSettingsStore } from '../store/settingsStore';
import { AnimatedButton } from './shared/AnimatedButton';
import { Typography } from './shared/Typography';
import { HapticEngine } from '../utils/haptics';

const FIVE_MIN_MS = 5 * 60 * 1000;

interface Props { children: React.ReactNode; }

function PulsingLock({ color }: { color: string }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );
  }, []);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[{ width: 80, height: 80, borderRadius: 40, backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center' }, animStyle]}>
      <Typography variant="h1" align="center">🔒</Typography>
    </Animated.View>
  );
}

export function BiometricGate({ children }: Props) {
  const theme = useTheme();
  const biometricEnabled = useSettingsStore(s => s.biometricLockEnabled);
  const setLastBackgroundedAt = useSettingsStore(s => s.setLastBackgroundedAt);
  const [locked, setLocked] = useState(false);
  const appState = useRef(AppState.currentState);
  const lastBgMs = useRef<number | null>(null);

  const authenticate = useCallback(async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !enrolled) { setLocked(false); return; }
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock Luna', fallbackLabel: 'Use passcode' });
    if (result.success) { setLocked(false); HapticEngine.success(); }
    else { HapticEngine.error(); }
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      if (appState.current.match(/active/) && next.match(/inactive|background/)) {
        const now = Date.now(); lastBgMs.current = now; setLastBackgroundedAt(now);
      }
      if (appState.current.match(/inactive|background/) && next === 'active') {
        const enabled = useSettingsStore.getState().biometricLockEnabled;
        const last = lastBgMs.current;
        if (enabled && last && Date.now() - last > FIVE_MIN_MS) { setLocked(true); authenticate(); }
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [authenticate, setLastBackgroundedAt]);

  if (locked && biometricEnabled) {
    return (
      <Animated.View entering={FadeIn.duration(400)} style={[styles.overlay, { backgroundColor: theme.colors.background }]}>
        <PulsingLock color={theme.raw.rose} />
        <Typography variant="h2" align="center" style={{ marginTop: 24 }}>Luna is locked</Typography>
        <Typography variant="bodySmall" color={theme.colors.textSecondary} align="center" style={{ marginTop: 8, marginBottom: 32, lineHeight: 20 }}>
          Authenticate to continue using Luna.
        </Typography>
        <AnimatedButton label="Unlock" onPress={authenticate} fullWidth />
      </Animated.View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
});
