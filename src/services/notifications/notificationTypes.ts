import type { NotificationType } from '../../types/notification';

export const NOTIFICATION_IDS = {
  periodForecast: 'period-forecast',
  ovulationAlert: 'ovulation-alert',
  pillReminder: 'pill-reminder',
  symptomLog: 'symptom-log',
  periodDayCheck: 'period-day',
} as const;

export type NotificationId = (typeof NOTIFICATION_IDS)[keyof typeof NOTIFICATION_IDS];

export interface TypedNotificationContent {
  title: string;
  body: string;
  data: { type: NotificationType };
}
