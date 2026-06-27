import { Languages } from 'lucide-react';
import { useLocaleStore } from '@/store/useLocaleStore';

/**
 * 语言切换按钮：点击在 中文 ↔ 英文 之间切换。
 *
 * 复用 TopNav 现有 btnClass 样式，显示当前语言缩写（中 / EN）。
 * 切换后 zustand state 更新触发所有订阅 t() 的组件重渲染。
 */
export function LanguageSwitcher() {
  const locale = useLocaleStore((s) => s.locale);
  const toggleLocale = useLocaleStore((s) => s.toggleLocale);
  const t = useLocaleStore((s) => s.t);

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-500)] transition-colors hover:bg-[var(--color-paper-200)] hover:text-[var(--color-brand-500)]"
      aria-label={t('lang.switch')}
      title={t('lang.switch')}
    >
      <Languages size={18} strokeWidth={1.5} />
      <span className="sr-only">{locale === 'zh' ? t('lang.zh') : t('lang.en')}</span>
    </button>
  );
}
