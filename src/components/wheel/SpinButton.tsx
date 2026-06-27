import { useRef } from 'react';
import { useWheelStore } from '@/store/useWheelStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { useCharging } from '@/hooks/useCharging';

interface SpinButtonProps {
  onSpin: (chargeRatio: number) => void;
}

export function SpinButton({ onSpin }: SpinButtonProps) {
  const options = useWheelStore((s) => s.options);
  const phase = useWheelStore((s) => s.phase);
  const t = useLocaleStore((s) => s.t);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // 蓄力进度条与百分比文本节点：交由 useCharging 在 RAF 中直接操作 DOM
  const progressRef = useRef<HTMLSpanElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const { charging, start, end } = useCharging(onSpin, {
    buttonRef,
    progressRef,
    percentRef,
  });

  // 仅在 idle / charging 时允许交互；转动、停止、结果阶段禁用，防止重复触发
  const isDisabled = options.length < 2 || (phase !== 'idle' && phase !== 'charging');
  const isSpinning = phase === 'accelerating' || phase === 'decelerating';

  // Pointer 事件统一覆盖鼠标 / 触摸 / 触控笔，无需再绑定 mouse/touch 三套冗余事件
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    // 阻止默认的 mousedown 合成事件，避免焦点抢占和文字选中
    e.preventDefault();
    start();
  };

  const handlePointerUp = () => {
    end();
  };

  const handlePointerLeave = () => {
    end();
  };

  // 键盘支持：Enter / Space 以零蓄力直接触发转动，不启动蓄力进度动画
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSpin(0);
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={isDisabled}
      aria-busy={isSpinning}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      className="relative w-full h-[56px] lg:h-[64px] select-none overflow-hidden rounded-full touch-none transition-[box-shadow,opacity,background-color] active:scale-[0.98]"
      style={{
        background: isDisabled
          ? 'var(--color-ink-300)'
          : 'var(--color-brand-500)',
        color: 'var(--color-paper-50)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        boxShadow: charging
          ? `0 0 8px rgba(201, 100, 66, 0.35), 0 2px 8px rgba(201, 100, 66, 0.3)`
          : '0 2px 8px rgba(201, 100, 66, 0.2)',
        transition: charging ? 'box-shadow 0.08s' : 'box-shadow 0.2s, opacity 0.2s, background-color 0.2s',
      }}
    >
      {/* Top highlight overlay */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-[45%]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, transparent 100%)',
        }}
      />

      {/* Charge progress line at bottom */}
      {charging && (
        <span
          ref={progressRef}
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 bg-white/80"
          style={{
            width: '0%',
            transition: 'width 0.05s linear',
          }}
        />
      )}

      {/* Label */}
      <span
        className="relative z-10 flex items-center justify-center gap-2"
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: '18px',
          letterSpacing: '0.04em',
        }}
      >
        {isSpinning ? (
          t('spin.spinning')
        ) : charging ? (
          <>
            {t('spin.charging')}
            <span
              ref={percentRef}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              0%
            </span>
          </>
        ) : (
          <>
            {t('spin.label')}
            <span
              className="transition-transform"
              style={{ display: 'inline-block', transform: 'translateX(0)' }}
            >
              →
            </span>
          </>
        )}
      </span>
    </button>
  );
}
