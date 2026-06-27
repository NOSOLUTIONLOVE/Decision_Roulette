import { useMemo, useRef } from 'react';
import { useWheelStore } from '@/store/useWheelStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { Option } from '@/types';

interface WheelLabelsProps {
  options: Option[];
  angle: number;
  size: number;
}

// 字号基数（针对 280px 轮盘校准），与 renderer.ts 保持一致
const TEXT_SIZE_BASE = {
  small: 12,
  medium: 16,
  large: 20,
};

/** 使用临时 canvas 测量并截断文字。 */
function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1 && ctx.measureText(truncated + '…').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}

/**
 * 轮盘文字 DOM 覆盖层。
 *
 * 文字不再画在 canvas 上，而是作为绝对定位的 span 覆盖在轮盘上方。
 * 这样文字不会随 canvas 旋转而倒立，始终保持正立可读。
 *
 * 布局策略：每个文字位于对应扇区中心线上（距圆心 62% 半径处），
 * 文字方向水平正立，不跟随扇区切向/径向旋转。
 */
export function WheelLabels({ options, angle, size }: WheelLabelsProps) {
  const textSize = useSettingsStore((s) => s.textSize);
  const result = useWheelStore((s) => s.result);
  const highlightSectorIndex = result?.optionIndex ?? null;
  const measureCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const labels = useMemo(() => {
    const n = options.length;
    if (n === 0 || n > 50) return [];

    const sectorAngle = (Math.PI * 2) / n;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 2;
    const textRadius = radius * 0.62;
    const fontSize = Math.round(TEXT_SIZE_BASE[textSize] * (size / 280));

    // 复用或创建临时 canvas 用于文字宽度测量
    let canvas = measureCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      measureCanvasRef.current = canvas;
    }
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `italic ${fontSize}px "Inter", "Noto Sans SC", sans-serif`;
    }

    // 切向布局下的可用宽度，DOM 文字水平正立时仍沿用此 cap 避免溢出
    const maxWidth = sectorAngle * textRadius * 0.85;

    return options.map((option, i) => {
      const sectorCenter = i * sectorAngle - Math.PI / 2 + angle + sectorAngle / 2;
      const x = cx + textRadius * Math.cos(sectorCenter);
      const y = cy + textRadius * Math.sin(sectorCenter);
      const text = ctx ? truncateText(ctx, option.text, maxWidth) : option.text;

      return {
        id: option.id,
        text,
        left: `${(x / size) * 100}%`,
        top: `${(y / size) * 100}%`,
        fontSize,
        isHighlighted: highlightSectorIndex === i,
      };
    });
  }, [options, angle, size, textSize, highlightSectorIndex]);

  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      {labels.map((label) => (
        <span
          key={label.id}
          className="absolute whitespace-nowrap"
          style={{
            left: label.left,
            top: label.top,
            transform: 'translate(-50%, -50%)',
            transformOrigin: 'center center',
            fontSize: `${label.fontSize}px`,
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            fontWeight: 500,
            color: label.isHighlighted ? '#ffffff' : '#FAF9F5',
            textShadow: '0 1px 2px rgba(40, 38, 27, 0.5)',
            lineHeight: 1,
          }}
        >
          {label.text}
        </span>
      ))}
    </div>
  );
}
