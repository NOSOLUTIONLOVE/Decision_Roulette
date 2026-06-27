import { useState, useRef, useCallback, useEffect, type RefObject } from 'react';
import { audioEngine } from '@/engine/audio/audioEngine';
import { useWheelStore } from '@/store/useWheelStore';
import { haptics } from '@/lib/haptics';

const LONG_PRESS_MS = 200;
const MAX_CHARGE_MS = 2000;
const CHARGE_RAMP_MS = MAX_CHARGE_MS - LONG_PRESS_MS;

/** useCharging 需要直接操作的 DOM 元素 ref */
export interface ChargingRefs {
  buttonRef: RefObject<HTMLButtonElement | null>;
  progressRef: RefObject<HTMLSpanElement | null>;
  /** 可选：蓄力百分比文本节点，由 RAF 直接更新以避免 React 重渲染 */
  percentRef?: RefObject<HTMLSpanElement | null>;
}

/** 管理蓄力交互（按住 >200ms 进入蓄力，0-50% 速度加成） */
export function useCharging(
  onRelease: (chargeRatio: number) => void,
  refs: ChargingRefs,
) {
  // charging 仅在长按触发后切换，保留 React state 用于条件渲染
  const [charging, setCharging] = useState(false);
  const chargingRef = useRef(false);
  // 高频变化的蓄力比例改用 ref 存储，避免每帧触发 React 重渲染
  const chargeRatioRef = useRef(0);
  const startTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasReleasedRef = useRef(false);

  useEffect(() => {
    chargingRef.current = charging;
  }, [charging]);
  const phase = useWheelStore((s) => s.phase);
  const setPhase = useWheelStore((s) => s.setPhase);

  // 直接通过 DOM 更新进度条宽度、按钮发光与百分比文本，绕过 React state
  const applyChargeToDOM = useCallback((ratio: number) => {
    const button = refs.buttonRef.current;
    const progress = refs.progressRef.current;
    const percent = refs.percentRef?.current;

    if (progress) {
      progress.style.width = `${ratio * 100}%`;
    }
    if (button) {
      button.style.boxShadow = `0 0 ${8 + ratio * 16}px rgba(201, 100, 66, ${0.35 - ratio * 0.15}), 0 2px 8px rgba(201, 100, 66, 0.3)`;
    }
    if (percent) {
      percent.textContent = `${Math.round(ratio * 100)}%`;
    }
  }, [refs.buttonRef, refs.progressRef, refs.percentRef]);

  const resetDOM = useCallback(() => {
    const button = refs.buttonRef.current;
    const progress = refs.progressRef.current;
    const percent = refs.percentRef?.current;

    if (progress) progress.style.width = '0%';
    if (button) button.style.boxShadow = '';
    if (percent) percent.textContent = '0%';
  }, [refs.buttonRef, refs.progressRef, refs.percentRef]);

  const computeChargeRatio = useCallback((elapsedMs: number): number => {
    if (elapsedMs <= LONG_PRESS_MS) return 0;
    return Math.min((elapsedMs - LONG_PRESS_MS) / CHARGE_RAMP_MS, 1);
  }, []);

  const updateCharge = useCallback(() => {
    const elapsed = performance.now() - startTimeRef.current;
    const ratio = computeChargeRatio(elapsed);
    chargeRatioRef.current = ratio;
    applyChargeToDOM(ratio);

    if (ratio < 1) {
      rafRef.current = requestAnimationFrame(updateCharge);
    }
  }, [applyChargeToDOM, computeChargeRatio]);

  const beginLongPress = useCallback(() => {
    timeoutRef.current = null;
    setCharging(true);
    setPhase('charging');
    applyChargeToDOM(0);

    audioEngine.init();
    audioEngine.resume();
    audioEngine.startCharge();
    haptics.light();

    rafRef.current = requestAnimationFrame(updateCharge);
  }, [setPhase, applyChargeToDOM, updateCharge]);

  const start = useCallback(() => {
    if (phase !== 'idle') return;

    hasReleasedRef.current = false;
    startTimeRef.current = performance.now();
    chargeRatioRef.current = 0;

    // 200ms 内松开视为短按，不进入蓄力状态
    timeoutRef.current = setTimeout(beginLongPress, LONG_PRESS_MS);
  }, [phase, beginLongPress]);

  const end = useCallback(() => {
    if (hasReleasedRef.current) return;
    hasReleasedRef.current = true;

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const elapsed = performance.now() - startTimeRef.current;
    const ratio = computeChargeRatio(elapsed);
    chargeRatioRef.current = ratio;

    audioEngine.stopCharge();

    if (chargingRef.current) {
      setCharging(false);
      // 长按蓄力松开，根据蓄力时间返回 0-50% 加成
      onRelease(ratio);
    } else {
      // 短按（未触发长按）直接启动，无加成
      onRelease(0);
    }
  }, [onRelease, computeChargeRatio]);

  // 卸载时清理
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      audioEngine.stopCharge();
      resetDOM();
    };
  }, [resetDOM]);

  // 兜底：pointerup 发生在按钮外部
  useEffect(() => {
    if (phase !== 'charging') return;

    const handlePointerUp = () => end();
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [phase, end]);

  return { charging, start, end };
}
