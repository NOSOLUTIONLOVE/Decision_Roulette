import { useLocaleStore } from '@/store/useLocaleStore';

export function EditorialHeader() {
  const t = useLocaleStore((s) => s.t);

  return (
    <header className="w-full px-6 lg:px-8 pt-12 pb-8 flex flex-col items-center text-center">
      <div className="flex items-center justify-center gap-2.5">
        <span className="inline-block h-px w-[18px] bg-[var(--color-ink-400)]/70" />
        <p
          className="text-[11px] uppercase tracking-[0.1em] text-[var(--color-ink-400)]"
          style={{ fontFamily: 'var(--font-ui)', fontWeight: 500 }}
        >
          {t('header.eyebrow')}
        </p>
        <span className="inline-block h-px w-[18px] bg-[var(--color-ink-400)]/70" />
      </div>

      <h2 className="sr-only">
        {t('header.title')}
      </h2>
      <p
        className="mt-3 w-full text-center text-[30px] lg:text-[36px] xl:text-[40px] leading-[1.2] text-[var(--color-ink-900)]"
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 400,
          letterSpacing: '-0.01em',
          textWrap: 'balance' as const,
        }}
      >
        {t('header.title')}
      </p>

      <p
        className="mx-auto mt-3 max-w-[32ch] text-center text-[var(--color-ink-600)]"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {t('header.subtitle')}
      </p>
    </header>
  );
}
