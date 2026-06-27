import { Check } from 'lucide-react';
import { THEMES } from '@/lib/themes';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useLocaleStore } from '@/store/useLocaleStore';

/** theme.id → i18n key 映射，用于读取主题本地化名称 */
const THEME_NAME_KEY: Record<string, string> = {
  editorial: 'theme.editorial',
  'neon-night': 'theme.neonNight',
  morandi: 'theme.morandi',
};

/**
 * Three theme thumbnail cards (editorial / neon-night / morandi).
 *
 * The preview swatches intentionally use the theme's literal color values
 * (not CSS variables) so each card renders its own palette regardless of the
 * currently-applied theme. Selection state and text use CSS variables to stay
 * in sync with the active theme.
 */
export function ThemePicker() {
  const themeId = useSettingsStore((s) => s.themeId);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const t = useLocaleStore((s) => s.t);

  return (
    <div className="grid grid-cols-3 gap-3.5">
      {THEMES.map((theme) => {
        const selected = theme.id === themeId;
        const themeName = t(THEME_NAME_KEY[theme.id] ?? 'theme.editorial');
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => setTheme(theme.id)}
            className="relative overflow-hidden rounded-[var(--radius-md)] border-2 p-3 text-left transition-[border-color,background-color]"
            style={{
              borderColor: selected ? 'var(--color-brand-500)' : 'var(--color-line-300)',
              background: theme.bg,
            }}
            aria-pressed={selected}
            aria-label={t('theme.ariaLabel', { name: themeName })}
          >
            {/* brand swatch on elevated surface */}
            <div
              className="mb-3 flex h-12 items-center justify-center rounded-[var(--radius-sm)]"
              style={{ background: theme.bgElevated }}
            >
              <span
                className="h-6 w-6 rounded-full"
                style={{ background: theme.brand }}
                aria-hidden
              />
            </div>

            {/* wheel color dots */}
            <div className="mb-2.5 flex justify-center gap-1">
              {theme.wheelColors.slice(0, 5).map((c, i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: c }}
                  aria-hidden
                />
              ))}
            </div>

            <p
              className="truncate text-center text-[11px]"
              style={{ fontFamily: 'var(--font-ui)', fontWeight: 500, color: theme.textPrimary }}
            >
              {themeName}
            </p>

            {selected && (
              <span
                className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-white"
                style={{ background: 'var(--color-brand-500)' }}
                aria-hidden
              >
                <Check size={10} strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
