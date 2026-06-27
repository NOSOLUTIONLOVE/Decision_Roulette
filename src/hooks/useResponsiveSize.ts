import { useEffect, useState } from 'react';

/**
 * 响应式尺寸测量 hook — 通过 ResizeObserver 跟踪元素的 CSS 尺寸。
 *
 * 抽取自 WheelCanvas / ShareResultPage 两处完全相同的 rAF 节流 + ResizeObserver 模式。
 *
 * @param ref       要观察的元素 ref
 * @param dimension 'width'（默认，取 contentRect.width）| 'min'（取 min(width, height)，用于正方形容器）
 * @returns 测量到的像素尺寸（整数），初始为 0
 */
export function useResponsiveSize(
  ref: React.RefObject<HTMLElement | null>,
  dimension: 'width' | 'min' = 'width',
): number {
  const [size, setSize] = useState<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    let rafId = 0;
    const measure = (entries: ResizeObserverEntry[]) => {
      rafId = 0;
      const entry = entries[0];
      const w = entry?.contentRect.width ?? 0;
      const h = entry?.contentRect.height ?? 0;
      const next = Math.floor(dimension === 'min' ? Math.min(w, h) : w);
      if (next > 0) {
        setSize((prev) => (prev === next ? prev : next));
      }
    };

    const ro = new ResizeObserver((entries) => {
      if (rafId === 0) {
        rafId = requestAnimationFrame(() => measure(entries));
      }
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      if (rafId !== 0) cancelAnimationFrame(rafId);
    };
  }, [ref, dimension]);

  return size;
}
