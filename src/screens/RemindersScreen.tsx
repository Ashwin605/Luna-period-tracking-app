import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Switch, View } from 'react-native';

import { AnimatedButton } from '../components/shared/AnimatedButton';
import { AnimatedCard } from '../components/shared/AnimatedCard';
import { AnimatedScreenScaffold } from '../components/shared/AnimatedScreenScaffold';
import { Typography } from '../components/shared/Typography';
import { useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';
import { persistReminderConfig } from '../hooks/useSettingsBootstrap';
import { fireTestNotification, getScheduledNotifications } from '../services/notifications/notificationService';
import { scheduleAllReminders } from '../services/notifications/reminderScheduler';
import { useCycleStore } from '../store/cycleStore';
import { useNotificationStore } from '../store/notificationStore';
import type { ReminderConfig, ReminderTimeConfig } from '../types/notification';
import { HapticEngine } from '../utils/haptics';

function timeFromParts(hour: number, minute: number): Date {
  const d = new Date(); d.setHours(hour, minute, 0, 0); return d;
}

export function RemindersScreen() {
  const theme = useTheme();
  const prediction = useCycleStore(s => s.prediction);
  const config = useNotificationStore(s => s.config);
  const setReminder = useNotificationStore(s => s.setReminder);
  const permissionGranted = useNotificationStore(s => s.permissionGranted);
  const scheduledCount = useNotificationStore(s => s.scheduledCount);
  const setScheduledCount = useNotificationStore(s => s.setScheduledCount);
  const { requestAccess } = useNotifications();
  const [pickerFor, setPickerFor] = useState<keyof ReminderConfig | null>(null);
  const [pickerValue, setPickerValue] = useState(new Date());

  const refreshCount = useCallback(async () => {
    const all = await getScheduledNotifications(); setScheduledCount(all.length);
  }, [setScheduledCount]);

  useEffect(() => { void refreshCount(); }, [refreshCount, config]);

  const applyConfig = async (next: ReminderConfig) => {
    await persistReminderConfig(next);
    if (prediction && permissionGranted) { const n = await scheduleAllReminders(prediction, next); setScheduledCount(n); }
  };

  const updateReminder = async (key: keyof ReminderConfig, patch: Partial<ReminderTimeConfig>) => {
    const current = useNotificationStore.getState().config;
    const next = { ...current[key], ...patch }; setReminder(key, next);
    const merged: ReminderConfig = { ...current, [key]: next }; await applyConfig(merged);
    HapticEngine.selection();
  };

  const openPicker = (key: keyof ReminderConfig) => {
    const c = config[key]; setPickerValue(timeFromParts(c.hour, c.minute)); setPickerFor(key);
  };

  const onPickerChange = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') setPickerFor(null);
    if (!date || !pickerFor) return;
    void updateReminder(pickerFor, { hour: date.getHours(), minute: date.getMinutes() });
  };

  const ICONS: Record<string, string> = { periodForecast: '🩸', ovulationAlert: '🥚', pillReminder: '💊', symptomLog: '📝' };

  const rows: Array<{ key: keyof ReminderConfig; title: string; subtitle: string }> = [
    { key: 'periodForecast', title: 'Period forecast', subtitle: '3 days before your next predicted period' },
    { key: 'ovulationAlert', title: 'Ovulation', subtitle: 'When your fertile window opens' },
    { key: 'pillReminder', title: 'Pill reminder', subtitle: 'Daily medication reminder' },
    { key: 'symptomLog', title: 'Evening log', subtitle: 'Gentle nudge to log symptoms' },
  ];

  return (
    <AnimatedScreenScaffold title="Reminders" subtitle="Smart alerts based on your predictions">
      {!permissionGranted ? (
        <AnimatedCard index={0} style={{ marginBottom: theme.spacing.md }} glowColor={theme.raw.warning}>
          <Typography variant="body">Notification permission is off. Enable it to receive reminders.</Typography>
          <AnimatedButton label="Enable notifications" onPress={() => void requestAccess()} fullWidth style={{ marginTop: theme.spacing.md }} />
        </AnimatedCard>
      ) : null}

      {rows.map((row, idx) => {
        const c = config[row.key];
        const timeLabel = `${String(c.hour).padStart(2, '0')}:${String(c.minute).padStart(2, '0')}`;
        return (
          <AnimatedCard key={row.key} index={idx + 1} style={{ marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: theme.spacing.md }}>
                <Typography variant="h2" style={{ marginRight: 10 }}>{ICONS[row.key]}</Typography>
                <View style={{ flex: 1 }}>
                  <Typography variant="h3">{row.title}</Typography>
                  <Typography variant="bodySmall" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>{row.subtitle}</Typography>
                </View>
              </View>
              <Switch value={c.enabled} onValueChange={v => void updateReminder(row.key, { enabled: v })}
                trackColor={{ false: theme.colors.border, true: theme.raw.roseMid }} thumbColor={c.enabled ? theme.raw.rose : theme.raw.gray300} />
            </View>
            <AnimatedButton label={`Time: ${timeLabel}`} variant="secondary" onPress={() => openPicker(row.key)} fullWidth style={{ marginTop: theme.spacing.md }} disabled={!c.enabled} />
          </AnimatedCard>
        );
      })}

      {pickerFor ? <DateTimePicker value={pickerValue} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onPickerChange} /> : null}

      <View style={{ alignItems: 'center', marginTop: theme.spacing.md, padding: theme.spacing.md, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surface }}>
        <Typography variant="label" color={theme.colors.textSecondary}>ACTIVE NOTIFICATIONS</Typography>
        <Typography variant="h2" style={{ marginTop: 4 }}>{scheduledCount}</Typography>
      </View>

      <AnimatedButton label="Send test notification" variant="ghost" onPress={() => { HapticEngine.light(); void fireTestNotification(); }} fullWidth style={{ marginTop: theme.spacing.lg }} />
    </AnimatedScreenScaffold>
  );
}
