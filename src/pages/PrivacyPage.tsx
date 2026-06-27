import { Link } from 'react-router-dom';
import { House } from 'lucide-react';
import { useLocaleStore } from '@/store/useLocaleStore';

/**
 * 隐私政策页面 — 暖纸编辑风格，AppShell 包裹。
 *
 * 阐明本地存储策略、不追踪 Cookie、可选匿名聚合分析等内容。
 */
export default function PrivacyPage() {
  const t = useLocaleStore((s) => s.t);
  return (
    <div className="flex flex-1 flex-col px-6 pb-12 pt-6">
      {/* Eyebrow */}
      <header className="pb-4 text-center">
        <p
          className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-brand-500)]"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          {t('privacy.eyebrow')}
        </p>
        <h1
          className="mt-1.5 text-[28px] leading-tight text-[var(--color-ink-900)]"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400 }}
        >
          {t('privacy.title')}
        </h1>
        {/* Fleuron divider */}
        <div className="mt-4 flex items-center justify-center gap-3 text-[var(--color-brand-500)]">
          <span className="h-px w-10 bg-[var(--color-line-400)]" />
          <span style={{ fontFamily: 'var(--font-display)' }} aria-hidden="true">
            &#10086;
          </span>
          <span className="h-px w-10 bg-[var(--color-line-400)]" />
        </div>
      </header>

      {/* Body */}
      <article
        className="mx-auto max-w-prose space-y-8 text-[13px] lg:text-[14px] leading-relaxed text-[var(--color-ink-700)]"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <section>
          <h2
            className="mb-2.5 text-[15px] font-medium text-[var(--color-ink-900)]"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {t('privacy.section1Title')}
          </h2>
          <p>
            {t('privacy.section1Body')}
          </p>
        </section>

        <section>
          <h2
            className="mb-2.5 text-[15px] font-medium text-[var(--color-ink-900)]"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {t('privacy.section2Title')}
          </h2>
          <p>
            {t('privacy.section2Body')}
          </p>
        </section>

        <section>
          <h2
            className="mb-2.5 text-[15px] font-medium text-[var(--color-ink-900)]"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {t('privacy.section3Title')}
          </h2>
          <p>
            {t('privacy.section3Body')}
          </p>
        </section>

        <section>
          <h2
            className="mb-2.5 text-[15px] font-medium text-[var(--color-ink-900)]"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {t('privacy.section4Title')}
          </h2>
          <p>
            {t('privacy.section4Body')}
          </p>
        </section>

        <section>
          <h2
            className="mb-2.5 text-[15px] font-medium text-[var(--color-ink-900)]"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {t('privacy.section5Title')}
          </h2>
          <p>
            {t('privacy.section5Body')}{' '}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer noopener"
              className="text-[var(--color-brand-500)] underline decoration-[var(--color-brand-300)] underline-offset-2 transition-colors hover:text-[var(--color-brand-600)]"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              {t('privacy.section5Link')}
            </a>{' '}
            {t('privacy.section5Tail')}
          </p>
        </section>

        <section>
          <h2
            className="mb-2.5 text-[15px] font-medium text-[var(--color-ink-900)]"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {t('privacy.section6Title')}
          </h2>
          <p>
            {t('privacy.section6Body')}
          </p>
        </section>
      </article>

      {/* CTA */}
      <Link
        to="/"
        className="mt-10 inline-flex items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-line-300)] bg-[var(--color-paper-50)] px-5 py-4 text-[14px] text-[var(--color-ink-700)] transition-colors hover:border-[var(--color-brand-300)] hover:text-[var(--color-brand-500)]"
        style={{ fontFamily: 'var(--font-ui)' }}
      >
        <House size={18} strokeWidth={1.5} />
        {t('privacy.cta')}
      </Link>
    </div>
  );
}
