import { clamp } from '@/lib/utils';

/**
 * Web Audio engine — programmatic sound synthesis via OscillatorNode.
 * No external audio files. All sounds are generated in real-time.
 */
const MUTE_STORAGE_KEY = 'dr-audio-muted';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted: boolean;
  private volume = 0.6;
  private lastClickTime = 0;
  private chargeOsc: OscillatorNode | null = null;
  private chargeGain: GainNode | null = null;

  constructor() {
    try {
      const raw = localStorage.getItem(MUTE_STORAGE_KEY);
      this.muted = raw === 'true';
    } catch {
      this.muted = false;
    }
  }

  /** Initialize AudioContext (must be called from user gesture) */
  init(): void {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
      this.masterGain.connect(this.ctx.destination);
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
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, String(muted));
    } catch {
      // ignore
    }
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

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const delay = i * 0.15;
      const now = this.ctx!.currentTime + delay;

      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);

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

    const now = this.ctx.currentTime;
    this.chargeGain.gain.cancelScheduledValues(now);
    this.chargeGain.gain.setValueAtTime(this.chargeGain.gain.value, now);
    this.chargeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    this.chargeOsc.stop(now + 0.12);
    this.chargeOsc.onended = () => {
      this.chargeOsc?.disconnect();
      this.chargeGain?.disconnect();
      this.chargeOsc = null;
      this.chargeGain = null;
    };
  }
}

/** Singleton audio engine instance */
export const audioEngine = new AudioEngine();
