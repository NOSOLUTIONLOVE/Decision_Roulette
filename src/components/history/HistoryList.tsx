import { Trash2, History as HistoryIcon, LoaderCircle } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';
import * as historyRepo from '@/db/historyRepository';
import { useUIStore } from '@/store/useUIStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { HistoryItem } from './HistoryItem';

/**
 * Scrollable list of spin results, newest first. Backed by the reactive
 * `useHistory` hook so it refreshes automatically when records change.
 */
export function HistoryList() {
  const { data: history, isLoading } = useHistory(100);
  const openConfirm = useUIStore((s) => s.openConfirm);
  const t = useLocaleStore((s) => s.t);

  // 加载中：显示轻量加载提示，避免短暂闪现空状态
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <LoaderCircle
          size={24}
          strokeWidth={1.5}
          className="animate-spin text-[var(--color-ink-300)]"
        />
        <p
          className="mt-4 text-[12px] text-[var(--color-ink-400)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('history.loading')}
        </p>
      </div>
    );
  }

  // 空状态：加载完成但无数据，显示引导文案
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <HistoryIcon size={32} strokeWidth={1.2} className="text-[var(--color-ink-300)]" />
        <p
          className="mt-4 text-[13px] text-[var(--color-ink-500)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('history.empty')}
        </p>
        <p
          className="mt-1.5 text-[11px] text-[var(--color-ink-400)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('history.emptyHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-1.5">
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-400)]"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          {t('history.count', { count: history.length })}
        </span>
        <button
          type="button"
          onClick={() => {
            // 使用自定义确认对话框替代原生 window.confirm
            openConfirm({
              title: t('history.clearTitle'),
              description: t('history.clearDesc'),
              confirmText: t('history.clear'),
              cancelText: t('history.cancel'),
              onConfirm: () => {
                void historyRepo.clear();
              },
            });
          }}
          className="flex items-center gap-2 text-[11px] text-[var(--color-ink-400)] transition-colors hover:text-[var(--color-brand-500)]"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          <Trash2 size={12} strokeWidth={1.5} />
          {t('history.clear')}
        </button>
      </div>

      {history.map((record) => (
        <HistoryItem key={record.id ?? record.timestamp} record={record} />
      ))}
    </div>
  );
}
