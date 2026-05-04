/**
 * Centralized haptic feedback engine for Luna.
 * Provides contextual haptic patterns for different interactions.
 */
import * as Haptics from 'expo-haptics';

export const HapticEngine = {
  /** Light tap — chip/toggle selection, day cell press */
  selection: () => Haptics.selectionAsync(),

  /** Medium impact — button press, card press */
  impact: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

  /** Light impact — subtle feedback for scroll or swipe */
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  /** Heavy impact — destructive actions, period start */
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),

  /** Success — save completed, log saved */
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

  /** Warning — validation error, incomplete form */
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

  /** Error — delete confirmation, critical error */
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

  /** Tab switch — quick selection tap */
  tabSwitch: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  /** Slider tick — each step on a slider */
  tick: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  /** Onboarding step advance */
  stepAdvance: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
} as const;
