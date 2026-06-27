import { useRef, useCallback, useEffect } from 'react';
import { useWheelStore } from '@/store/useWheelStore';
import { useUIStore } from '@/store/useUIStore';
import { useToastStore } from '@/store/useToastStore';
import { audioEngine } from '@/engine/audio/audioEngine';
import { animationLoop } from '@/engine/physics/animationLoop';
import { createSpinState, estimateRotations, adjustForConstraints } from '@/engine/physics/dampingModel';
import { WheelRenderer } from '@/engine/wheel/renderer';
import { add as addHistory } from '@/db/historyRepository';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { haptics } from '@/lib/haptics';
import type { SpinResult } from '@/types/engine';

// 结果展示时序（PRD 规定）：停止 → 延迟 → 扇区高亮闪烁 N 次 → 弹出结果卡片
const RESULT_REVEAL_DELAY_MS = 200; // 停止后延迟 200ms 再开始闪烁
const RESULT_FLASH_COUNT = 3; // 扇区高亮闪烁 3 次
const RESULT_FLASH_STEP_MS = 100; // 单步 100ms：100ms 关 + 100ms 开 = 200ms/次

export function useSpinEngine(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  // 拆分为独立 selector：避免订阅整个 store 导致 chargeRatio 等无关字段变化时也重渲染
  const options = useWheelStore((s) => s.options);
  const phase = useWheelStore((s) => s.phase);
  const setPhase = useWheelStore((s) => s.setPhase);
  const setResult = useWheelStore((s) => s.setResult);
  const resetSpin = useWheelStore((s) => s.resetSpin);
  const setResultOpen = useUIStore((s) => s.setResultOpen);
  const addToast = useToastStore((s) => s.addToast);
  const themeId = useSettingsStore((s) => s.themeId);
  const t = useLocaleStore((s) => s.t);
  const angleRef = useRef(0);
  // 跟踪闪烁 setTimeout 链，卸载时清理
  const flashTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const safeSetTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    flashTimeoutsRef.current.push(id);
    return id;
  }, []);

  // Save to history — 失败时提示用户，不静默吞错
  const saveToHistory = useCallback(
    (result: SpinResult) => {
      const record = {
        timestamp: Date.now(),
        options: options.map((o) => ({ ...o })),
        result: result.optionText,
        resultColor: result.optionColor,
        resultOptionId: options[result.optionIndex]?.id ?? '',
        theme: themeId,
      };
      addHistory(record).catch((err) => {
        // IndexedDB 写入失败时通知用户，避免静默丢数据
        console.warn('Failed to save history:', err);
        addToast(t('spin.historySaveFail'), 'error');
      });
    },
    [options, themeId, addToast, t],
  );

  const startSpin = useCallback(
    (chargeRatio: number) => {
      if (options.length < 2) return;
      if (phase !== 'idle' && phase !== 'charging') return;

      // Init audio (must be from user gesture)
      audioEngine.init();
      audioEngine.resume();
      audioEngine.stopCharge();

      // Create spin state
      const spinState = createSpinState(chargeRatio);
      const estimated = estimateRotations(spinState.initialOmega);
      const { targetRotations } = adjustForConstraints(estimated);

      setPhase('accelerating');
      setResult(null);
      setResultOpen(false);

      // Start animation loop
      animationLoop.start(
        spinState,
        targetRotations,
        options.length,
        {
          onAngleUpdate: (angle: number) => {
            angleRef.current = angle;
            // Direct DOM manipulation — no React state for 60fps
            if (canvasRef.current) {
              canvasRef.current.style.transform = `rotateZ(${angle}rad)`;
            }
          },
          onSectorCross: (_sectorIndex: number, speedRatio: number) => {
            audioEngine.playClick(speedRatio);
            haptics.tick();
          },
          onStop: (finalAngle: number) => {
            // 计算结果
            const sectorIndex = WheelRenderer.getSectorAtAngle(finalAngle, options.length);
            const option = options[sectorIndex];

            if (!option) {
              resetSpin();
              return;
            }

            const result: SpinResult = {
              optionIndex: sectorIndex,
              optionText: option.text,
              optionColor: option.color,
              finalAngle,
            };

            // 停止时立即设置 phase 与 result，让扇区高亮显示
            setPhase('stopped');
            setResult(result);

            // PRD 时序：停止 → 200ms 延迟 → 扇区高亮闪烁 3 次（共 600ms）→ 弹出结果卡片
            safeSetTimeout(() => {
              let flashCount = 0;
              const totalFlashes = RESULT_FLASH_COUNT;
              const flashStep = RESULT_FLASH_STEP_MS;

              const doFlash = () => {
                if (flashCount >= totalFlashes) {
                  // 闪烁结束：确保最终高亮显示，弹出结果卡片并播放音效 / 触觉反馈
                  setResult(result);
                  audioEngine.playResult();
                  haptics.success();
                  setPhase('result');
                  setResultOpen(true);
                  saveToHistory(result);
                  return;
                }

                // 关闭高亮
                setResult(null);

                safeSetTimeout(() => {
                  // 开启高亮
                  setResult(result);
                  flashCount++;
                  safeSetTimeout(doFlash, flashStep);
                }, flashStep);
              };

              doFlash();
            }, RESULT_REVEAL_DELAY_MS);
          },
        },
      );
    },
    [options, phase, setPhase, setResult, setResultOpen, resetSpin, saveToHistory, canvasRef, safeSetTimeout],
  );

  // Cleanup on unmount — 同时清理闪烁 setTimeout 链与 store 状态
  // 使用 getState() 获取最新 resetSpin 引用，避免空依赖闭包捕获过期值
  useEffect(() => {
    return () => {
      animationLoop.stop();
      audioEngine.stopCharge();
      flashTimeoutsRef.current.forEach(clearTimeout);
      flashTimeoutsRef.current = [];
      // 重置 phase/result/chargeRatio，防止组件重新挂载时残留 'accelerating' 等中间态
      useWheelStore.getState().resetSpin();
    };
  }, []);

  // Reset angle when options change and phase is idle
  useEffect(() => {
    if (phase === 'idle' && canvasRef.current) {
      angleRef.current = 0;
      canvasRef.current.style.transform = '';
    }
  }, [options, phase, canvasRef]);

  return { startSpin, phase };
}
