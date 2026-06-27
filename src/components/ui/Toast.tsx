import { useToastStore, type ToastType } from '@/store/useToastStore';
import { useLocaleStore } from '@/store/useLocaleStore';

const toastStyles: Record<ToastType, { bg: string; text: string }> = {
  success: { bg: 'var(--color-success)', text: '#fff' },
  error: { bg: 'var(--color-error)', text: '#fff' },
  info: { bg: 'var(--color-ink-800)', text: 'var(--color-paper-50)' },
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);
  const t = useLocaleStore((s) => s.t);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-3"
      aria-label={t('toast.ariaLabel')}
    >
      {toasts.map((toast) => {
        const style = toastStyles[toast.type];
        return (
          <div
            key={toast.id}
            className="pointer-events-auto cursor-pointer rounded-full px-6 py-3.5 text-[13px] shadow-lg"
            style={{
              background: style.bg,
              color: style.text,
              fontFamily: 'var(--font-ui)',
              fontWeight: 500,
              animation: 'toast-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={() => removeToast(toast.id)}
          >
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}
