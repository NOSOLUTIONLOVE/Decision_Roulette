import type { Option } from '@/types';
import type { WheelConfig } from '@/types/engine';
import { WheelRenderer } from '@/engine/wheel/renderer';
import { resolveColor } from '@/engine/wheel/colorPalette';

/** Portrait share-card dimensions (9:16, ideal for stories / wallpaper). */
export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1920;

/** Logical wheel size the WheelRenderer is tuned for (matches the live app). */
const WHEEL_LOGICAL_SIZE = 300;
/** High-resolution wheel rasterized onto the card (3x for crisp sectors + text). */
const WHEEL_PIXEL_SIZE = 900;

/* Warm-editorial palette (mirrors the default theme tokens). */
const PAPER_TOP = '#ffffff';
const PAPER_MID = '#faf9f5';
const PAPER_BOTTOM = '#f1efe8';
const INK_PRIMARY = '#3d3929';
const INK_MUTED = '#6e6d68';
const BRAND = '#c96442';
const DIVIDER = 'rgba(40, 38, 27, 0.15)';

/** Minimal payload needed to render a share card. */
export interface ShareCardData {
  options: Pick<Option, 'text' | 'color'>[];
  result: string;
  resultColor: string;
}

/** Tunable rendering options. */
export interface ShareCardRenderOptions {
  textSize?: 'small' | 'medium' | 'large';
  brandName?: string;
  /** 本地化标语：绘制在品牌名下方的副标题。未提供则跳过。 */
  tagline?: string;
}

/**
 * ShareCardRenderer — paints a 1080×1920 portrait share card on an offscreen
 * canvas.
 *
 * Layout:
 *  - Top 60%  : high-resolution redraw of the wheel (reuses {@link WheelRenderer}),
 *               oriented so the winning sector sits under the pointer.
 *  - Bottom 40%: editorial result block — tracked eyebrow, large serif result,
 *               a hand-drawn fleuron ornament, brand name and tagline.
 *
 * Output helpers support graceful degradation:
 *  - {@link toBlob} returns `null` when `canvas.toBlob` is unavailable.
 *  - {@link toFile}  falls back to `toDataURL` → `Blob` → `File`.
 *  - {@link download} uses `toBlob` + object URL, falling back to `toDataURL`
 *    + an `<a download>` anchor.
 */
