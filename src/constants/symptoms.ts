export const PHYSICAL_SYMPTOMS = [
  'Cramps',
  'Bloating',
  'Headache',
  'Back pain',
  'Breast tenderness',
  'Nausea',
  'Fatigue',
  'Acne',
  'Spotting',
  'Discharge',
  'Dizziness',
  'Appetite changes',
  'Hot flashes',
  'Night sweats',
  'Joint pain',
] as const;

export const EMOTIONAL_SYMPTOMS = [
  'Anxious',
  'Irritable',
  'Mood swings',
  'Depressed',
  'Brain fog',
  'Low libido',
  'Emotional sensitivity',
  'Insomnia',
  'Difficulty concentrating',
] as const;

export const ALL_SYMPTOMS = [
  ...PHYSICAL_SYMPTOMS,
  ...EMOTIONAL_SYMPTOMS,
] as const;

export const MOOD_LABELS: Record<number, string> = {
  1: 'Very bad',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

export const MOOD_EMOJIS: Record<number, string> = {
  1: '\u{1F614}',
  2: '\u{1F615}',
  3: '\u{1F610}',
  4: '\u{1F642}',
  5: '\u{1F60A}',
};

export const FLOW_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'spotting', label: 'Spotting' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
] as const;

export type PhysicalSymptom = (typeof PHYSICAL_SYMPTOMS)[number];
export type EmotionalSymptom = (typeof EMOTIONAL_SYMPTOMS)[number];
export type Symptom = (typeof ALL_SYMPTOMS)[number];
