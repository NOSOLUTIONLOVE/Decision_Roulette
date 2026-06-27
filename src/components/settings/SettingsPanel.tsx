import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { ThemePicker } from './ThemePicker';
import { TextSizeSlider } from './TextSizeSlider';
import { PointerStylePicker } from './PointerStylePicker';
import { useFocusTrap } from '@/hooks/useFocusTrap';

/**
 * Right-side settings drawer.
 *
 * Visibility is driven by `useUIStore.settingsOpen`. Mirrors the HistoryDrawer
 * shell (scrim + panel + `drawer-in`) for a consistent editorial feel, and
 * hosts the theme / text-size / pointer pickers.
 */
export function SettingsPanel() {
  const open = useUIStore((s) => s.settingsOpen);
  const setOpen = useUIStore((s) => s.setSettingsOpen);
  const t = useLocaleStore((s) => s.t);

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
        aria-label={t('settings.close')}
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
        aria-label={t('settings.title')}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-line-300)] px-6 pt-6 pb-4">
          <h2
            className="text-[18px] text-[var(--color-ink-800)]"
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400 }}
          >
            {t('settings.title')}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[var(--color-ink-500)] transition-colors hover:text-[var(--color-brand-500)]"
            aria-label={t('settings.close')}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Sections */}
        <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-6 py-6">
          <Section title={t('settings.themeTitle')} desc={t('settings.themeDesc')}>
            <ThemePicker />
          </Section>
          <Section title={t('settings.textSizeTitle')} desc={t('settings.textSizeDesc')}>
            <TextSizeSlider />
          </Section>
          <Section title={t('settings.pointerTitle')} desc={t('settings.pointerDesc')}>
            <PointerStylePicker />
          </Section>
        </div>
      </aside>
    </div>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-8 last:mb-0">
      <div className="mb-4">
        <h3
          className="text-[13px] text-[var(--color-ink-700)]"
          style={{ fontFamily: 'var(--font-ui)', fontWeight: 500 }}
        >
          {title}
        </h3>
        <p
          className="mt-1 text-[11px] text-[var(--color-ink-400)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {desc}
        </p>
      </div>
      {children}
    </section>
  );
}
