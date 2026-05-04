import type { CyclePhase } from '../types/cycle';
import { PhaseConfig } from './theme';

export const PHASE_ORDER: CyclePhase[] = [
  'menstrual',
  'follicular',
  'ovulatory',
  'luteal',
];

export function getPhaseInfo(phase: CyclePhase) {
  return PhaseConfig[phase];
}

export { PhaseConfig };
