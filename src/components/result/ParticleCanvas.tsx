import { useRef, useEffect } from 'react';
import { createBurst, updateParticles, renderParticles } from '@/engine/particles/particleSystem';
import type { Particle } from '@/types/engine';
import { resolveColor } from '@/engine/wheel/colorPalette';
import { getTheme } from '@/lib/themes';
import { useSettingsStore } from '@/store/useSettingsStore';

interface ParticleCanvasProps {
  active: boolean;
  resultColor: string;
}

export function ParticleCanvas({ active, resultColor }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 粒子数组改为 ref 存储，避免每帧 setState 触发 React 重渲染
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const themeId = useSettingsStore((s) => s.themeId);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const theme = getTheme(themeId);
    const colors = [
      resolveColor(resultColor),
      '#FFD700',
      '#FFFFFF',
      ...theme.wheelColors.slice(0, 3).map(resolveColor),
    ];

    // 低端设备（内存 < 4GB 或窄屏）减半；高端设备适当增加以提升视觉冲击
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const isLowEnd = deviceMemory < 4 || window.innerWidth < 1024;
    const particleCount = isLowEnd ? 30 : 60;
    // 直接设置 ref.current，不调用 setState
    const burst = createBurst(w / 2, h / 2, colors, particleCount);
    particlesRef.current = burst;
    lastTimeRef.current = performance.now();

    const animate = (now: number) => {
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // 在 RAF 回调中直接更新 ref + 绘制 canvas，不使用 useState
      const next = updateParticles(particlesRef.current, dt);
      particlesRef.current = next;

      if (next.length === 0) {
        ctx.clearRect(0, 0, w, h);
        rafRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, w, h);
      renderParticles(ctx, next);

      rafRef.current = requestAnimationFrame(animate);
    };

    // Initial render
    ctx.clearRect(0, 0, w, h);
    renderParticles(ctx, burst);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      // cleanup 时取消 RAF
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      particlesRef.current = [];
    };
  }, [active, resultColor, themeId]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:max-w-2xl lg:max-h-[600px] lg:w-[672px] lg:h-[600px]"
    />
  );
}
