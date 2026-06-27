import { clamp } from '@/lib/utils';

/**
 * Web Audio engine — programmatic sound synthesis via OscillatorNode.
 * No external audio files. All sounds are generated in real-time.
 */

/** iOS Safari 旧版前缀类型声明 — 标准 AudioContext 的别名 */
type WebkitAudioContextCtor = typeof AudioContext;

interface WindowWithWebkitAudio extends Window {
  AudioContext?: WebkitAudioContextCtor;
  webkitAudioContext?: WebkitAudioContextCtor;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  // 静音状态由 useSettingsStore 单一持有并持久化到 LocalStorage（dr-audio-muted）；
  // AudioEngine 仅作为运行时消费者，通过 setMuted() 接收同步，自身不读写 LS。
  private muted = false;
  private volume = 0.6;
  private lastClickTime = 0;
  private chargeOsc: OscillatorNode | null = null;
  private chargeGain: GainNode | null = null;

  /** Initialize AudioContext (must be called from user gesture) */
  init(): void {
    if (this.ctx) return;
    try {
      const w = window as WindowWithWebkitAudio;
      const AC = w.AudioContext ?? w.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const masterGain = ctx.createGain();
      masterGain.gain.value = this.muted ? 0 : this.volume;
      masterGain.connect(ctx.destination);
      this.ctx = ctx;
      this.masterGain = masterGain;
    } catch {
      // AudioContext not supported — silent fallback
    }
  }

  /** Resume if suspended (iOS Safari requires this on user gesture) */
  resume(): void {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        muted ? 0 : this.volume,
        this.ctx.currentTime,
      );
    }
  }

  get isMuted(): boolean {
    return this.muted;
  }

  setVolume(volume: number): void {
    this.volume = clamp(volume, 0, 1);
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  get isReady(): boolean {
    return this.ctx !== null;
  }

  /**
   * Play a "click" sound — short square wave burst.
   * Frequency scales with speed ratio (lower speed = lower pitch).
   */
  playClick(speedRatio: number): void {
    if (!this.ctx || !this.masterGain || this.muted) return;

    const now = this.ctx.currentTime;
    // Throttle: minimum 30ms between clicks
    if (now - this.lastClickTime < 0.03) return;
    this.lastClickTime = now;

    const freq = clamp(800 * speedRatio, 200, 1200);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);

    // Envelope: 5ms attack, 25ms decay
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.6, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.035);

    // Cleanup to prevent memory leaks
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  /** Play result sound — C-E-G arpeggio (523/659/784 Hz) */
  playResult(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    // 捕获到局部 const，让 TS 在 forEach 闭包内自动收窄（避免 ! 非空断言）
    const ctx = this.ctx;
    const masterGain = this.masterGain;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const delay = i * 0.15;
      const now = ctx.currentTime + delay;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.25);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }

  /** Start charge sound — low frequency hum that builds up */
  startCharge(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    if (this.chargeOsc) return; // Already charging

    const now = this.ctx.currentTime;
    this.chargeOsc = this.ctx.createOscillator();
    this.chargeGain = this.ctx.createGain();

    this.chargeOsc.type = 'sine';
    this.chargeOsc.frequency.setValueAtTime(80, now);
    this.chargeOsc.frequency.linearRampToValueAtTime(120, now + 2);

    this.chargeGain.gain.setValueAtTime(0, now);
    this.chargeGain.gain.linearRampToValueAtTime(0.3, now + 2);

    this.chargeOsc.connect(this.chargeGain);
    this.chargeGain.connect(this.masterGain);

    this.chargeOsc.start(now);
  }

  /** Stop charge sound */
  stopCharge(): void {
    if (!this.ctx || !this.chargeOsc || !this.chargeGain) return;

    // 捕获到局部引用，并立即清空实例字段：
    // 1. 后续 stopCharge 调用变为 no-op（幂等）；
    // 2. startCharge 不被旧节点阻塞（onended 在 120ms 后才触发）；
    // 3. onended 闭包使用局部引用，无需可选链。
    const osc = this.chargeOsc;
    const gain = this.chargeGain;
    this.chargeOsc = null;
    this.chargeGain = null;

    const now = this.ctx.currentTime;
    try {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.stop(now + 0.12);
    } catch {
      // AudioContext 已关闭或节点失效 — 静默清理，避免抛错冒泡到调用方
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        /* 即便 disconnect 也失败，忽略 */
      }
      return;
    }

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
}

/** Singleton audio engine instance */
export const audioEngine = new AudioEngine();
