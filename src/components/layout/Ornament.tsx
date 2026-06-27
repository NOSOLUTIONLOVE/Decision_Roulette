import { useLocaleStore } from '@/store/useLocaleStore';

interface OrnamentProps {
  hint?: string;
}

export function Ornament({ hint }: OrnamentProps) {
  const t = useLocaleStore((s) => s.t);
  // hint 包含键盘说明，便于无法使用长按的用户（如键盘 / 屏幕阅读器）了解触发方式
  const resolvedHint = hint ?? t('ornament.hint');
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-3">
        <span className="h-px max-w-20 flex-1 bg-[var(--color-line-300)]" />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: '14px',
            color: 'var(--color-ink-500)',
          }}
          aria-hidden="true"
        >
          &#10087;
        </span>
        <span className="h-px max-w-20 flex-1 bg-[var(--color-line-300)]" />
      </div>
      <p
        className="text-[11px] tracking-[0.1em] text-[var(--color-ink-400)]"
        style={{ fontFamily: 'var(--font-ui)', fontWeight: 500 }}
      >
        {resolvedHint}
      </p>
    </div>
  );
}
