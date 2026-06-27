import { useSettingsStore } from '@/store/useSettingsStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import type { TextSize } from '@/types';

const OPTIONS: { value: TextSize; label: string; sample: string }[] = [
  { value: 'small', label: 'textSize.small', sample: '15px' },
  { value: 'medium', label: 'textSize.medium', sample: '16px' },
  { value: 'large', label: 'textSize.large', sample: '18px' },
];

/**
 * 三档字号选择器（小 / 中 / 大）。
 * 控制整个网页的字号，通过修改 root font-size 实现。
 */
export function TextSizeSlider() {
  const textSize = useSettingsStore((s) => s.textSize);
  const setTextSize = useSettingsStore((s) => s.setTextSize);
  const t = useLocaleStore((s) => s.t);

  return (
    <div className="flex gap-2 rounded-[var(--radius-md)] bg-[var(--color-paper-200)] p-2">
      {OPTIONS.map((opt) => {
        const selected = opt.value === textSize;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTextSize(opt.value)}
            className="flex flex-1 flex-col items-center gap-2 rounded-[var(--radius-sm)] py-3.5 transition-[background-color,color,box-shadow] active:scale-95"
            style={{
              background: selected ? 'var(--color-paper-50)' : 'transparent',
              color: selected ? 'var(--color-brand-500)' : 'var(--color-ink-500)',
              fontFamily: 'var(--font-ui)',
              fontWeight: 500,
              boxShadow: selected ? '0 1px 3px color-mix(in srgb, var(--color-ink-900) 10%, transparent)' : 'none',
            }}
            aria-pressed={selected}
          >
            <span style={{ fontSize: opt.sample, fontFamily: 'var(--font-display)', lineHeight: 1 }}>Aa</span>
            <span className="text-[10px]">{t(opt.label)}</span>
          </button>
        );
      })}
    </div>
  );
}
