import { useState, useEffect, useRef } from 'react';

const SAMPLE_FRAMES = 10;
const FPS_THRESHOLD = 30;
// 原实现仅在挂载时采样前 10 帧，无法捕获运行中（如转动 + 粒子爆发）的帧率退化。
// 改为周期性重采样：每轮采样完成后等待 RESAMPLE_INTERVAL_MS 再开启下一轮。
const RESAMPLE_INTERVAL_MS = 5000;

/** Monitors FPS and provides a degradation flag */
export function usePerformanceMonitor(): { shouldDegrade: boolean; fps: number } {
  const [shouldDegrade, setShouldDegrade] = useState(false);
  const [fps, setFps] = useState(60);
  const framesRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const shouldDegradeRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    let resampleTimer: ReturnType<typeof setTimeout> | null = null;

    const measure = (now: number) => {
      if (!mounted) return;

      framesRef.current.push(now);

      // Sample 10 frame intervals (11 frames) and decide whether to degrade.
      if (framesRef.current.length >= SAMPLE_FRAMES + 1) {
        const recent = framesRef.current.slice(0, SAMPLE_FRAMES + 1);
        const intervals = recent.slice(1).map((t, i) => t - (recent[i] ?? 0));
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const avgFps = 1000 / avgInterval;

        setFps(Math.round(avgFps));

        if (avgFps < FPS_THRESHOLD && !shouldDegradeRef.current) {
          shouldDegradeRef.current = true;
          setShouldDegrade(true);
        }

        // 本轮采样结束：清空帧缓冲，等待下一轮重采样
        framesRef.current = [];
        rafRef.current = null;
        resampleTimer = setTimeout(() => {
          if (!mounted) return;
          rafRef.current = requestAnimationFrame(measure);
        }, RESAMPLE_INTERVAL_MS);
        return;
      }

      rafRef.current = requestAnimationFrame(measure);
    };

    rafRef.current = requestAnimationFrame(measure);

    return () => {
      mounted = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (resampleTimer !== null) {
        clearTimeout(resampleTimer);
      }
    };
  }, []);

  return { shouldDegrade, fps };
}
