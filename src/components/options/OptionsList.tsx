import { useState, useRef, useEffect } from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import { useWheelStore } from '@/store/useWheelStore';
import { useUIStore } from '@/store/useUIStore';
import { useToastStore } from '@/store/useToastStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { haptics } from '@/lib/haptics';
import { useDragReorder } from '@/hooks/useDragReorder';
import { OptionItem } from './OptionItem';

export function OptionsList() {
  const options = useWheelStore((s) => s.options);
  const phase = useWheelStore((s) => s.phase);
  const clearOptions = useWheelStore((s) => s.clearOptions);
  const reorderOptions = useWheelStore((s) => s.reorderOptions);
  const setPresetDialogOpen = useUIStore((s) => s.setPresetDialogOpen);
  const addToast = useToastStore((s) => s.addToast);
  const t = useLocaleStore((s) => s.t);
  const [confirmClear, setConfirmClear] = useState(false);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 转动期间锁定 clearAll（reorder / edit 已在底层组件各自守卫）
  const isLocked = phase !== 'idle';

  useEffect(() => {
    return () => {
      if (confirmTimerRef.current !== null) {
        clearTimeout(confirmTimerRef.current);
      }
    };
  }, []);

  const { draggedIndex, hoverIndex, handlePointerDown } = useDragReorder(reorderOptions);

  if (options.length === 0) {
    return (
      <div className="py-6 text-center">
        <p
          className="text-[13px] italic text-[var(--color-ink-400)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('options.list.empty')}
        </p>
      </div>
    );
  }

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      if (confirmTimerRef.current !== null) clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    if (confirmTimerRef.current !== null) {
      clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = null;
    }
    clearOptions();
    haptics.light();
    addToast(t('options.list.cleared'), 'info');
    setConfirmClear(false);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {options.map((option, i) => (
        <OptionItem
          key={option.id}
          option={option}
          index={i}
          isDragged={draggedIndex === i}
          isHoverTarget={hoverIndex === i && draggedIndex !== null && draggedIndex !== i}
          onPointerDown={handlePointerDown}
        />
      ))}

      {/* Action row */}
      {options.length >= 2 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setPresetDialogOpen(true);
              haptics.light();
            }}
            className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink-500)] transition-colors hover:text-[var(--color-brand-500)]"
            style={{ fontFamily: 'var(--font-ui)', fontWeight: 500 }}
          >
            <Bookmark size={13} strokeWidth={1.5} />
            {t('options.list.savePreset')}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={isLocked}
            className="flex items-center gap-1.5 text-[12px] transition-colors disabled:cursor-not-allowed disabled:opacity-30"
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 500,
              color: confirmClear ? 'var(--color-error)' : 'var(--color-ink-400)',
            }}
          >
            <Trash2 size={13} strokeWidth={1.5} />
            {confirmClear ? t('options.list.confirmClear') : t('options.list.clearAll')}
          </button>
        </div>
      )}
    </div>
  );
}
