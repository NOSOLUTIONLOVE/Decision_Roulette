import { useRef, useEffect, useCallback, useState } from 'react';
import { WheelRenderer } from '@/engine/wheel/renderer';
import { useWheelStore } from '@/store/useWheelStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { getTheme } from '@/lib/themes';
import type { WheelConfig } from '@/types/engine';

interface WheelCanvasProps {
  /** Ref to expose the canvas element for external rotation control */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

/** Mobile default — kept identical to the legacy fixed size to avoid visual regression. */
const DEFAULT_CSS_SIZE = 280;

export function WheelCanvas({ canvasRef }: WheelCanvasProps) {
  const options = useWheelStore((s) => s.options);
  const result = useWheelStore((s) => s.result);
  const phase = useWheelStore((s) => s.phase);
  const textSize = useSettingsStore((s) => s.textSize);
  const themeId = useSettingsStore((s) => s.themeId);
  const t = useLocaleStore((s) => s.t);
  const rendererRef = useRef<WheelRenderer | null>(null);
  // Track the size last passed to the renderer so we can rebuild it when cssSize changes.
  const renderedSizeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cssSize, setCssSize] = useState<number>(DEFAULT_CSS_SIZE);

  // Observe the wheel container and update the canvas display size responsively.
  // The wheel is square — pick min(contentWidth, contentHeight) of the padded container.
  // rAF throttling avoids redundant state updates inside high-frequency resize callbacks.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    let rafId = 0;
    const measure = (entries: ResizeObserverEntry[]) => {
      rafId = 0;
      const entry = entries[0];
      const w = entry?.contentRect.width ?? 0;
      const h = entry?.contentRect.height ?? 0;
      if (w <= 0 || h <= 0) return;
      const next = Math.floor(Math.min(w, h));
      if (next > 0) {
        setCssSize((prev) => (prev === next ? prev : next));
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
  }, []);

  // Draw wheel when options, theme, text size, or css size change
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const size = cssSize;

    // Set canvas dimensions with DPR
    if (canvas.width !== size * dpr) {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Reuse renderer instance — rebuild when size changes so geometry stays correct.
    if (!rendererRef.current || renderedSizeRef.current !== size) {
      rendererRef.current = new WheelRenderer(ctx, size);
      renderedSizeRef.current = size;
    }

    const theme = getTheme(themeId);
    const config: WheelConfig = {
      size,
      textSize,
      colors: theme.wheelColors,
      highlightSectorIndex: result ? result.optionIndex : null,
      emptyHint: t('wheel.canvasEmptyHint'),
      singleOptionHint: t('wheel.canvasSingleHint'),
    };

    rendererRef.current.draw(options, config);
    ctx.restore();
  }, [options, textSize, themeId, result, canvasRef, cssSize, t]);

  useEffect(() => {
    draw();
  }, [draw]);

  // 仅在动画阶段启用 GPU 层提升，静止时释放以节省显存
  const isAnimating = phase === 'accelerating' || phase === 'decelerating' || phase === 'idle';

  // 主题切换后重绘：使用双层 rAF 确保下一帧 CSS 变量已生效，替代原 setTimeout hack
  useEffect(() => {
    let innerId = 0;
    const outerId = requestAnimationFrame(() => {
      innerId = requestAnimationFrame(draw);
    });
    return () => {
      cancelAnimationFrame(outerId);
      cancelAnimationFrame(innerId);
    };
  }, [themeId, draw]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center p-[2px]"
    >
      <canvas
        ref={canvasRef}
        className="wheel-canvas block rounded-full"
        style={{
          willChange: isAnimating ? 'transform' : 'auto',
          transformOrigin: 'center center',
        }}
      />
    </div>
  );
}
