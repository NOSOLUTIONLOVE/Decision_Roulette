import { useEffect } from 'react';
import { useWheelStore } from '@/store/useWheelStore';
import { useUIStore } from '@/store/useUIStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { ResultCard } from './ResultCard';
import { ParticleCanvas } from './ParticleCanvas';

export function ResultOverlay() {
  const result = useWheelStore((s) => s.result);
  const phase = useWheelStore((s) => s.phase);
  const { resultOpen, setResultOpen, closeAll } = useUIStore();
  const reset = useWheelStore((s) => s.reset);
  const t = useLocaleStore((s) => s.t);

  // Open overlay when result is available
  useEffect(() => {
    if (result && phase === 'result') {
      setResultOpen(true);
    }
  }, [result, phase, setResultOpen]);

  // Escape 关闭 — 与 HistoryDrawer / SettingsPanel 一致的键盘可访问性
  useEffect(() => {
    if (!resultOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAll();
        reset();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [resultOpen, closeAll, reset]);

  if (!resultOpen || !result) return null;

  const handleSpinAgain = () => {
    closeAll();
    reset();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 仅点击 backdrop 本身（非内部卡片）才关闭
    if (e.target === e.currentTarget) {
      closeAll();
      reset();
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overscroll-contain"
      style={{
        animation: 'scrim-in 0.3s ease-out',
        background: 'rgba(250, 249, 245, 0.55)',
        backdropFilter: 'blur(6px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(6px) saturate(1.2)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={t('result.ariaLabel')}
      onClick={handleBackdropClick}
    >
      {/* Particle celebration */}
      <ParticleCanvas active={resultOpen} resultColor={result.optionColor} />

      {/* Result card */}
      <ResultCard onSpinAgain={handleSpinAgain} />
    </div>
  );
}
