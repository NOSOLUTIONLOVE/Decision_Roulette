import { useState, useEffect, useRef } from 'react';

const SAMPLE_FRAMES = 10;
const FPS_THRESHOLD = 30;

/** Monitors FPS and provides a degradation flag */
export function usePerformanceMonitor(): { shouldDegrade: boolean; fps: number } {
  const [shouldDegrade, setShouldDegrade] = useState(false);
  const [fps, setFps] = useState(60);
  const framesRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const shouldDegradeRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const measure = (now: number) => {
      if (!mounted) return;

      framesRef.current.push(now);

      // Sample the first 10 frame intervals (11 frames) and decide whether to degrade.
      if (framesRef.current.length >= SAMPLE_FRAMES + 1) {
        const recent = framesRef.current.slice(0, SAMPLE_FRAMES + 1);
        const intervals = recent.slice(1).map((t, i) => t - recent[i]);
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const avgFps = 1000 / avgInterval;

        setFps(Math.round(avgFps));

        if (avgFps < FPS_THRESHOLD && !shouldDegradeRef.current) {
          shouldDegradeRef.current = true;
          setShouldDegrade(true);
        }

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
    };
  }, []);

  return { shouldDegrade, fps };
}
