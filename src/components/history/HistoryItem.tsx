import { useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import type { HistoryRecord } from '@/types';
import { formatTime } from '@/lib/utils';
import * as historyRepo from '@/db/historyRepository';
import { useUIStore } from '@/store/useUIStore';
import { useToastStore } from '@/store/useToastStore';
import { useLocaleStore } from '@/store/useLocaleStore';

/** 最大滑动距离（删除按钮宽度，单位 px） */
const MAX_REVEAL = 80;
/** 露出阈值：松手时若超过该距离则保持露出，否则回弹 */
const REVEAL_THRESHOLD = 40;
/** 视为拖拽的最小水平位移，避免点击误触发 */
const DRAG_SLOP = 4;

/**
 * A single history record card.
 *
 * Layout: colored result dot · result text · relative time · option count,
 * with an expandable section that reveals every option (and marks the winner).
 *
 * 交互：支持左滑露出删除按钮（Pointer Events API），点击删除按钮触发二次确认。
 */
export function HistoryItem({ record }: { record: HistoryRecord }) {
  const [expanded, setExpanded] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const openConfirm = useUIStore((s) => s.openConfirm);
  const addToast = useToastStore((s) => s.addToast);
  const t = useLocaleStore((s) => s.t);

  const options = record.options ?? [];

  // 拖拽上下文：起始坐标、起始位移、是否已进入拖拽
  const dragStart = useRef<{
    x: number;
    base: number;
    pointerId: number;
    moved: boolean;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    // 仅响应主按键（鼠标左键 / 触摸 / 笔）
    if (e.button !== 0) return;
    dragStart.current = {
      x: e.clientX,
      base: translateX,
      pointerId: e.pointerId,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragStart.current) return;
    const deltaX = e.clientX - dragStart.current.x;

    // 等待明确的水平拖拽意图后再捕获指针，避免与子按钮的 click 冲突
    if (!dragStart.current.moved) {
      if (Math.abs(deltaX) < DRAG_SLOP) return;
      dragStart.current.moved = true;
      setDragging(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // 捕获失败可忽略
      }
    }

    // 仅向左滑有效，并限制最大露出距离
    const next = Math.max(
      -MAX_REVEAL,
      Math.min(dragStart.current.base + deltaX, 0),
    );
    setTranslateX(next);
  };

  const finishDrag = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragStart.current) return;
    const moved = dragStart.current.moved;
    dragStart.current = null;

    if (!moved) return; // 视为点击，交给原生 click 处理

    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // 释放捕获失败可忽略
    }
    // 超过阈值保持露出，否则回弹到 0
    setTranslateX((cur) => (cur <= -REVEAL_THRESHOLD ? -MAX_REVEAL : 0));
  };

  const handleDelete = () => {
    const id = record.id;
    if (id === undefined) return;
    openConfirm({
      title: t('history.deleteTitle'),
      description: t('history.deleteDesc'),
      confirmText: t('history.confirmDelete'),
      cancelText: t('history.cancel'),
      onConfirm: () => {
        void historyRepo.remove(id);
        addToast(t('history.deleted'), 'success');
      },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-md)]">
      {/* 底层删除按钮：内容层左滑后露出 */}
      <button
        type="button"
        onClick={handleDelete}
        className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-[var(--color-error)] text-white"
        aria-label={t('history.deleteAria')}
      >
        <Trash2 size={16} strokeWidth={1.75} />
      </button>

      {/* 内容层（可水平滑动） */}
      <article
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        className="relative rounded-[var(--radius-md)] border border-[var(--color-line-300)] bg-[var(--color-paper-50)] p-4 hover:border-[var(--color-brand-300)]"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: dragging
            ? 'none'
            : 'transform 200ms ease-out, border-color 150ms ease',
          touchAction: 'pan-y',
        }}
      >
        <div className="flex items-start gap-3.5">
          {/* result-dot */}
          <span
            className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: record.resultColor || 'var(--color-brand-500)' }}
            aria-hidden
          />

          {/* result-text + meta */}
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[15px] text-[var(--color-ink-800)]"
              style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400 }}
            >
              {record.result}
            </p>
            <div
              className="mt-1.5 flex items-center gap-3 text-[11px] text-[var(--color-ink-400)]"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              <span>{formatTime(record.timestamp)}</span>
              <span aria-hidden>·</span>
              <span>{t('history.optionCount', { count: options.length })}</span>
            </div>
          </div>
        </div>

        {/* expand toggle */}
        {options.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 flex items-center gap-2 text-[11px] text-[var(--color-ink-500)] transition-colors hover:text-[var(--color-brand-500)]"
            style={{ fontFamily: 'var(--font-ui)' }}
            aria-expanded={expanded}
          >
            {expanded ? (
              <ChevronDown size={12} strokeWidth={1.5} />
            ) : (
              <ChevronRight size={12} strokeWidth={1.5} />
            )}
            {expanded ? t('history.collapse') : t('history.expand')}
          </button>
        )}

        {/* expanded options */}
        {expanded && options.length > 0 && (
          <ul
            className="mt-3 flex flex-col gap-2.5 pl-1.5"
            style={{ animation: 'slide-in 180ms ease-out' }}
          >
            {options.map((opt) => {
              const isWinner = opt.text === record.result;
              return (
                <li
                  key={opt.id}
                  className="flex items-center gap-3 text-[12px] text-[var(--color-ink-600)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: opt.color }}
                    aria-hidden
                  />
                  <span className="truncate">{opt.text}</span>
                  {isWinner && (
                    <span
                      className="ml-auto shrink-0 text-[10px] text-[var(--color-brand-500)]"
                      style={{ fontFamily: 'var(--font-ui)' }}
                    >
                      {t('history.winner')}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </div>
  );
}
