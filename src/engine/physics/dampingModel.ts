import { clamp, randomBetween } from '@/lib/utils';

const TWO_PI = Math.PI * 2;
const STOP_THRESHOLD = 0.05; // rad/s
const BASE_FRICTION = 0.985; // per frame at 60fps
const FRAME_TIME = 16.67; // ms, normalized to 60fps

// 转盘物理参数 — 集中管理便于调参
const MIN_BASE_OMEGA = 8; // rad/s，无蓄力时的最低初始角速度
const MAX_BASE_OMEGA = 15; // rad/s，无蓄力时的最高初始角速度
const CHARGE_BONUS_RATIO = 0.5; // 蓄力满时额外 +50% 角速度
const MIN_ROTATIONS = 3; // 最少转 3 圈，保证体感「真的转了」
const MAX_ROTATIONS = 8; // 最多转 8 圈，避免转太久让用户等待

export interface DampingState {
  omega: number;
  angle: number;
  initialOmega: number;
  rotationsDone: number;
  totalAngle: number;
}

/** Create initial spin state with random velocity + charge bonus */
export function createSpinState(chargeRatio: number): DampingState {
  const baseOmega = randomBetween(MIN_BASE_OMEGA, MAX_BASE_OMEGA);
  const chargeBonus = 1 + chargeRatio * CHARGE_BONUS_RATIO;
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

/**
 * Update the physics state by one frame.
 *
 * 原地更新传入的 state 对象以避免每帧分配新对象造成的 GC 压力
 * （60fps × 数秒 = 数百次分配）。调用方仍可使用返回值，但其底层与入参同引用。
 */
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
  state.angle = state.angle + deltaAngle;
  state.totalAngle = state.totalAngle + Math.abs(deltaAngle);

  // Count rotations
  state.rotationsDone = state.totalAngle / TWO_PI;

  // Check stop
  state.omega = newOmega < STOP_THRESHOLD ? 0 : newOmega;

  return state;
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
  const adjusted = clamp(targetRotations, MIN_ROTATIONS, MAX_ROTATIONS);
  return { targetRotations: adjusted, needsBoost: adjusted !== targetRotations };
}
