import type { DampingState } from './dampingModel';
import { updatePhysics, isStopped, getSpeedRatio } from './dampingModel';
import { WheelRenderer } from '@/engine/wheel/renderer';

export interface AnimationLoopCallbacks {
  onAngleUpdate: (angle: number) => void;
  onSectorCross: (sectorIndex: number, speedRatio: number) => void;
  onStop: (finalAngle: number) => void;
}

/** Manages a requestAnimationFrame loop for wheel spin animation */
export class AnimationLoop {
  private rafId: number | null = null;
  private lastTime: number = 0;
  private state: DampingState | null = null;
  private targetRotations: number = 5;
  private optionCount: number = 0;
  private lastSectorIndex: number = -1;
  private callbacks: AnimationLoopCallbacks | null = null;
  private paused: boolean = false;
  private savedState: DampingState | null = null;

  start(
    state: DampingState,
    targetRotations: number,
    optionCount: number,
    callbacks: AnimationLoopCallbacks,
  ): void {
    // 守卫：若已有 RAF 循环在运行，先取消，避免两个循环并行
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.state = state;
    // targetRotations 已在 dampingModel.adjustForConstraints 中 clamp 到 [3, 8]，
    // 此处直接使用，避免双重约束造成与调用方预期不一致
    this.targetRotations = targetRotations;
    this.optionCount = optionCount;
    this.callbacks = callbacks;
    this.lastSectorIndex = -1;
    this.lastTime = performance.now();
    this.paused = false;

    // Setup visibility change handler
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    this.tick(this.lastTime);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleVisibilityChange = (): void => {
    if (document.hidden && this.state && !this.paused) {
      this.paused = true;
      this.savedState = { ...this.state };
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    } else if (!document.hidden && this.paused && this.savedState) {
      this.paused = false;
      this.state = this.savedState;
      this.savedState = null;
      this.lastTime = performance.now();
      this.tick(this.lastTime);
    }
  };

  private tick = (now: number): void => {
    if (!this.state || !this.callbacks) return;

    // Clamp dt to prevent huge jumps (max 50ms = ~20fps min)
    const dt = Math.min(now - this.lastTime, 50);
    this.lastTime = now;

    // Update physics
    this.state = updatePhysics(this.state, dt, this.targetRotations);

    // Update DOM angle
    this.callbacks.onAngleUpdate(this.state.angle);

    // Check sector crossing for click sound
    if (this.optionCount > 0) {
      const sectorIndex = WheelRenderer.getSectorAtAngle(this.state.angle, this.optionCount);
      if (sectorIndex !== this.lastSectorIndex) {
        const speedRatio = getSpeedRatio(this.state);
        this.callbacks.onSectorCross(sectorIndex, speedRatio);
        this.lastSectorIndex = sectorIndex;
      }
    }

    // Check stop
    if (isStopped(this.state)) {
      this.callbacks.onStop(this.state.angle);
      this.stop();
      return;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };
}

/** Singleton animation loop */
export const animationLoop = new AnimationLoop();