export class ShareCardRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private data: ShareCardData;
  private options: Required<ShareCardRenderOptions>;
  private rendered = false;

  constructor(data: ShareCardData, options: ShareCardRenderOptions = {}) {
    this.data = data;
    this.options = {
      textSize: options.textSize ?? 'medium',
      brandName: options.brandName ?? 'Decision Roulette',
      tagline: options.tagline ?? '',
    };

    this.canvas = document.createElement('canvas');
    this.canvas.width = CARD_WIDTH;
    this.canvas.height = CARD_HEIGHT;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法创建 2D 渲染上下文，分享图生成失败。');
    }
    this.ctx = ctx;
  }

  /** Render the full card (idempotent) and return the offscreen canvas. */
  render(): HTMLCanvasElement {
    this.drawBackground();
    this.drawWheel();
    this.drawResultBlock();
    this.rendered = true;
    return this.canvas;
  }

  /** Direct access to the underlying canvas (rendered lazily). */
  getCanvas(): HTMLCanvasElement {
    this.ensureRendered();
    return this.canvas;
  }

  /** Encode the card as a PNG Blob, or `null` if unsupported. */
  toBlob(): Promise<Blob | null> {
    this.ensureRendered();
    return new Promise((resolve) => {
      if (typeof this.canvas.toBlob !== 'function') {
        resolve(null);
        return;
      }
      this.canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
    });
  }

  /** Encode the card as a PNG data URL (always available). */
  toDataURL(): string {
    this.ensureRendered();
    return this.canvas.toDataURL('image/png');
  }

  /** Build a `File` ready for the Web Share API. Falls back to data URL. */
  async toFile(filename = 'decision-roulette.png'): Promise<File> {
    await this.ensureFontsReady();
    this.ensureRendered();

    const blob = await this.toBlob();
    if (blob) {
      return new File([blob], filename, { type: 'image/png' });
    }

    const dataUrl = this.canvas.toDataURL('image/png');
    return new File([this.dataUrlToBlob(dataUrl)], filename, { type: 'image/png' });
  }

  /**
   * Trigger a browser download. Prefers `toBlob` + object URL; degrades to
   * `toDataURL` + an `<a download>` anchor when `toBlob` is unavailable.
   */
  async download(filename = 'decision-roulette.png'): Promise<void> {
    await this.ensureFontsReady();
    this.render();

    const blob = await this.toBlob();
    if (blob) {
      const url = URL.createObjectURL(blob);
      this.triggerAnchorDownload(url, filename);
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      return;
    }

    this.triggerAnchorDownload(this.canvas.toDataURL('image/png'), filename);
  }

  /* ------------------------------------------------------------------ */
  /* Drawing                                                            */
  /* ------------------------------------------------------------------ */

  private ensureRendered(): void {
    if (!this.rendered) this.render();
  }

  private async ensureFontsReady(): Promise<void> {
    try {
      if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready;
      }
    } catch {
      /* fonts not ready — render with fallbacks */
    }
  }

  private drawBackground(): void {
    const ctx = this.ctx;

    const grad = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
    grad.addColorStop(0, PAPER_TOP);
    grad.addColorStop(0.45, PAPER_MID);
    grad.addColorStop(1, PAPER_BOTTOM);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // Warm terracotta vignette anchored to the bottom edge.
    const vignette = ctx.createRadialGradient(
      CARD_WIDTH / 2,
      CARD_HEIGHT + 200,
      100,
      CARD_WIDTH / 2,
      CARD_HEIGHT + 200,
      CARD_HEIGHT * 0.7,
    );
    vignette.addColorStop(0, 'rgba(201, 100, 66, 0.10)');
    vignette.addColorStop(1, 'rgba(201, 100, 66, 0)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // Thin inner frame for an editorial print feel.
    ctx.strokeStyle = 'rgba(40, 38, 27, 0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, CARD_WIDTH - 80, CARD_HEIGHT - 80);
  }

  private drawWheel(): void {
    const ctx = this.ctx;
    const wheelZoneHeight = CARD_HEIGHT * 0.6; // 1152

    // Offscreen high-res wheel canvas. We scale the context so WheelRenderer
    // keeps its tuned proportions while we rasterize at 3x for crispness.
    const wheelCanvas = document.createElement('canvas');
    wheelCanvas.width = WHEEL_PIXEL_SIZE;
    wheelCanvas.height = WHEEL_PIXEL_SIZE;
    const wheelCtx = wheelCanvas.getContext('2d');
    if (!wheelCtx) return;
    wheelCtx.scale(WHEEL_PIXEL_SIZE / WHEEL_LOGICAL_SIZE, WHEEL_PIXEL_SIZE / WHEEL_LOGICAL_SIZE);

    const options: Option[] = this.data.options.map((o) => ({
      id: o.text,
      text: o.text,
      color: o.color,
    }));

    const n = Math.max(options.length, 1);
    const sectorAngle = (Math.PI * 2) / n;
    const winnerIndex = Math.max(
      0,
      options.findIndex((o) => o.text === this.data.result),
    );
    // Rotate so the winning sector centres under the 12 o'clock pointer.
    const angle = -(winnerIndex * sectorAngle + sectorAngle / 2);

    const config: WheelConfig = {
      size: WHEEL_LOGICAL_SIZE,
      textSize: this.options.textSize,
      colors: [],
      highlightSectorIndex: winnerIndex,
    };

    const renderer = new WheelRenderer(wheelCtx, WHEEL_LOGICAL_SIZE);
    renderer.draw(options, config, angle);

    const dx = (CARD_WIDTH - WHEEL_PIXEL_SIZE) / 2; // 90
    const dy = Math.floor((wheelZoneHeight - WHEEL_PIXEL_SIZE) / 2) + 30; // ~156
    ctx.drawImage(wheelCanvas, dx, dy, WHEEL_PIXEL_SIZE, WHEEL_PIXEL_SIZE);

    this.drawPointer(CARD_WIDTH / 2, dy);
  }

  private drawPointer(x: number, tipY: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = INK_PRIMARY;
    ctx.beginPath();
    ctx.moveTo(x - 22, tipY - 40);
    ctx.lineTo(x + 22, tipY - 40);
    ctx.lineTo(x, tipY + 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(40, 38, 27, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  private drawResultBlock(): void {
    const ctx = this.ctx;
    const blockTop = CARD_HEIGHT * 0.6; // 1152
    const centerX = CARD_WIDTH / 2; // 540

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top hairline divider.
    const dividerY = blockTop + 48;
    ctx.strokeStyle = DIVIDER;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(120, dividerY);
    ctx.lineTo(CARD_WIDTH - 120, dividerY);
    ctx.stroke();

    // Eyebrow (tracked uppercase).
    const eyebrowY = blockTop + 112;
    ctx.fillStyle = BRAND;
    ctx.font = '500 26px "Inter", "Noto Sans SC", sans-serif';
    this.drawTrackedText('— YOUR DESTINY —', centerX, eyebrowY, 7);

    // Result (hero, serif italic, wrapped).
    ctx.fillStyle = this.resultTextColor();
    ctx.font = 'italic 500 96px "Inter", "Noto Sans SC", sans-serif';
    this.drawWrappedText(
      this.data.result,
      centerX,
      blockTop + 330,
      CARD_WIDTH - 180,
      104,
      3,
    );

    // Fleuron ornament.
    this.drawFleuron(centerX, blockTop + 524, BRAND);

    // Brand name.
    ctx.fillStyle = INK_PRIMARY;
    ctx.font = '500 34px "Inter", "Noto Sans SC", sans-serif';
    ctx.fillText(this.options.brandName, centerX, blockTop + 596);

    // Tagline.
    if (this.options.tagline) {
      ctx.fillStyle = INK_MUTED;
      ctx.font = 'italic 24px "Inter", "Noto Sans SC", sans-serif';
      ctx.fillText(this.options.tagline, centerX, blockTop + 640);
    }
  }

  /** Draw text with manual letter-spacing (reliable across canvas impls). */
  private drawTrackedText(text: string, x: number, y: number, spacing: number): void {
    const ctx = this.ctx;
    const chars = [...text];
    const widths = chars.map((c) => ctx.measureText(c).width);
    const total =
      widths.reduce((sum, w) => sum + w, 0) + spacing * Math.max(chars.length - 1, 0);

    const prevAlign = ctx.textAlign;
    ctx.textAlign = 'left';
    let cursor = x - total / 2;
    for (let i = 0; i < chars.length; i += 1) {
      ctx.fillText(chars[i]!, cursor, y);
      cursor += (widths[i] ?? 0) + spacing;
    }
    ctx.textAlign = prevAlign;
  }

  /** Wrap text (char-aware, CJK friendly) and draw up to `maxLines` lines. */
  private drawWrappedText(
    text: string,
    x: number,
    centerY: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number,
  ): void {
    const ctx = this.ctx;
    let lines = this.wrapText(text, maxWidth);

    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      let last = lines[maxLines - 1] ?? '';
      while (last.length > 0 && ctx.measureText(last + '…').width > maxWidth) {
        last = last.slice(0, -1);
      }
      lines[maxLines - 1] = last + '…';
    }

    const totalHeight = lines.length * lineHeight;
    let cursorY = centerY - totalHeight / 2 + lineHeight / 2;
    for (const line of lines) {
      ctx.fillText(line, x, cursorY);
      cursorY += lineHeight;
    }
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const ctx = this.ctx;
    const lines: string[] = [];
    let current = '';
    for (const ch of text) {
      const candidate = current + ch;
      if (ctx.measureText(candidate).width > maxWidth && current.length > 0) {
        lines.push(current);
        current = ch;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  /** Hand-drawn fleuron — diamond, hairlines, end dots (no font-glyph dependency). */
  private drawFleuron(x: number, y: number, color: string): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    const half = 9;
    ctx.beginPath();
    ctx.moveTo(x, y - half);
    ctx.lineTo(x + half, y);
    ctx.lineTo(x, y + half);
    ctx.lineTo(x - half, y);
    ctx.closePath();
    ctx.fill();

    const gap = 22;
    const len = 96;
    ctx.beginPath();
    ctx.moveTo(x - gap - len, y);
    ctx.lineTo(x - gap, y);
    ctx.moveTo(x + gap, y);
    ctx.lineTo(x + gap + len, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x - gap - len - 9, y, 3, 0, Math.PI * 2);
    ctx.arc(x + gap + len + 9, y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** Pick a readable text color for the result, falling back when too light. */
  private resultTextColor(): string {
    const resolved = resolveColor(this.data.resultColor);
    if (!resolved.startsWith('#')) return INK_PRIMARY;
    return this.luminance(resolved) <= 0.55 ? resolved : INK_PRIMARY;
  }

  private luminance(hex: string): number {
    let h = hex.replace('#', '');
    if (h.length === 3) {
      h = h
        .split('')
        .map((c) => c + c)
        .join('');
    }
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }

  /* ------------------------------------------------------------------ */
  /* Download helpers                                                   */
  /* ------------------------------------------------------------------ */

  private triggerAnchorDownload(href: string, filename: string): void {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private dataUrlToBlob(dataUrl: string): Blob {
    const [meta, base64] = dataUrl.split(',');
    const mime = meta?.match(/data:(.*?);/)?.[1] ?? 'image/png';
    const binary = atob(base64 ?? '');
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }
}
