import * as Notifications from 'expo-notifications';
import { isBefore, parseISO, setHours, setMinutes, subDays } from 'date-fns';

import type { PredictionResult } from '../../types/cycle';
import type { ReminderConfig } from '../../types/notification';
import { NOTIFICATION_IDS } from './notificationTypes';

export async function scheduleAllReminders(
  prediction: PredictionResult,
  config: ReminderConfig
): Promise<number> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();

  if (config.periodForecast.enabled) {
    const nextPeriod = parseISO(prediction.nextPeriodDate);
    const forecastDate = subDays(nextPeriod, 3);
    const triggerDate = setMinutes(
      setHours(forecastDate, config.periodForecast.hour),
      config.periodForecast.minute
    );

    if (!isBefore(triggerDate, now)) {
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.periodForecast,
        content: {
          title: 'Your period is coming soon',
          body:
            'Luna predicts your period starts in 3 days. Stock up and be prepared.',
          data: { type: 'period_forecast' },
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          date: triggerDate,
          channelId: 'luna-period-alert',
        },
      });
    }
  }

  if (config.ovulationAlert.enabled) {
    const fertileStart = parseISO(prediction.fertileWindowStart);
    const ovulationTrigger = setMinutes(
      setHours(fertileStart, config.ovulationAlert.hour),
      config.ovulationAlert.minute
    );

    if (!isBefore(ovulationTrigger, now)) {
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.ovulationAlert,
        content: {
          title: 'Fertile window is open',
          body: `Your estimated fertile window has started. Ovulation expected around ${prediction.ovulationDate}.`,
          data: { type: 'ovulation_alert' },
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: ovulationTrigger,
          channelId: 'luna-reminders',
        },
      });
    }
  }

  if (config.pillReminder.enabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDS.pillReminder,
      content: {
        title: 'Medication reminder',
        body: 'Time to take your pill.',
        data: { type: 'pill_reminder' },
      },
      trigger: {
        hour: config.pillReminder.hour,
        minute: config.pillReminder.minute,
        repeats: true,
        channelId: 'luna-reminders',
      },
    });
  }

  if (config.symptomLog.enabled) {
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDS.symptomLog,
      content: {
        title: 'How was your day?',
        body: 'Take 30 seconds to log your symptoms and mood.',
        data: { type: 'symptom_log' },
      },
      trigger: {
        hour: config.symptomLog.hour,
        minute: config.symptomLog.minute,
        repeats: true,
        channelId: 'luna-reminders',
      },
    });
  }

  if (config.periodForecast.enabled) {
    const nextPeriod = parseISO(prediction.nextPeriodDate);
    const dayOfTrigger = setMinutes(setHours(nextPeriod, 9), 0);

    if (!isBefore(dayOfTrigger, now)) {
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.periodDayCheck,
        content: {
          title: 'Period day - did it start?',
          body: 'Luna predicted your period today. Tap to log and keep your predictions accurate.',
          data: { type: 'period_day_check' },
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: dayOfTrigger,
          channelId: 'luna-period-alert',
        },
      });
    }
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.length;
}
