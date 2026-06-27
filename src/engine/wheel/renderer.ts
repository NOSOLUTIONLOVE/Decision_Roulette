import type { Option } from '@/types';
import type { WheelConfig } from '@/types/engine';
import { resolveColor } from './colorPalette';

// 字号基数（针对 280px 轮盘校准），渲染时按实际 canvas 尺寸缩放
const TEXT_SIZE_BASE = {
  small: 12,
  medium: 16,
  large: 20,
};

/** Wheel renderer — draws sectors and text onto a canvas (called once on option/theme change) */
export class WheelRenderer {
  private ctx: CanvasRenderingContext2D;
  private size: number;

  constructor(ctx: CanvasRenderingContext2D, size: number) {
    this.ctx = ctx;
    this.size = size;
  }

  /** Draw the full wheel with given options and config */
  draw(options: Option[], config: WheelConfig, angle: number = 0): void {
    const ctx = this.ctx;
    const size = this.size;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 2;

    ctx.clearRect(0, 0, size, size);

    if (options.length === 0) {
      // Empty state: dashed circle + hint text
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(155, 152, 140, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(110, 109, 104, 0.5)';
      ctx.font = 'italic 13px "Inter", "Noto Sans SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (config.emptyHint) {
        ctx.fillText(config.emptyHint, cx, cy);
      }
      ctx.restore();
      return;
    }

    if (options.length === 1) {
      // Single option: draw sector + hint text
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = resolveColor(options[0]!.color);
      ctx.globalAlpha = 0.4;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#FAF9F5';
      ctx.font = 'italic 13px "Inter", "Noto Sans SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(40, 38, 27, 0.5)';
      ctx.shadowBlur = 2;
      if (config.singleOptionHint) {
        ctx.fillText(config.singleOptionHint, cx, cy);
      }
      ctx.restore();
      return;
    }

    const n = options.length;
    const sectorAngle = (Math.PI * 2) / n;
    // 字号按 canvas 尺寸缩放：280px 轮盘用基数，更大轮盘等比放大
    const fontSize = Math.round(TEXT_SIZE_BASE[config.textSize] * (size / 280));

    // Draw each sector
    options.forEach((option, i) => {
      const startAngle = i * sectorAngle - Math.PI / 2 + angle;
      const endAngle = startAngle + sectorAngle;
      const color = resolveColor(option.color);

      // Fill sector
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Highlight winner sector
      if (config.highlightSectorIndex === i) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fill();
      }

      // Sector divider
      ctx.strokeStyle = 'rgba(40, 38, 27, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw text — 切向 T 形布局：文字垂直于半径方向（切线方向）排列，
    // 从文字中点出发的垂线穿过圆心，形成 T 字形。
    // 下半圆文字翻转 180° 保持正立可读。
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    options.forEach((option, i) => {
      const sectorCenter = i * sectorAngle - Math.PI / 2 + angle + sectorAngle / 2;

      // Skip text if sector too small (< 7.2 degrees = 50 options)
      if (sectorAngle < (Math.PI * 2) / 50) return;

      ctx.save();
      ctx.translate(cx, cy);

      // Normalize angle to [0, 2PI) for bottom-half detection
      const normAngle = ((sectorCenter % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      // 下半圆（PI/2 ~ 3PI/2）文字需要翻转 180° 才能保持正立可读
      const isBottomHalf = normAngle > Math.PI / 2 && normAngle < (3 * Math.PI) / 2;

      // 自适应字号：扇区越多字号越小，上限为基准字号
      const adjFontSize = Math.min(fontSize, sectorAngle * radius * 0.7);
      const textRadius = radius * 0.62;
      const maxWidth = sectorAngle * textRadius * 0.85;
      const text = this.truncateText(option.text, maxWidth, adjFontSize);

      ctx.font = `italic ${adjFontSize}px "Inter", "Noto Sans SC", sans-serif`;
      ctx.fillStyle = '#FAF9F5';
      ctx.shadowColor = 'rgba(40, 38, 27, 0.5)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetY = 1;

      if (isBottomHalf) {
        // 下半圆：旋转 sectorCenter + 3PI/2 使文字切向正立，
        // 在正 textRadius 处绘制（翻转后正方向 = 指向扇区中心）
        ctx.rotate(sectorCenter + (3 * Math.PI) / 2);
        ctx.fillText(text, 0, textRadius);
      } else {
        // 上半圆：旋转 sectorCenter + PI/2 使文字切向排列（垂直于半径）
        // 在 -textRadius 处绘制（朝向扇区中心方向）
        ctx.rotate(sectorCenter + Math.PI / 2);
        ctx.fillText(text, 0, -textRadius);
      }

      ctx.restore();
    });

    // Inner dashed ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.88, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(40, 38, 27, 0.18)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Outer ring border
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(40, 38, 27, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /** Truncate text to fit within maxWidth */
  private truncateText(text: string, maxWidth: number, fontSize: number): string {
    const ctx = this.ctx;
    ctx.font = `italic ${fontSize}px "Inter", "Noto Sans SC", sans-serif`;

    if (ctx.measureText(text).width <= maxWidth) return text;

    let truncated = text;
    while (truncated.length > 1 && ctx.measureText(truncated + '…').width > maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '…';
  }

  /**
   * 根据轮盘旋转角度计算指针指向的扇区索引。
   *
   * 坐标系：Canvas 角度 0=3点，PI/2=6点（顺时针为正），-PI/2=12点。
   * 轮盘通过 CSS rotateZ(angle) 顺时针旋转，angle 为正且累加。
   * 扇区 i 在世界坐标中占据 [i*sa - PI/2 + angle, (i+1)*sa - PI/2 + angle]。
   * 指针固定在 -PI/2（12 点），命中扇区 i 当且仅当：
   *   i*sa - PI/2 + angle <= -PI/2 < (i+1)*sa - PI/2 + angle
   * 即 i = floor(-angle / sectorAngle) mod n。
   *
   * 边界处理：当指针位于某扇区边界 ±0.5° 范围内时，取顺时针方向的下一个扇区。
   */
  static getSectorAtAngle(
    angle: number,
    optionCount: number,
    boundaryToleranceDeg: number = 0.5,
  ): number {
    if (optionCount === 0) return 0;
    const sectorAngle = (Math.PI * 2) / optionCount;
    const toleranceRad = (boundaryToleranceDeg * Math.PI) / 180;
    const normalized = -angle / sectorAngle;
    const idx = Math.floor(normalized);
    const frac = normalized - idx;
    // 若 normalized 接近下一个整数（顺时针下一扇区边界），则向上取整。
    const adjustedIdx = frac > 1 - toleranceRad / sectorAngle ? idx + 1 : idx;
    return ((adjustedIdx % optionCount) + optionCount) % optionCount;
  }
}
