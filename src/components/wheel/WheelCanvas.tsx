import { useRef, useEffect, useCallback } from 'react';
import { WheelRenderer } from '@/engine/wheel/renderer';
import { useWheelStore } from '@/store/useWheelStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { getTheme } from '@/lib/themes';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import type { WheelConfig } from '@/types/engine';

interface WheelCanvasProps {
  /** Ref to expose the canvas element for external rotation control */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** 当前轮盘旋转角度（弧度），由父组件通过 CSS transform 应用 */
  angle?: number;
}

/** Mobile default — kept identical to the legacy fixed size to avoid visual regression. */
const DEFAULT_CSS_SIZE = 280;

export function WheelCanvas({ canvasRef, angle = 0 }: WheelCanvasProps) {
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
  // 正方形轮盘：取容器 min(width, height)，初始用默认值避免首次渲染空白
  const measured = useResponsiveSize(containerRef, 'min');
  const cssSize = measured > 0 ? measured : DEFAULT_CSS_SIZE;

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
      // DOM 文字覆盖层负责渲染扇区文字，canvas 只画扇区图形
      drawLabels: false,
      emptyHint: t('wheel.canvasEmptyHint'),
      singleOptionHint: t('wheel.canvasSingleHint'),
    };

    // 旋转由父组件通过 CSS transform 应用，canvas 内部用 0 绘制静态帧
    rendererRef.current.draw(options, config, 0);
    ctx.restore();
  }, [options, textSize, themeId, result, canvasRef, cssSize, t]);

  // phase 变化时需重绘：idle → charging 时 idle-spin 动画停止 + willChange 从 'transform' 变 'auto'，
  // 浏览器丢弃合成层会丢失 canvas 位图内容，若不重绘会保持空白直到下一个 dep 变化。
  useEffect(() => {
    draw();
  }, [draw, phase]);

  // 在可能涉及旋转或需要保持 canvas 位图的阶段启用 GPU 层；
  // result 阶段静止且无旋转，可以释放。特别地，charging 阶段必须保持
  // will-change: transform，否则浏览器丢弃合成层会导致 canvas 位图丢失变白。
  const isAnimating = phase !== 'result';

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
          transform: `rotateZ(${angle}rad)`,
        }}
      />
    </div>
  );
}
