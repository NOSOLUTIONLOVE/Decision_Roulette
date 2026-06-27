import { useSettingsStore } from '@/store/useSettingsStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import type { PointerStyle } from '@/types';

const OPTIONS: { value: PointerStyle; label: string }[] = [
  { value: 'triangle', label: 'pointer.triangle' },
  { value: 'circle', label: 'pointer.circle' },
  { value: 'arrow', label: 'pointer.arrow' },
];

/** Inline SVG preview of each pointer style, drawn with the brand color. */
function PointerPreview({ style }: { style: PointerStyle }) {
  const color = 'var(--color-brand-500)';
  if (style === 'triangle') {
    return (
      <svg width="20" height="24" viewBox="0 0 20 24" fill="none" aria-hidden>
        <path d="M10 22 L2 6 L18 6 Z" fill={color} />
      </svg>
    );
  }
  if (style === 'circle') {
    return (
      <svg width="20" height="24" viewBox="0 0 20 24" fill="none" aria-hidden>
        <circle cx="10" cy="10" r="7" fill={color} />
      </svg>
    );
  }
  return (
    <svg width="20" height="24" viewBox="0 0 20 24" fill="none" aria-hidden>
      <path d="M10 22 L4 8 L10 11 L16 8 Z" fill={color} />
      <rect x="9" y="11" width="2" height="9" fill={color} />
    </svg>
  );
}

/**
 * Three picker cards for the top pointer shape (三角 / 圆形 / 箭头),
 * each with a live SVG preview.
 */
export function PointerStylePicker() {
  const pointerStyle = useSettingsStore((s) => s.pointerStyle);
  const setPointerStyle = useSettingsStore((s) => s.setPointerStyle);
  const t = useLocaleStore((s) => s.t);

  return (
    <div className="flex gap-3">
      {OPTIONS.map((opt) => {
        const selected = opt.value === pointerStyle;
        const label = t(opt.label);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setPointerStyle(opt.value)}
            className="flex flex-1 flex-col items-center gap-2.5 rounded-[var(--radius-md)] border-2 py-4 transition-[border-color,background-color]"
            style={{
              borderColor: selected ? 'var(--color-brand-500)' : 'var(--color-line-300)',
              background: selected ? 'var(--color-brand-100)' : 'var(--color-paper-50)',
            }}
            aria-pressed={selected}
            aria-label={t('pointer.ariaLabel', { name: label })}
          >
            <PointerPreview style={opt.value} />
            <span
              className="text-[11px]"
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 500,
                color: selected ? 'var(--color-brand-600)' : 'var(--color-ink-500)',
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
