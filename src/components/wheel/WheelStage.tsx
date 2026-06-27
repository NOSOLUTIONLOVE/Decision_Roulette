import { useRef } from 'react';
import { WheelCanvas } from './WheelCanvas';
import { WheelPointer } from './WheelPointer';
import { WheelHub } from './WheelHub';
import { SpinButton } from './SpinButton';
import { Ornament } from '@/components/layout/Ornament';
import { useSpinEngine } from '@/hooks/useSpinEngine';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

export function WheelStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { startSpin, phase } = useSpinEngine(canvasRef);
  const { shouldDegrade } = usePerformanceMonitor();

  const isIdle = phase === 'idle';
  const tiltAngle = shouldDegrade ? 0 : 12;

  return (
    <div className="flex flex-col gap-7">
      {/* === Stage container === */}
      <div
        className="wheel-stage relative overflow-visible rounded-[var(--radius-lg)] p-[48px_16px_24px_16px] min-h-[340px] lg:min-h-[520px] lg:p-[64px_24px_32px_24px]"
        style={{
          background: 'var(--color-paper-200)',
          border: '1px solid var(--color-line-300)',
          boxShadow:
            '0 1px 3px rgba(40,38,27,0.06), 0 8px 24px rgba(40,38,27,0.08), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        {/* Radial gradient overlay — 随主题 brand 色 */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--color-brand-500) 3.5%, transparent) 0%, transparent 35%),
              radial-gradient(circle at 80% 70%, color-mix(in srgb, var(--color-success) 3.5%, transparent) 0%, transparent 35%)
            `,
          }}
        />

        {/* Wheel area */}
        <div className="relative mx-auto h-[300px] w-[300px] lg:h-[480px] lg:w-[480px] xl:h-[520px] xl:w-[520px]">
          {/* Pointer (fixed, doesn't rotate) */}
          <WheelPointer />

          {/* 3D wrapper — perspective container (not tilted) */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              perspective: '800px',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Tilted plane — both background & canvas live here so they share
                the same rotateX transform and stay perfectly aligned. */}
            <div
              className="h-full w-full"
              style={{
                transform: `rotateX(${tiltAngle}deg)`,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.3s ease',
              }}
            >
              {/* Stage background circle — inside the tilted plane */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at 50% 40%, var(--color-paper-50) 0%, var(--color-paper-200) 70%, var(--color-paper-300) 100%)',
                  boxShadow:
                    '0 4px 12px rgba(40,38,27,0.12), inset 0 0 0 1px rgba(40,38,27,0.08)',
                }}
              />

              {/* Idle spin animation wrapper */}
              <div
                className="h-full w-full"
                style={{
                  animation: isIdle
                    ? 'idle-spin 120s linear infinite'
                    : 'none',
                  transformOrigin: 'center center',
                }}
              >
                <WheelCanvas canvasRef={canvasRef} />
              </div>
            </div>
          </div>

          {/* Hub (fixed, doesn't rotate) */}
          <WheelHub />
        </div>
      </div>

      {/* === Spin button (outside stage) === */}
      <SpinButton onSpin={startSpin} />

      {/* === Ornament + hint === */}
      <Ornament />
    </div>
  );
}
