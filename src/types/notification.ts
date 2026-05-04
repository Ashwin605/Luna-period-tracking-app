export interface ReminderTimeConfig {
  enabled: boolean;
  hour: number;
  minute: number;
}

export interface ReminderConfig {
  periodForecast: ReminderTimeConfig;
  ovulationAlert: ReminderTimeConfig;
  pillReminder: ReminderTimeConfig;
  symptomLog: ReminderTimeConfig;
}

export const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  periodForecast: { enabled: true, hour: 8, minute: 0 },
  ovulationAlert: { enabled: true, hour: 9, minute: 0 },
  pillReminder: { enabled: false, hour: 21, minute: 0 },
  symptomLog: { enabled: true, hour: 20, minute: 30 },
};

export type NotificationType =
  | 'period_forecast'
  | 'ovulation_alert'
  | 'pill_reminder'
  | 'symptom_log'
  | 'period_day_check';

export interface NotificationPayload {
  type: NotificationType;
  [key: string]: unknown;
}
