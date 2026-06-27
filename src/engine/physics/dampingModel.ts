import { clamp, randomBetween } from '@/lib/utils';

const TWO_PI = Math.PI * 2;
const STOP_THRESHOLD = 0.05; // rad/s
const BASE_FRICTION = 0.985; // per frame at 60fps
const FRAME_TIME = 16.67; // ms, normalized to 60fps

export interface DampingState {
  omega: number;
  angle: number;
  initialOmega: number;
  rotationsDone: number;
  totalAngle: number;
}

/** Create initial spin state with random velocity + charge bonus */
export function createSpinState(chargeRatio: number): DampingState {
  const baseOmega = randomBetween(8, 15); // rad/s
  const chargeBonus = 1 + chargeRatio * 0.5; // up to +50%
  const initialOmega = baseOmega * chargeBonus;

  return {
    omega: initialOmega,
    angle: 0,
    initialOmega,
    rotationsDone: 0,
    totalAngle: 0,
  };
}

/** Friction is kept constant so the spin reliably lasts 3-8 seconds. */
function computeFriction(_state: DampingState, _targetRotations: number): number {
  return BASE_FRICTION;
}

/** Update the physics state by one frame */
export function updatePhysics(
  state: DampingState,
  dt: number,
  targetRotations: number,
): DampingState {
  // Normalize dt to 60fps equivalent
  const dtFrames = dt / FRAME_TIME;

  // Apply friction
  const friction = computeFriction(state, targetRotations);
  const newOmega = state.omega * Math.pow(friction, dtFrames);

  // Update angle (convert to per-frame movement)
  // omega is in rad/s, dt is in ms
  const deltaAngle = newOmega * (dt / 1000);
  const newAngle = state.angle + deltaAngle;
  const newTotalAngle = state.totalAngle + Math.abs(deltaAngle);

  // Count rotations
  const newRotations = newTotalAngle / TWO_PI;

  // Check stop
  const finalOmega = newOmega < STOP_THRESHOLD ? 0 : newOmega;

  return {
    omega: finalOmega,
    angle: newAngle,
    initialOmega: state.initialOmega,
    rotationsDone: newRotations,
    totalAngle: newTotalAngle,
  };
}

/** Check if the wheel has stopped */
export function isStopped(state: DampingState): boolean {
  return state.omega <= STOP_THRESHOLD || state.omega === 0;
}

/** Get the speed ratio (0-1) for audio pitch */
export function getSpeedRatio(state: DampingState): number {
  if (state.initialOmega === 0) return 0;
  return clamp(state.omega / state.initialOmega, 0, 1);
}

/** Estimate total rotations for a given initial omega */
export function estimateRotations(initialOmega: number): number {
  // Rough estimate: integral of exponential decay
  // Total angle ≈ initialOmega / (1 - friction) * frameTime
  const totalAngle = initialOmega / (1 - BASE_FRICTION) * FRAME_TIME / 1000;
  return totalAngle / TWO_PI;
}

/** Ensure spin meets minimum rotation and time constraints */
export function adjustForConstraints(
  targetRotations: number,
): { targetRotations: number; needsBoost: boolean } {
  // Min 3 rotations, max 8
  const adjusted = clamp(targetRotations, 3, 8);
  return { targetRotations: adjusted, needsBoost: adjusted !== targetRotations };
}
