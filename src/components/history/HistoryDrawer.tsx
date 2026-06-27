import { useEffect, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { HistoryList } from './HistoryList';
import { PresetList } from './PresetList';
import { useFocusTrap } from '@/hooks/useFocusTrap';

type Tab = 'history' | 'presets';

/**
 * Right-side drawer combining the History and Preset lists.
 *
 * Visibility is driven by `useUIStore.historyOpen`. Reuses the prototype's
 * warm editorial look: paper surface, italic Newsreader title, segmented
 * tabs, `scrim-in` + `drawer-in` animations.
 */
export function HistoryDrawer() {
  const open = useUIStore((s) => s.historyOpen);
  const setOpen = useUIStore((s) => s.setHistoryOpen);
  const t = useLocaleStore((s) => s.t);
  const [tab, setTab] = useState<Tab>('history');

  const containerRef = useFocusTrap<HTMLElement>(open);

  // Close on Escape for keyboard / a11y.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:flex lg:items-center lg:justify-center">
      {/* Scrim */}
      <button
        type="button"
        aria-label={t('history.close')}
        onClick={() => setOpen(false)}
        className="absolute inset-0 z-0 cursor-default backdrop-blur-[6px]"
        style={{
          animation: 'scrim-in 200ms ease-out',
          backgroundColor: 'rgba(40, 38, 27, 0.28)',
        }}
      />

      {/* Panel */}
      <aside
        ref={containerRef}
        className="desktop-dialog absolute right-0 top-0 z-10 flex h-full w-[88%] max-w-[380px] flex-col bg-[var(--color-paper-50)] shadow-2xl lg:relative lg:right-auto lg:top-auto lg:h-auto lg:max-h-[85vh] lg:w-full lg:max-w-lg lg:rounded-[var(--radius-2xl)]"
        style={{ animation: 'drawer-in 280ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        role="dialog"
        aria-modal="true"
        aria-label={t('history.ariaLabel')}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--color-line-300)] px-6 pt-6 pb-4">
          <div className="flex flex-col gap-2">
            <span
              className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-brand-500)]"
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 400 }}
            >
              {t('history.eyebrow')}
            </span>
            <h2
              className="text-[26px] lg:text-[28px] leading-tight text-[var(--color-ink-800)]"
              style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400 }}
            >
              {t('history.title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[var(--color-ink-500)] transition-colors hover:text-[var(--color-brand-500)]"
            aria-label={t('history.close')}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4">
          <div className="flex gap-2 rounded-[var(--radius-md)] bg-[var(--color-paper-200)] p-1.5">
            <TabButton active={tab === 'history'} onClick={() => setTab('history')}>
              {t('history.tabHistory')}
            </TabButton>
            <TabButton active={tab === 'presets'} onClick={() => setTab('presets')}>
              {t('history.tabPresets')}
            </TabButton>
          </div>
        </div>

        {/* Content */}
        <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-6 pb-8">
          {tab === 'history' ? <HistoryList /> : <PresetList />}
        </div>
      </aside>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-[var(--radius-sm)] py-3 text-[13px] transition-[background-color,color,box-shadow]"
      style={{
        fontFamily: 'var(--font-ui)',
        fontWeight: 500,
        background: active ? 'var(--color-paper-50)' : 'transparent',
        color: active ? 'var(--color-brand-500)' : 'var(--color-ink-500)',
        boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
      }}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
