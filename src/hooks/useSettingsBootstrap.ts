import { useEffect, useState } from 'react';

import {
  getSetting,
  setSetting,
} from '../services/database/settingsRepository';
import { useNotificationStore } from '../store/notificationStore';
import { useSettingsStore } from '../store/settingsStore';
import {
  DEFAULT_REMINDER_CONFIG,
  type ReminderConfig,
} from '../types/notification';
import { DEFAULT_USER_SETTINGS, type UserSettings } from '../types/settings';

const SETTINGS_KEY = 'user_settings';
const REMINDERS_KEY = 'reminder_config';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

export function useSettingsBootstrap(): { ready: boolean } {
  const [ready, setReady] = useState(false);
  const hydrateSettings = useSettingsStore(s => s.hydrate);
  const hydrateReminders = useNotificationStore(s => s.hydrate);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [rawSettings, rawReminders] = await Promise.all([
        getSetting(SETTINGS_KEY),
        getSetting(REMINDERS_KEY),
      ]);

      if (cancelled) return;

      hydrateSettings(safeParse<UserSettings>(rawSettings, DEFAULT_USER_SETTINGS));
      hydrateReminders(
        safeParse<ReminderConfig>(rawReminders, DEFAULT_REMINDER_CONFIG)
      );
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateSettings, hydrateReminders]);

  return { ready };
}

export async function persistUserSettings(value: UserSettings): Promise<void> {
  await setSetting(SETTINGS_KEY, JSON.stringify(value));
}

export async function persistReminderConfig(value: ReminderConfig): Promise<void> {
  await setSetting(REMINDERS_KEY, JSON.stringify(value));
}
