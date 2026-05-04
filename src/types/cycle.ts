export type CyclePhase =
  | 'menstrual'
  | 'follicular'
  | 'ovulatory'
  | 'luteal'
  | 'predicted_menstrual';

export interface CycleEntry {
  id: string;
  startDate: string;
  endDate: string | null;
  periodLength: number;
  cycleLength: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type MoodScore = 1 | 2 | 3 | 4 | 5;
export type EnergyScore = 1 | 2 | 3 | 4 | 5;

export interface DailyLog {
  id: string;
  date: string;
  cycleId: string | null;
  mood: MoodScore;
  flow: FlowLevel;
  symptoms: string[];
  energyLevel: EnergyScore;
  notes: string | null;
  createdAt: string;
}

export interface PredictionResult {
  nextPeriodDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  ovulationDate: string;
  currentPhase: CyclePhase;
  currentCycleDay: number;
  averageCycleLength: number;
  confidence: number;
}

export interface PhaseInfo {
  phase: CyclePhase;
  label: string;
  color: string;
  lightColor: string;
  description: string;
  dayRange: [number, number];
}
