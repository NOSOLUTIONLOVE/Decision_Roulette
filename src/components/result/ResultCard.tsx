import { useState } from 'react';
import { RotateCcw, Bookmark, Share2, Check } from 'lucide-react';
import { useWheelStore } from '@/store/useWheelStore';
import { useUIStore } from '@/store/useUIStore';
import { useToastStore } from '@/store/useToastStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { resolveColor } from '@/engine/wheel/colorPalette';
import { add as addPreset } from '@/db/presetRepository';
import { cn } from '@/lib/utils';

interface ResultCardProps {
  onSpinAgain: () => void;
}

const fadeUpStyle = (delay: number) => ({
  animation: 'fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards',
  animationDelay: `${delay}ms`,
});

export function ResultCard({ onSpinAgain }: ResultCardProps) {
  const result = useWheelStore((s) => s.result);
  const options = useWheelStore((s) => s.options);
  const setShareOpen = useUIStore((s) => s.setShareOpen);
  const addToast = useToastStore((s) => s.addToast);
  const t = useLocaleStore((s) => s.t);
  const [saved, setSaved] = useState(false);

  if (!result) return null;

  const color = resolveColor(result.optionColor);

  const handleSave = async () => {
    if (saved) return;
    try {
      await addPreset({
        name: result.optionText,
        options: options.map((o) => ({ id: o.id, text: o.text, color: o.color })),
      });
      setSaved(true);
      addToast(t('result.savedToast'), 'success');
    } catch {
      addToast(t('result.saveFailToast'), 'error');
    }
  };

  return (
    <div
      className="relative z-30 mx-4 w-full max-w-[360px] rounded-[var(--radius-xl)] border border-[var(--color-line-200)] bg-[var(--color-paper-50)] px-7 py-8 text-center lg:max-w-md"
      style={{
        animation: 'result-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 20px 60px rgba(40,38,27,0.15), 0 0 0 1px rgba(255,255,255,0.5) inset',
      }}
    >
      {/* Fleuron: line + ❧ + line */}
      <div className="mb-6 flex items-center justify-center gap-4" style={fadeUpStyle(0)}>
        <span className="h-px w-6 bg-[var(--color-brand-400)]" />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: '16px',
            color: 'var(--color-brand-500)',
          }}
          aria-hidden="true"
        >
          &#10087;
        </span>
        <span className="h-px w-6 bg-[var(--color-brand-400)]" />
      </div>

      {/* Eyebrow */}
      <p
        className="mb-3 text-[11px] uppercase tracking-[0.15em] text-[var(--color-ink-400)]"
        style={{ ...fadeUpStyle(80), fontFamily: 'var(--font-ui)', fontWeight: 500 }}
      >
        {t('result.eyebrow')}
      </p>

      {/* Result title */}
      <h2
        aria-live="assertive"
        className="break-words text-[44px] leading-[1.15] text-[var(--color-ink-900)] lg:text-[56px]"
        style={{
          ...fadeUpStyle(160),
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 400,
        }}
      >
        {result.optionText}
      </h2>

      {/* Sector dot + subtitle */}
      <div className="mt-4 flex items-center justify-center gap-3" style={fadeUpStyle(240)}>
        <span
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 0 3px ${color}25`,
            animation: 'winner-glow 2.4s ease-in-out infinite',
          }}
        />
        <p
          className="text-[14px] text-[var(--color-ink-600)]"
          style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic' }}
        >
          {t('result.subtitle')}
        </p>
      </div>

      {/* Divider */}
      <hr
        className="my-6 border-0 border-t border-[var(--color-line-200)]"
        style={fadeUpStyle(400)}
      />

      {/* Action buttons — horizontal 3-button layout */}
      <div className="flex gap-3" style={fadeUpStyle(480)}>
        <button
          type="button"
          onClick={onSpinAgain}
          className="flex flex-1 items-center justify-center gap-2.5 rounded-[var(--radius-sm)] bg-[var(--color-brand-500)] py-3.5 text-[13px] text-white transition-colors hover:bg-[var(--color-brand-600)]"
          style={{ fontFamily: 'var(--font-ui)', fontWeight: 500 }}
        >
          <RotateCcw size={14} strokeWidth={1.5} />
          {t('result.spinAgain')}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saved}
          className={cn(
            'flex flex-1 items-center justify-center gap-2.5 rounded-[var(--radius-sm)] border py-3.5 text-[13px] transition-colors',
            saved
              ? 'border-[var(--color-success)] text-[var(--color-success)]'
              : 'border-[var(--color-line-400)] text-[var(--color-ink-600)] hover:border-[var(--color-brand-400)] hover:text-[var(--color-brand-500)]',
          )}
          style={{ fontFamily: 'var(--font-ui)', fontWeight: 500 }}
        >
          {saved ? <Check size={14} strokeWidth={2} /> : <Bookmark size={14} strokeWidth={1.5} />}
          {saved ? t('result.saved') : t('result.save')}
        </button>

        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="flex flex-1 items-center justify-center gap-2.5 rounded-[var(--radius-sm)] border border-[var(--color-line-400)] py-3.5 text-[13px] text-[var(--color-ink-600)] transition-colors hover:border-[var(--color-brand-400)] hover:text-[var(--color-brand-500)]"
          style={{ fontFamily: 'var(--font-ui)', fontWeight: 500 }}
        >
          <Share2 size={14} strokeWidth={1.5} />
          {t('result.share')}
        </button>
      </div>

      {/* Meta stamp — 与全应用中文一致 */}
      <p
        className="mt-6 text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-400)]"
        style={{ ...fadeUpStyle(560), fontFamily: 'var(--font-mono)' }}
      >
        {t('result.meta', { num: String(result.optionIndex + 1).padStart(3, '0') })}
      </p>
    </div>
  );
}
