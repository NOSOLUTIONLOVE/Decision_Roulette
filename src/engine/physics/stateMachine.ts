import type { SpinPhase } from '@/types/engine';

/** Valid state transitions */
const TRANSITIONS: Record<SpinPhase, SpinPhase[]> = {
  idle: ['charging', 'accelerating'],
  charging: ['accelerating', 'idle'],
  accelerating: ['decelerating'],
  decelerating: ['stopped'],
  stopped: ['result', 'idle'],
  result: ['idle'],
};

/** Check if a transition is valid */
export function canTransition(from: SpinPhase, to: SpinPhase): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/** Get the next valid phases */
export function getNextPhases(phase: SpinPhase): SpinPhase[] {
  return TRANSITIONS[phase] ?? [];
}

/** Create initial spin state */
export function createInitialState(): { phase: SpinPhase } {
  return { phase: 'idle' };
}
