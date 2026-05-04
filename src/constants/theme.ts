import type { CyclePhase, PhaseInfo } from '../types/cycle';

export const Colors = {
  rose: '#E8637A',
  roseMid: '#F5C0C9',
  roseLight: '#FDF0F2',
  roseDark: '#993556',

  menstrual: '#E8637A',
  menstrualLight: '#FDF0F2',
  follicular: '#9FE1CB',
  follicularLight: '#E1F5EE',
  ovulatory: '#1D9E75',
  ovulatoryLight: '#E1F5EE',
  luteal: '#AFA9EC',
  lutealLight: '#EEEDFE',
  predictedPeriod: '#F5C0C9',

  white: '#FFFFFF',
  gray50: '#F9F9F8',
  gray100: '#F0EEE8',
  gray300: '#C8C6BE',
  gray500: '#888780',
  gray700: '#4A4A47',
  gray900: '#1A1A18',

  success: '#1D9E75',
  warning: '#BA7517',
  error: '#E24B4A',
  info: '#378ADD',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '400' as const, lineHeight: 14 },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 0.6,
  },
} as const;

export const PhaseConfig: Record<CyclePhase, PhaseInfo> = {
  menstrual: {
    phase: 'menstrual',
    label: 'Menstrual phase',
    color: Colors.menstrual,
    lightColor: Colors.menstrualLight,
    description: 'Your period is here. Rest and be gentle with yourself.',
    dayRange: [1, 5],
  },
  follicular: {
    phase: 'follicular',
    label: 'Follicular phase',
    color: Colors.follicular,
    lightColor: Colors.follicularLight,
    description: 'Energy rising. Good time for new projects.',
    dayRange: [6, 12],
  },
  ovulatory: {
    phase: 'ovulatory',
    label: 'Ovulatory phase',
    color: Colors.ovulatory,
    lightColor: Colors.ovulatoryLight,
    description: 'Peak energy and fertility window.',
    dayRange: [13, 16],
  },
  luteal: {
    phase: 'luteal',
    label: 'Luteal phase',
    color: Colors.luteal,
    lightColor: Colors.lutealLight,
    description: 'Wind down. PMS symptoms may appear.',
    dayRange: [17, 28],
  },
  predicted_menstrual: {
    phase: 'predicted_menstrual',
    label: 'Predicted period',
    color: Colors.predictedPeriod,
    lightColor: Colors.roseLight,
    description: 'Your period is predicted to start soon.',
    dayRange: [0, 0],
  },
};

export type ThemeShape = {
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  accent: string;
};

export const LightTheme: ThemeShape = {
  background: Colors.white,
  surface: Colors.gray50,
  surfaceElevated: Colors.white,
  textPrimary: Colors.gray900,
  textSecondary: Colors.gray500,
  border: Colors.gray100,
  accent: Colors.rose,
};

export const DarkTheme: ThemeShape = {
  background: '#0F0F0E',
  surface: '#1A1A18',
  surfaceElevated: '#252522',
  textPrimary: Colors.white,
  textSecondary: Colors.gray300,
  border: '#2E2E2A',
  accent: Colors.rose,
};
