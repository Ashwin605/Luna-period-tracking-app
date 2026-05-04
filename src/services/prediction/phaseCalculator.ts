import type { CyclePhase, PhaseInfo } from '../../types/cycle';
import { PhaseConfig } from '../../constants/theme';

export function getPhaseDescriptor(phase: CyclePhase): PhaseInfo {
  return PhaseConfig[phase];
}

export function describePhase(phase: CyclePhase): string {
  return PhaseConfig[phase].description;
}

export function colorForPhase(phase: CyclePhase): string {
  return PhaseConfig[phase].color;
}

export function lightColorForPhase(phase: CyclePhase): string {
  return PhaseConfig[phase].lightColor;
}
