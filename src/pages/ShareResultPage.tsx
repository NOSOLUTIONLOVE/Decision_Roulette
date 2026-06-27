import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Share2,
  Download,
  Copy,
  Check,
  House,
  Sparkles,
  LoaderCircle,
} from 'lucide-react';
import type { Option, DecisionShareData } from '@/types';
import type { WheelConfig } from '@/types/engine';
import { WheelRenderer } from '@/engine/wheel/renderer';
import { decodeShareLink } from '@/lib/shareLink';
import { copyToClipboard } from '@/lib/clipboard';
import { ShareCardRenderer } from '@/engine/share/cardRenderer';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import { useBeforeInstallPrompt } from '@/hooks/useBeforeInstallPrompt';
import { InstallGuide } from '@/components/share/InstallGuide';

/** Static share-result page mounted at `/share?d=…`. */
export default function ShareResultPage() {
  const [params] = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelContainerRef = useRef<HTMLDivElement>(null);
  const t = useLocaleStore((s) => s.t);

  const [data, setData] = useState<DecisionShareData | null>(null);
  const [invalid, setInvalid] = useState(false);

  const [busyImage, setBusyImage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const cssSize = useResponsiveSize(wheelContainerRef, 'width');
  const { installEvent, installed, promptInstall } = useBeforeInstallPrompt();

  const canShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  /* ---- Decode the payload from the URL ---- */
  useEffect(() => {
    const decoded = decodeShareLink(params);
    if (!decoded) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setData(decoded);
  }, [params]);

  /* ---- Render the static wheel once data + fonts are ready ---- */
  useEffect(() => {
    if (!data || cssSize <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    const draw = async () => {
      // Guarantee theme CSS vars exist (page may be opened standalone).
      useSettingsStore.getState().initTheme();
      try {
        await document.fonts.ready;
      } catch {
        /* ignore — draw with fallback fonts */
      }
      if (cancelled) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssSize * dpr);
      canvas.height = Math.round(cssSize * dpr);
      canvas.style.width = `${cssSize}px`;
      canvas.style.height = `${cssSize}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const options: Option[] = data.options.map((o) => ({
        id: o.text,
        text: o.text,
        color: o.color,
      }));
      const n = Math.max(options.length, 1);
      const sectorAngle = (Math.PI * 2) / n;
      const winnerIndex = Math.max(
        0,
        options.findIndex((o) => o.text === data.result),
      );
      const angle = -(winnerIndex * sectorAngle + sectorAngle / 2);

      const config: WheelConfig = {
        size: cssSize,
        textSize: 'medium',
        colors: [],
        highlightSectorIndex: winnerIndex,
        emptyHint: t('wheel.canvasEmptyHint'),
        singleOptionHint: t('wheel.canvasSingleHint'),
      };
      new WheelRenderer(ctx, cssSize).draw(options, config, angle);
    };

    draw();
    return () => {
      cancelled = true;
    };
  }, [data, cssSize, t]);

  const handleSaveImage = async () => {
    if (!data || busyImage) return;
    setBusyImage(true);
    setShareError(null);
    try {
      const renderer = new ShareCardRenderer(
        { options: data.options, result: data.result, resultColor: data.resultColor },
        { textSize: 'medium', tagline: t('shareResult.subtitle') },
      );
      await renderer.download('decision-roulette.png');
    } catch {
      setShareError(t('shareResult.imageFail'));
    } finally {
      setBusyImage(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareError(t('shareResult.copyFail'));
    }
  };

  const handleSocialShare = async () => {
    if (!canShare || !data) return;
    setShareError(null);
    try {
      const renderer = new ShareCardRenderer(
        { options: data.options, result: data.result, resultColor: data.resultColor },
        { textSize: 'medium', tagline: t('shareResult.subtitle') },
      );
      const file = await renderer.toFile('decision-roulette.png');
      const payload = {
        title: t('shareResult.shareTitle'),
        text: t('shareResult.shareText', { result: data.result }),
        url: window.location.href,
      };
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ ...payload, files: [file] });
      } else {
        await navigator.share(payload);
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        setShareError(t('shareResult.socialFail'));
      }
    }
  };

  /* ---- Invalid link state ---- */
  if (invalid) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <Sparkles size={28} className="mb-6 text-[var(--color-brand-500)]" strokeWidth={1.5} />
        <h2
          className="text-[20px] text-[var(--color-ink-800)]"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400 }}
        >
          {t('shareResult.invalidTitle')}
        </h2>
        <p
          className="mt-3 text-[13px] text-[var(--color-ink-500)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('shareResult.invalidDesc')}
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] px-6 py-3.5 text-[14px] text-white transition-colors hover:bg-[var(--color-brand-600)]"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          <House size={16} strokeWidth={1.5} />
          {t('shareResult.cta')}
        </Link>
      </div>
    );
  }

  /* ---- Loading state ---- */
  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <LoaderCircle size={24} className="animate-spin text-[var(--color-brand-500)]" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-5 pb-12 pt-5">
      {/* Eyebrow */}
      <header className="pb-5 text-center">
        <p
          className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-brand-500)]"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          {t('shareResult.eyebrow')}
        </p>
      </header>

      {/* Static wheel */}
      <div
        ref={wheelContainerRef}
        className="mx-auto w-[300px] py-3 lg:w-[460px] xl:w-[500px]"
      >
        <canvas
          ref={canvasRef}
          className="block rounded-full"
          role="img"
          aria-label={t('shareResult.canvasAria')}
        />
      </div>

      {/* Result block */}
      <section className="mt-8 text-center">
        <p
          className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-brand-500)]"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          {t('shareResult.eyebrowLabel')}
        </p>
        <h2
          className="mt-3 break-words text-[34px] lg:text-[44px] leading-tight text-[var(--color-ink-800)]"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400 }}
        >
          {data.result}
        </h2>

        {/* Fleuron */}
        <div className="mt-6 flex items-center justify-center gap-3 text-[var(--color-brand-500)]">
          <span className="h-px w-12 bg-[var(--color-line-400)]" />
          <span style={{ fontFamily: 'var(--font-display)' }} aria-hidden="true">
            &#10086;
          </span>
          <span className="h-px w-12 bg-[var(--color-line-400)]" />
        </div>

        <p
          className="mt-4 text-[12px] text-[var(--color-ink-500)]"
          style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic' }}
        >
          {t('shareResult.subtitle')}
        </p>
      </section>

      {/* Actions */}
      <div className="mt-9 flex flex-col gap-3.5">
        <button
          type="button"
          onClick={handleSaveImage}
          disabled={busyImage}
          className="flex items-center justify-center gap-3 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] px-5 py-4 text-[14px] text-white transition-colors hover:bg-[var(--color-brand-600)] disabled:opacity-50"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          {busyImage ? (
            <LoaderCircle size={18} className="animate-spin" strokeWidth={1.5} />
          ) : (
            <Download size={18} strokeWidth={1.5} />
          )}
          {t('shareResult.saveImage')}
        </button>

        <div className="flex gap-3.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex flex-1 items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-line-300)] bg-[var(--color-paper-50)] px-5 py-4 text-[14px] text-[var(--color-ink-700)] transition-colors hover:border-[var(--color-brand-300)] hover:text-[var(--color-brand-500)]"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {copied ? <Check size={18} strokeWidth={1.5} /> : <Copy size={18} strokeWidth={1.5} />}
            {copied ? t('shareResult.copied') : t('shareResult.copyLink')}
          </button>

          {canShare && (
            <button
              type="button"
              onClick={handleSocialShare}
              className="flex flex-1 items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-line-300)] bg-[var(--color-paper-50)] px-5 py-4 text-[14px] text-[var(--color-ink-700)] transition-colors hover:border-[var(--color-brand-300)] hover:text-[var(--color-brand-500)]"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              <Share2 size={18} strokeWidth={1.5} />
              {t('shareResult.share')}
            </button>
          )}
        </div>
      </div>

      {shareError && (
        <p
          className="mt-4 text-center text-[12px] text-[var(--color-error)]"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          {shareError}
        </p>
      )}

      {/* PWA install guide */}
      <InstallGuide
        installed={installed}
        canPrompt={installEvent !== null}
        onInstall={promptInstall}
      />

      {/* CTA */}
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-line-300)] bg-[var(--color-paper-50)] px-5 py-4 text-[14px] text-[var(--color-ink-700)] transition-colors hover:border-[var(--color-brand-300)] hover:text-[var(--color-brand-500)]"
        style={{ fontFamily: 'var(--font-ui)' }}
      >
        <House size={18} strokeWidth={1.5} />
        {t('shareResult.spinYourself')}
      </Link>
    </div>
  );
}
