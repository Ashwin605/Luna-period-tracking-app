import { useEffect, useRef } from 'react';
import { InteractionManager } from 'react-native';

import { runCyclePrediction } from '../services/prediction/cycleEngine';
import { scheduleAllReminders } from '../services/notifications/reminderScheduler';
import { useCycleStore } from '../store/cycleStore';
import { useNotificationStore } from '../store/notificationStore';
import { useSettingsStore } from '../store/settingsStore';

export function usePrediction(): void {
  const cycles = useCycleStore(s => s.cycles);
  const cycleLengthOverride = useSettingsStore(s => s.cycleLengthOverride);
  const periodLengthOverride = useSettingsStore(s => s.periodLengthOverride);
  const setPrediction = useCycleStore(s => s.setPrediction);
  const prediction = useCycleStore(s => s.prediction);
  const config = useNotificationStore(s => s.config);
  const permissionGranted = useNotificationStore(s => s.permissionGranted);
  const setScheduledCount = useNotificationStore(s => s.setScheduledCount);
  const lastScheduledFor = useRef<string | null>(null);

  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      const hasCompleted = cycles.some(c => c.cycleLength !== null);
      const next = hasCompleted
        ? runCyclePrediction(cycles)
        : runCyclePrediction(cycles, new Date(), {
            defaultCycleLength: cycleLengthOverride,
            defaultPeriodLength: periodLengthOverride,
          });
      setPrediction(next);
    });
    return () => handle.cancel();
  }, [
    cycles,
    cycleLengthOverride,
    periodLengthOverride,
    setPrediction,
  ]);

  useEffect(() => {
    if (!permissionGranted) {
      lastScheduledFor.current = null;
      return;
    }
    if (!prediction) return;
    if (lastScheduledFor.current === prediction.nextPeriodDate) return;
    lastScheduledFor.current = prediction.nextPeriodDate;
    scheduleAllReminders(prediction, config)
      .then(setScheduledCount)
      .catch(() => {
        lastScheduledFor.current = null;
      });
  }, [prediction, config, permissionGranted, setScheduledCount]);
}
