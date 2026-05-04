import { create } from 'zustand';

import { DEFAULT_USER_SETTINGS, type UserSettings } from '../types/settings';

interface SettingsState extends UserSettings {
  hydrate: (settings: Partial<UserSettings>) => void;
  setCycleLengthOverride: (value: number | null) => void;
  setPeriodLengthOverride: (value: number | null) => void;
  setBiometricLockEnabled: (value: boolean) => void;
  setThemeMode: (mode: UserSettings['themeMode']) => void;
  setOnboardingComplete: (value: boolean) => void;
  setLastBackgroundedAt: (ts: number | null) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>(set => ({
  ...DEFAULT_USER_SETTINGS,

  hydrate: settings => set(state => ({ ...state, ...settings })),

  setCycleLengthOverride: cycleLengthOverride => set({ cycleLengthOverride }),
  setPeriodLengthOverride: periodLengthOverride => set({ periodLengthOverride }),
  setBiometricLockEnabled: biometricLockEnabled => set({ biometricLockEnabled }),
  setThemeMode: themeMode => set({ themeMode }),
  setOnboardingComplete: onboardingComplete => set({ onboardingComplete }),
  setLastBackgroundedAt: lastBackgroundedAt => set({ lastBackgroundedAt }),

  reset: () => set({ ...DEFAULT_USER_SETTINGS }),
}));
