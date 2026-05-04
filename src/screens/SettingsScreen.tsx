import { useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Pressable, Switch, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AnimatedButton } from '../components/shared/AnimatedButton';
import { AnimatedCard } from '../components/shared/AnimatedCard';
import { AnimatedScreenScaffold } from '../components/shared/AnimatedScreenScaffold';
import { Typography } from '../components/shared/Typography';
import { useTheme } from '../hooks/useTheme';
import { persistReminderConfig, persistUserSettings } from '../hooks/useSettingsBootstrap';
import { getDatabase, resetDatabase } from '../services/database/migrations';
import { listCycles } from '../services/database/cycleRepository';
import { listLogs } from '../services/database/logRepository';
import { cancelAllScheduledNotifications } from '../services/notifications/notificationService';
import { useCycleStore } from '../store/cycleStore';
import { useNotificationStore } from '../store/notificationStore';
import { useSettingsStore } from '../store/settingsStore';
import { DEFAULT_REMINDER_CONFIG } from '../types/notification';
import { DEFAULT_USER_SETTINGS, type ThemeMode } from '../types/settings';
import { HapticEngine } from '../utils/haptics';

export function SettingsScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const cycleOverride = useSettingsStore(s => s.cycleLengthOverride);
  const periodOverride = useSettingsStore(s => s.periodLengthOverride);
  const biometric = useSettingsStore(s => s.biometricLockEnabled);
  const themeMode = useSettingsStore(s => s.themeMode);
  const setCycleOverride = useSettingsStore(s => s.setCycleLengthOverride);
  const setPeriodOverride = useSettingsStore(s => s.setPeriodLengthOverride);
  const setBiometric = useSettingsStore(s => s.setBiometricLockEnabled);
  const setThemeMode = useSettingsStore(s => s.setThemeMode);

  const [cycleText, setCycleText] = useState(cycleOverride ? String(cycleOverride) : '');
  const [periodText, setPeriodText] = useState(periodOverride ? String(periodOverride) : '');

  const persistAllSettings = async () => {
    const snap = useSettingsStore.getState();
    await persistUserSettings({ cycleLengthOverride: snap.cycleLengthOverride, periodLengthOverride: snap.periodLengthOverride, biometricLockEnabled: snap.biometricLockEnabled, themeMode: snap.themeMode, onboardingComplete: snap.onboardingComplete, lastBackgroundedAt: snap.lastBackgroundedAt });
  };

  const saveOverrides = async () => {
    const c = cycleText.trim() ? Number(cycleText) : null;
    const p = periodText.trim() ? Number(periodText) : null;
    if (c !== null && (Number.isNaN(c) || c < 21 || c > 45)) { HapticEngine.warning(); Alert.alert('Invalid', 'Cycle length should be between 21 and 45 days.'); return; }
    if (p !== null && (Number.isNaN(p) || p < 1 || p > 14)) { HapticEngine.warning(); Alert.alert('Invalid', 'Period length should be between 1 and 14 days.'); return; }
    setCycleOverride(c); setPeriodOverride(p);
    const snap = useSettingsStore.getState();
    await persistUserSettings({ ...snap, cycleLengthOverride: c, periodLengthOverride: p });
    HapticEngine.success(); Alert.alert('Saved ✨', 'Your overrides have been updated.');
  };

  const exportData = async () => {
    const cycles = await listCycles(); const logs = await listLogs();
    const payload = { exportedAt: new Date().toISOString(), cycles, logs };
    const json = JSON.stringify(payload, null, 2);
    const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
    const path = `${base}luna-export.json`;
    await FileSystem.writeAsStringAsync(path, json);
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) { await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Export Luna data' }); }
    else { Alert.alert('Export ready', `Saved to:\n${path}`); }
    HapticEngine.success();
  };

  const wipe = () => {
    HapticEngine.heavy();
    Alert.alert('Delete all data?', 'This removes every cycle and log from this device. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { void (async () => {
        await cancelAllScheduledNotifications();
        const db = await getDatabase(); await resetDatabase(db);
        useCycleStore.getState().reset(); useNotificationStore.getState().reset();
        useNotificationStore.getState().hydrate(DEFAULT_REMINDER_CONFIG);
        useSettingsStore.getState().reset();
        await persistUserSettings(DEFAULT_USER_SETTINGS); await persistReminderConfig(DEFAULT_REMINDER_CONFIG);
        queryClient.clear(); HapticEngine.error(); Alert.alert('Done', 'All local data has been removed.');
      })(); } },
    ]);
  };

  const version = Constants.expoConfig?.version ?? Constants.manifest2?.extra?.expoClient?.version ?? '1.0.0';

  const ThemeChip = ({ mode, label, icon }: { mode: ThemeMode; label: string; icon: string }) => {
    const active = themeMode === mode;
    return (
      <Pressable onPress={() => { setThemeMode(mode); HapticEngine.selection(); void persistAllSettings(); }}
        style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 12, borderRadius: theme.radius.lg, borderWidth: 1.5, borderColor: active ? theme.raw.rose : theme.colors.border, backgroundColor: active ? theme.raw.roseLight : theme.colors.surface, alignItems: 'center' }}>
        <Typography variant="h3" align="center">{icon}</Typography>
        <Typography variant="bodySmall" weight={active ? '600' : '400'} color={active ? theme.raw.roseDark : theme.colors.textPrimary} align="center" style={{ marginTop: 4 }}>{label}</Typography>
      </Pressable>
    );
  };

  return (
    <AnimatedScreenScaffold title="Settings" subtitle="Privacy and preferences">
      <AnimatedCard index={0}>
        <Typography variant="h3">Cycle overrides</Typography>
        <Typography variant="bodySmall" color={theme.colors.textSecondary} style={{ marginTop: 4 }}>Optional manual averages used when Luna does not yet have enough history.</Typography>
        <Typography variant="label" color={theme.colors.textSecondary} style={{ marginTop: theme.spacing.md }}>Average cycle length (21–45 days)</Typography>
        <TextInput value={cycleText} onChangeText={setCycleText} keyboardType="number-pad" placeholder="e.g. 28" placeholderTextColor={theme.colors.textSecondary}
          style={{ marginTop: 6, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.md, color: theme.colors.textPrimary, fontSize: 15 }} />
        <Typography variant="label" color={theme.colors.textSecondary} style={{ marginTop: theme.spacing.md }}>Average period length (1–14 days)</Typography>
        <TextInput value={periodText} onChangeText={setPeriodText} keyboardType="number-pad" placeholder="e.g. 5" placeholderTextColor={theme.colors.textSecondary}
          style={{ marginTop: 6, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.md, color: theme.colors.textPrimary, fontSize: 15 }} />
        <AnimatedButton label="Save overrides" onPress={() => void saveOverrides()} fullWidth style={{ marginTop: theme.spacing.md }} />
      </AnimatedCard>

      <AnimatedCard index={1} style={{ marginTop: theme.spacing.md }}>
        <Typography variant="h3">Appearance</Typography>
        <View style={{ flexDirection: 'row', marginTop: theme.spacing.md, gap: 8 }}>
          <ThemeChip mode="light" label="Light" icon="☀️" />
          <ThemeChip mode="dark" label="Dark" icon="🌙" />
          <ThemeChip mode="system" label="Auto" icon="📱" />
        </View>
      </AnimatedCard>

      <AnimatedCard index={2} style={{ marginTop: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
            <Typography variant="h3">Biometric lock</Typography>
            <Typography variant="bodySmall" color={theme.colors.textSecondary} style={{ marginTop: 4 }}>Require authentication after 5 minutes in the background.</Typography>
          </View>
          <Switch value={biometric} onValueChange={v => { setBiometric(v); HapticEngine.selection(); void persistAllSettings(); }}
            trackColor={{ false: theme.colors.border, true: theme.raw.roseMid }} thumbColor={biometric ? theme.raw.rose : theme.raw.gray300} />
        </View>
      </AnimatedCard>

      <AnimatedCard index={3} style={{ marginTop: theme.spacing.md }}>
        <Typography variant="h3">Data</Typography>
        <AnimatedButton label="Export JSON" variant="secondary" onPress={() => void exportData()} fullWidth style={{ marginTop: theme.spacing.md }} />
        <AnimatedButton label="Delete all local data" variant="destructive" onPress={wipe} fullWidth style={{ marginTop: theme.spacing.sm }} />
      </AnimatedCard>

      <Typography variant="caption" color={theme.colors.textSecondary} style={{ textAlign: 'center', marginTop: theme.spacing.lg }}>
        Luna v{version} • Made with 💗
      </Typography>
    </AnimatedScreenScaffold>
  );
}
