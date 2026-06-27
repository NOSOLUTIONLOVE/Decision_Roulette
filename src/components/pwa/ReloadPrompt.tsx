import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import { useLocaleStore } from '@/store/useLocaleStore';

export function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
  } = useRegisterSW();

  const [closed, setClosed] = useState(false);
  const t = useLocaleStore((s) => s.t);

  useEffect(() => {
    if (needRefresh || offlineReady) {
      setClosed(false);
    }
  }, [needRefresh, offlineReady]);

  if (closed || (!needRefresh && !offlineReady)) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
      style={{ animation: 'toast-up 0.3s ease-out' }}
    >
      <div
        className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-line-300)] bg-[var(--color-paper-50)] px-5 py-4 shadow-lg"
        style={{ maxWidth: 'calc(100vw - 32px)' }}
      >
        <RefreshCw size={16} className="text-[var(--color-brand-500)]" strokeWidth={1.5} />
        <div className="flex-1">
          <p
            className="text-[13px] text-[var(--color-ink-700)]"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {needRefresh ? t('pwa.needRefresh') : t('pwa.offlineReady')}
          </p>
        </div>
        {needRefresh && (
          <button
            onClick={() => {
              setNeedRefresh(false);
              location.reload();
            }}
            className="rounded-[var(--radius-sm)] bg-[var(--color-brand-500)] px-4 py-1.5 text-[12px] text-white"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {t('pwa.refresh')}
          </button>
        )}
        <button
          onClick={() => {
            setClosed(true);
            setOfflineReady(false);
            setNeedRefresh(false);
          }}
          className="text-[var(--color-ink-400)]"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
