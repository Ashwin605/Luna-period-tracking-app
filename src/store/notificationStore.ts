import { create } from 'zustand';

import {
  DEFAULT_REMINDER_CONFIG,
  type ReminderConfig,
  type ReminderTimeConfig,
} from '../types/notification';

interface NotificationState {
  config: ReminderConfig;
  permissionGranted: boolean;
  scheduledCount: number;
  hydrate: (config: ReminderConfig) => void;
  setReminder: (
    key: keyof ReminderConfig,
    value: ReminderTimeConfig
  ) => void;
  setPermissionGranted: (granted: boolean) => void;
  setScheduledCount: (count: number) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>(set => ({
  config: DEFAULT_REMINDER_CONFIG,
  permissionGranted: false,
  scheduledCount: 0,

  hydrate: config => set({ config }),

  setReminder: (key, value) =>
    set(state => ({ config: { ...state.config, [key]: value } })),

  setPermissionGranted: permissionGranted => set({ permissionGranted }),
  setScheduledCount: scheduledCount => set({ scheduledCount }),

  reset: () =>
    set({
      config: DEFAULT_REMINDER_CONFIG,
      permissionGranted: false,
      scheduledCount: 0,
    }),
}));
