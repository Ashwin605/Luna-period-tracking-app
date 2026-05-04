export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserSettings {
  cycleLengthOverride: number | null;
  periodLengthOverride: number | null;
  biometricLockEnabled: boolean;
  themeMode: ThemeMode;
  onboardingComplete: boolean;
  lastBackgroundedAt: number | null;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  cycleLengthOverride: null,
  periodLengthOverride: null,
  biometricLockEnabled: false,
  themeMode: 'system',
  onboardingComplete: false,
  lastBackgroundedAt: null,
};
