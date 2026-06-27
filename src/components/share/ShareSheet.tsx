import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  Share2,
  Download,
  Link as LinkIcon,
  Copy,
  X,
  Check,
  LoaderCircle,
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useWheelStore } from '@/store/useWheelStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { encodeShareLink } from '@/lib/shareLink';
import { copyToClipboard } from '@/lib/clipboard';
import { cn } from '@/lib/utils';
import { useFocusTrap } from '@/hooks/useFocusTrap';

type BusyKind = 'image' | 'link' | 'social' | null;

/**
 * ShareSheet — bottom sheet for sharing the current decision.
 *
 * Controlled by `useUIStore.shareOpen`. Three actions:
 *  - 保存图片 : renders a 1080×1920 share card and downloads it.
 *  - 复制链接 : encodes options+result into `?d=…` and copies the URL.
 *  - 分享到社交: uses the Web Share API (with the card image when supported);
 *               hidden entirely when `navigator.share` is unavailable.
 */
export function ShareSheet() {
  const shareOpen = useUIStore((s) => s.shareOpen);
  const setShareOpen = useUIStore((s) => s.setShareOpen);
  const options = useWheelStore((s) => s.options);
  const result = useWheelStore((s) => s.result);
  const textSize = useSettingsStore((s) => s.textSize);
  const t = useLocaleStore((s) => s.t);

  const [busy, setBusy] = useState<BusyKind>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 跟踪 copied 状态自动重置的定时器，避免 sheet 关闭后 setState
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const containerRef = useFocusTrap<HTMLDivElement>(shareOpen);

  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  // Close on Escape.
  useEffect(() => {
    if (!shareOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShareOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shareOpen, setShareOpen]);

  // Reset transient state whenever the sheet is reopened.
  useEffect(() => {
    if (shareOpen) {
      setBusy(null);
      setCopied(false);
      setError(null);
    }
  }, [shareOpen]);

  // 卸载时清理 copied 定时器
  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== null) {
        clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  if (!shareOpen) return null;

  const resultText = result?.optionText ?? '';
  const hasResult = Boolean(result && resultText);

  const buildCardData = () => ({
    options: options.map((o) => ({ text: o.text, color: o.color })),
    result: resultText,
    resultColor: result?.optionColor ?? 'var(--color-brand-500)',
  });

  const handleSaveImage = async () => {
    if (!hasResult || busy) return;
    setBusy('image');
    setError(null);
    try {
      const { ShareCardRenderer } = await import('@/engine/share/cardRenderer');
      const renderer = new ShareCardRenderer(buildCardData(), {
        textSize,
        tagline: t('shareResult.subtitle'),
      });
      await renderer.download('decision-roulette.png');
    } catch {
      setError(t('share.imageFail'));
    } finally {
      setBusy(null);
    }
  };

  const handleCopyLink = async () => {
    if (!hasResult || busy) return;
    setBusy('link');
    setError(null);
    try {
      const link = encodeShareLink(
        options.map((o) => ({ text: o.text, color: o.color })),
        resultText,
      );
      await copyToClipboard(link);
      setCopied(true);
      if (copiedTimerRef.current !== null) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes('上限')
          ? t('share.linkTooLong')
          : t('share.linkFail'),
      );
    } finally {
      setBusy(null);
    }
  };

  const handleSocialShare = async () => {
    if (!hasResult || !canShare || busy) return;
    setBusy('social');
    setError(null);
    try {
      const { ShareCardRenderer } = await import('@/engine/share/cardRenderer');
      const renderer = new ShareCardRenderer(buildCardData(), {
        textSize,
        tagline: t('shareResult.subtitle'),
      });
      const file = await renderer.toFile('decision-roulette.png');

      const payload = {
        title: t('shareResult.shareTitle'),
        text: t('shareResult.shareText', { result: resultText }),
        url: window.location.href,
      };

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ ...payload, files: [file] });
      } else {
        await navigator.share(payload);
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        setError(t('share.socialFail'));
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-40 backdrop-blur-[6px]"
        style={{
          animation: 'scrim-in 0.2s ease-out',
          backgroundColor: 'rgba(40, 38, 27, 0.28)',
        }}
        onClick={() => setShareOpen(false)}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={containerRef}
        className="desktop-dialog fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] sm:max-w-[560px] overscroll-contain rounded-t-[var(--radius-2xl)] border-t border-[var(--color-line-300)] bg-[var(--color-paper-50)] px-6 pb-7 pt-4 shadow-2xl lg:top-0 lg:my-auto lg:max-w-lg lg:max-h-[85vh] lg:overflow-y-auto lg:rounded-[var(--radius-2xl)] lg:border"
        style={{ animation: 'toast-up 0.3s ease-out' }}
        role="dialog"
        aria-modal="true"
        aria-label={t('share.title')}
      >
        {/* Grab handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-line-400)]" />

        <div className="mb-4 flex items-center justify-between">
          <h3
            className="text-[15px] font-medium text-[var(--color-ink-800)]"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {t('share.title')}
          </h3>
          <button
            onClick={() => setShareOpen(false)}
            className="text-[var(--color-ink-400)] transition-colors hover:text-[var(--color-ink-700)]"
            aria-label={t('share.close')}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <p
          className="mb-6 text-[12px] text-[var(--color-ink-500)]"
          style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic' }}
        >
          {hasResult ? t('share.desc', { result: resultText }) : t('share.descEmpty')}
        </p>

        <div className="flex flex-col gap-3.5">
          <SheetButton
            icon={<Download size={18} strokeWidth={1.5} />}
            label={t('share.saveImage')}
            onClick={handleSaveImage}
            disabled={!hasResult || busy !== null}
            loading={busy === 'image'}
          />

          <SheetButton
            icon={copied ? <Check size={18} strokeWidth={1.5} /> : <Copy size={18} strokeWidth={1.5} />}
            label={copied ? t('share.copied') : t('share.copyLink')}
            onClick={handleCopyLink}
            disabled={!hasResult || busy !== null}
            loading={busy === 'link'}
            accent={copied}
          />

          {canShare && (
            <SheetButton
              icon={<Share2 size={18} strokeWidth={1.5} />}
              label={t('share.socialShare')}
              onClick={handleSocialShare}
              disabled={!hasResult || busy !== null}
              loading={busy === 'social'}
              primary
            />
          )}
        </div>

        {/* Link preview */}
        {hasResult && (
          <div className="mt-4 flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-line-300)] bg-[var(--color-paper-200)] px-4 py-3">
            <LinkIcon size={14} className="shrink-0 text-[var(--color-ink-400)]" strokeWidth={1.5} />
            <span
              className="truncate text-[11px] text-[var(--color-ink-500)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {t('share.linkPreview')}
            </span>
          </div>
        )}

        {error && (
          <p
            className="mt-4 text-[12px] text-[var(--color-error)]"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {error}
          </p>
        )}
      </div>
    </>
  );
}

interface SheetButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  primary?: boolean;
  accent?: boolean;
}

function SheetButton({
  icon,
  label,
  onClick,
  disabled,
  loading,
  primary,
  accent,
}: SheetButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center gap-3 rounded-[var(--radius-md)] border px-5 py-4 text-[14px] transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        primary &&
          'border-transparent bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)]',
        !primary &&
          accent &&
          'border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]',
        !primary &&
          !accent &&
          'border-[var(--color-line-300)] bg-[var(--color-paper-50)] text-[var(--color-ink-700)] hover:border-[var(--color-brand-300)] hover:text-[var(--color-brand-500)]',
      )}
      style={{ fontFamily: 'var(--font-ui)' }}
    >
      {loading ? (
        <LoaderCircle size={18} className="animate-spin" strokeWidth={1.5} />
      ) : (
        icon
      )}
      {label}
    </button>
  );
}
