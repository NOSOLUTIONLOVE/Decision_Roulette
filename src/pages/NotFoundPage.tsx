import { Link } from 'react-router-dom';
import { House } from 'lucide-react';
import { useLocaleStore } from '@/store/useLocaleStore';

/**
 * 404 兜底页 — 暖纸编辑风格，AppShell 包裹。
 *
 * 居中大字「404」使用 Newsreader italic 赭红色，副文案保持编辑式语调。
 */
export default function NotFoundPage() {
  const t = useLocaleStore((s) => s.t);
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      {/* Big 404 */}
      <p
        className="text-[88px] lg:text-[120px] leading-none text-[var(--color-brand-500)]"
        style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400 }}
        aria-hidden="true"
      >
        404
      </p>

      {/* Fleuron */}
      <div className="mt-6 flex items-center justify-center gap-3 text-[var(--color-brand-500)]">
        <span className="h-px w-12 bg-[var(--color-line-400)]" />
        <span style={{ fontFamily: 'var(--font-display)' }} aria-hidden="true">
          &#10086;
        </span>
        <span className="h-px w-12 bg-[var(--color-line-400)]" />
      </div>

      {/* Sub copy */}
      <h1
        className="mt-6 text-[22px] leading-tight text-[var(--color-ink-800)]"
        style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400 }}
      >
        {t('notFound.title')}
      </h1>
      <p
        className="mt-3 text-[13px] text-[var(--color-ink-500)]"
        style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic' }}
      >
        {t('notFound.desc')}
      </p>

      {/* CTA */}
      <Link
        to="/"
        className="mt-9 inline-flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] px-6 py-3.5 text-[14px] text-white transition-colors hover:bg-[var(--color-brand-600)]"
        style={{ fontFamily: 'var(--font-ui)' }}
      >
        <House size={16} strokeWidth={1.5} />
        {t('notFound.cta')}
      </Link>
    </div>
  );
}
