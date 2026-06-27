import { useState } from 'react';
import { Check, GripVertical, X } from 'lucide-react';
import type { Option } from '@/types';
import { useWheelStore } from '@/store/useWheelStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { resolveColor } from '@/engine/wheel/colorPalette';
import { haptics } from '@/lib/haptics';
import { cn } from '@/lib/utils';

interface OptionItemProps {
  option: Option;
  index: number;
  isDragged?: boolean;
  isHoverTarget?: boolean;
  onPointerDown?: (index: number, e: React.PointerEvent) => void;
}

export function OptionItem({
  option,
  index,
  isDragged = false,
  isHoverTarget = false,
  onPointerDown,
}: OptionItemProps) {
  const removeOption = useWheelStore((s) => s.removeOption);
  const updateOption = useWheelStore((s) => s.updateOption);
  const phase = useWheelStore((s) => s.phase);
  const t = useLocaleStore((s) => s.t);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(option.text);
  const color = resolveColor(option.color);
  // 转动期间锁定所有编辑操作：避免修改/删除打乱扇区映射
  const isLocked = phase !== 'idle';

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== option.text) {
      updateOption(option.id, trimmed);
    } else {
      setEditText(option.text);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(option.text);
      setEditing(false);
    }
  };

  return (
    <div
      data-option-index={index}
      className={cn(
        'group flex items-center gap-3 rounded-[var(--radius-sm)] border bg-[var(--color-paper-50)] px-4 py-3.5 transition-[border-color,opacity,box-shadow,transform]',
        isDragged
          ? 'border-[var(--color-brand-400)] opacity-50 shadow-md scale-[1.02]'
          : isHoverTarget
            ? 'border-[var(--color-brand-300)] border-t-2'
            : 'border-[var(--color-line-300)] hover:border-[var(--color-line-400)] hover:bg-[var(--color-paper-100)]',
      )}
      style={{
        animation: 'slide-in 0.32s cubic-bezier(0.2, 0.6, 0.3, 1) backwards',
        animationDelay: `${index * 0.04}s`,
      }}
    >
      {/* Drag handle */}
      {onPointerDown && !editing && !isLocked && (
        <button
          onPointerDown={(e) => onPointerDown(index, e)}
          className="cursor-grab touch-none text-[var(--color-ink-400)] opacity-0 transition-opacity hover:text-[var(--color-ink-600)] group-hover:opacity-100 active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          aria-label={t('option.drag')}
        >
          <GripVertical size={14} strokeWidth={1.5} />
        </button>
      )}

      {/* Color dot */}
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: 'inset 0 0 0 1px rgba(40,38,27,0.08)',
        }}
      />

      {/* Text or edit input */}
      {editing ? (
        <input
          autoFocus
          type="text"
          name="option-edit"
          autoComplete="off"
          inputMode="text"
          spellCheck={false}
          value={editText}
          maxLength={20}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="flex-1 bg-transparent text-[15px] lg:text-[16px] text-[var(--color-ink-800)] focus:outline-none"
          style={{ fontFamily: 'var(--font-body)' }}
        />
      ) : (
        <button
          onClick={() => !isLocked && setEditing(true)}
          disabled={isLocked}
          className="flex-1 truncate text-left text-[15px] lg:text-[16px] text-[var(--color-ink-700)] disabled:cursor-not-allowed"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {option.text}
        </button>
      )}

      {/* Index number */}
      <span
        className="text-[10px] tabular-nums text-[var(--color-ink-400)]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Action button */}
      {editing ? (
        <button
          onClick={handleSave}
          className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-success)] transition-colors hover:bg-[var(--color-paper-200)]"
          aria-label={t('option.save')}
        >
          <Check size={14} strokeWidth={2} />
        </button>
      ) : (
        <button
          onClick={() => {
            if (isLocked) return;
            removeOption(option.id);
            haptics.light();
          }}
          disabled={isLocked}
          className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-ink-400)] opacity-0 transition-[opacity,background-color,color] hover:bg-[var(--color-paper-200)] hover:text-[var(--color-error)] group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={t('option.delete')}
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
