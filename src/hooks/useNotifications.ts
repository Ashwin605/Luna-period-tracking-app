import { useCallback, useEffect } from 'react';

import {
  ensureChannels,
  getPermissionStatus,
  getScheduledNotifications,
  registerForPushNotifications,
  requestPermission,
} from '../services/notifications/notificationService';
import { scheduleAllReminders } from '../services/notifications/reminderScheduler';
import { useCycleStore } from '../store/cycleStore';
import { useNotificationStore } from '../store/notificationStore';

export function useNotifications() {
  const config = useNotificationStore(s => s.config);
  const setPermissionGranted = useNotificationStore(s => s.setPermissionGranted);
  const setScheduledCount = useNotificationStore(s => s.setScheduledCount);
  const permissionGranted = useNotificationStore(s => s.permissionGranted);
  const prediction = useCycleStore(s => s.prediction);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensureChannels();
      const status = await getPermissionStatus();
      if (!cancelled) setPermissionGranted(status === 'granted');

      const scheduled = await getScheduledNotifications();
      if (!cancelled) setScheduledCount(scheduled.length);
    })();
    return () => {
      cancelled = true;
    };
  }, [setPermissionGranted, setScheduledCount]);

  const requestAccess = useCallback(async () => {
    const status = await requestPermission();
    setPermissionGranted(status === 'granted');
    return status === 'granted';
  }, [setPermissionGranted]);

  const register = useCallback(async () => {
    const token = await registerForPushNotifications();
    setPermissionGranted(token !== null);
    return token;
  }, [setPermissionGranted]);

  const reschedule = useCallback(async () => {
    if (!prediction) return 0;
    const count = await scheduleAllReminders(prediction, config);
    setScheduledCount(count);
    return count;
  }, [prediction, config, setScheduledCount]);

  return { permissionGranted, requestAccess, register, reschedule };
}
