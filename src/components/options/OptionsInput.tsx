import { useState, useRef, useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useWheelStore } from '@/store/useWheelStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { assignColor } from '@/engine/wheel/colorPalette';
import { haptics } from '@/lib/haptics';
import { cn } from '@/lib/utils';

const MAX_OPTIONS = 50;
const MAX_TEXT_LENGTH = 20;

export function OptionsInput() {
  const [text, setText] = useState('');
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { options, addOption, addOptionsBulk } = useWheelStore();
  const t = useLocaleStore((s) => s.t);

  // 卸载时清理 shake 动画定时器，避免 setState on unmounted
  useEffect(() => {
    return () => {
      if (shakeTimerRef.current !== null) {
        clearTimeout(shakeTimerRef.current);
      }
    };
  }, []);

  const handleAdd = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Check for duplicates (case-insensitive)
    const exists = options.some(
      (o) => o.text.trim().toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      setShaking(true);
      if (shakeTimerRef.current !== null) clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = setTimeout(() => setShaking(false), 400);
      return;
    }

    if (options.length >= MAX_OPTIONS) return;

    // Support multi-line paste: split by newlines
    const lines = trimmed.split('\n').filter((l) => l.trim());
    if (lines.length > 1) {
      const items = lines
        .filter((l) => {
          const lt = l.trim();
          return lt && !options.some((o) => o.text.trim().toLowerCase() === lt.toLowerCase());
        })
        .slice(0, MAX_OPTIONS - options.length)
        .map((l, i) => ({ text: l.trim(), color: assignColor(options.length + i) }));
      if (items.length > 0) addOptionsBulk(items);
    } else {
      addOption(trimmed, assignColor(options.length));
    }

    haptics.light();
    setText('');
    inputRef.current?.focus();
  }, [text, options, addOption, addOptionsBulk]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const isMaxed = options.length >= MAX_OPTIONS;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-[var(--radius-md)] border bg-[var(--color-paper-50)] p-2.5 transition-[border-color,box-shadow]',
          'border-[var(--color-line-300)]',
          'focus-within:border-[var(--color-brand-400)] focus-within:shadow-[0_0_0_3px_var(--color-brand-50)]',
          shaking && 'border-[var(--color-error)]',
        )}
        style={shaking ? { animation: 'shake 0.3s ease' } : undefined}
      >
        <input
          ref={inputRef}
          type="text"
          name="option"
          autoComplete="off"
          inputMode="text"
          spellCheck={false}
          value={text}
          maxLength={MAX_TEXT_LENGTH}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isMaxed ? t('options.input.placeholderMaxed') : t('options.input.placeholder')}
          disabled={isMaxed}
          className="h-11 lg:h-12 flex-1 bg-transparent px-3 text-[15px] lg:text-[16px] text-[var(--color-ink-800)] placeholder:text-[var(--color-ink-400)] focus:outline-none disabled:cursor-not-allowed"
          style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic' }}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!text.trim() || isMaxed}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-500)] text-white transition-[transform,background-color] hover:scale-[1.04] hover:bg-[var(--color-brand-600)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
          style={{ boxShadow: '0 1px 3px rgba(201,100,66,0.25)' }}
          aria-label={t('options.input.add')}
        >
          <Plus size={16} strokeWidth={2} />
        </button>
      </div>
      <div className="mt-2.5 flex justify-between px-1">
        <span className="text-[11px] text-[var(--color-ink-400)]" style={{ fontFamily: 'var(--font-ui)' }}>
          {options.length < 2 ? t('options.input.needTwo') : t('options.input.count', { count: options.length })}
        </span>
        <span className="text-[11px] text-[var(--color-ink-400)]" style={{ fontFamily: 'var(--font-mono)' }}>
          {options.length}/{MAX_OPTIONS}
        </span>
      </div>
    </div>
  );
}
