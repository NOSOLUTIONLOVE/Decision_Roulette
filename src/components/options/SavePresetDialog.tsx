import { useState, useRef, useEffect } from 'react';
import { useWheelStore } from '@/store/useWheelStore';
import { useUIStore } from '@/store/useUIStore';
import { useToastStore } from '@/store/useToastStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { add as addPreset } from '@/db/presetRepository';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export function SavePresetDialog() {
  const open = useUIStore((s) => s.presetDialogOpen);
  const setOpen = useUIStore((s) => s.setPresetDialogOpen);
  const options = useWheelStore((s) => s.options);
  const addToast = useToastStore((s) => s.addToast);
  const t = useLocaleStore((s) => s.t);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    if (open) {
      setName('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    try {
      await addPreset({
        name: trimmed,
        options: options.map((o) => ({ id: o.id, text: o.text, color: o.color })),
      });
      addToast(t('preset.savedToast'), 'success');
      setOpen(false);
    } catch {
      addToast(t('preset.saveFailToast'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        animation: 'scrim-in 0.2s ease-out',
        background: 'rgba(40,38,27,0.4)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        ref={containerRef}
        className="mx-6 w-full max-w-[320px] rounded-[var(--radius-lg)] border border-[var(--color-line-300)] bg-[var(--color-paper-50)] p-6 shadow-2xl lg:max-w-md"
        style={{
          animation: 'result-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={t('preset.title')}
      >
        <h3
          className="mb-4 text-[16px] text-[var(--color-ink-900)]"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400 }}
        >
          {t('preset.title')}
        </h3>
        <p
          className="mb-4 text-[12px] text-[var(--color-ink-500)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('preset.desc')}
        </p>
        <input
          ref={inputRef}
          type="text"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('preset.placeholder')}
          className="mb-6 h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-line-300)] bg-[var(--color-paper-100)] px-4 text-[14px] text-[var(--color-ink-800)] placeholder:text-[var(--color-ink-400)] focus:border-[var(--color-brand-400)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-brand-50)]"
          style={{ fontFamily: 'var(--font-body)' }}
        />
        <div className="flex gap-3">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-line-400)] py-3 text-[13px] text-[var(--color-ink-600)] transition-colors hover:bg-[var(--color-paper-200)]"
            style={{ fontFamily: 'var(--font-ui)', fontWeight: 500 }}
          >
            {t('preset.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex-1 rounded-[var(--radius-sm)] bg-[var(--color-brand-500)] py-3 text-[13px] text-white transition-colors hover:bg-[var(--color-brand-600)] disabled:opacity-50"
            style={{ fontFamily: 'var(--font-ui)', fontWeight: 500 }}
          >
            {t('preset.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
