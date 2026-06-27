import { History, Volume2, VolumeOff, Settings } from 'lucide-react';
import { useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { audioEngine } from '@/engine/audio/audioEngine';
import { LanguageSwitcher } from './LanguageSwitcher';

export function TopNav() {
  const { setHistoryOpen, setSettingsOpen } = useUIStore();
  const { muted, setMuted } = useSettingsStore();
  const t = useLocaleStore((s) => s.t);

  // Sync audio engine mute state with persisted settings on mount / external changes.
  useEffect(() => {
    audioEngine.setMuted(muted);
  }, [muted]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    audioEngine.setMuted(next);
  };

  const btnClass =
    'flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-500)] transition-colors hover:bg-[var(--color-paper-200)] hover:text-[var(--color-brand-500)]';

  return (
    <header className="relative flex items-center justify-center border-b border-[var(--color-line-300)]/60 px-5 lg:px-8 py-3">
      <h1
        className="text-[22px] lg:text-[24px] text-[var(--color-ink-900)]"
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 400,
          letterSpacing: '-0.015em',
        }}
      >
        {t('nav.title')}
      </h1>

      <nav className="absolute right-5 lg:right-8 top-1/2 flex -translate-y-1/2 items-center gap-1">
        <button type="button" onClick={() => setHistoryOpen(true)} className={btnClass} aria-label={t('nav.history')}>
          <History size={18} strokeWidth={1.5} />
        </button>
        <button type="button" onClick={toggleMute} className={btnClass} aria-label={muted ? t('nav.unmute') : t('nav.mute')}>
          {muted ? <VolumeOff size={18} strokeWidth={1.5} /> : <Volume2 size={18} strokeWidth={1.5} />}
        </button>
        <LanguageSwitcher />
        <button type="button" onClick={() => setSettingsOpen(true)} className={btnClass} aria-label={t('nav.settings')}>
          <Settings size={18} strokeWidth={1.5} />
        </button>
      </nav>
    </header>
  );
}
