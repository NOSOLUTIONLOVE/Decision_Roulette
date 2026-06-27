import { create } from 'zustand';
import { type Locale, type TranslationKey, DEFAULT_LOCALE, LOCALE_STORAGE_KEY, translations, interpolate } from '@/lib/i18n';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  /** 翻译函数：读取当前语言字典，缺失时回退中文，再缺失返回 key 本身。
   *  key 类型为 TranslationKey，编译期校验拼写；动态键可显式 as TranslationKey。 */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  /** 启动时从 localStorage 读取已保存的语言偏好 */
  initLocale: () => void;
}

function loadLocale(): Locale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (raw === 'zh' || raw === 'en') return raw;
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE;
}

function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

/**
 * 翻译函数：按当前 locale 查字典。
 *
 * 缺失策略：
 * 1. 当前语言字典命中 → 返回译文
 * 2. 当前语言未命中、中文字典命中 → 回退中文
 * 3. 两者都未命中 → 返回 key 本身（开发期可见，便于发现遗漏）
 */
function translate(locale: Locale, key: TranslationKey, params?: Record<string, string | number>): string {
  const dict = translations[locale];
  const fallback = translations[DEFAULT_LOCALE];
  const raw = dict[key] ?? fallback[key] ?? key;
  return interpolate(raw, params);
}

/**
 * 为指定 locale 创建 t 函数。
 *
 * 关键：每次 locale 变化时返回一个新的函数引用，
 * 这样订阅 `useLocaleStore((s) => s.t)` 的组件才会感知到变化并重渲染。
 * 若 t 引用不变（如直接存 translate(get().locale, ...)），
 * zustand 不会触发订阅 t 的组件更新——这是之前的 bug。
 */
function makeT(locale: Locale) {
  return (key: TranslationKey, params?: Record<string, string | number>) => translate(locale, key, params);
}

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: DEFAULT_LOCALE,

  setLocale: (locale) => {
    persistLocale(locale);
    set({ locale, t: makeT(locale) });
  },

  toggleLocale: () => {
    const next: Locale = get().locale === 'zh' ? 'en' : 'zh';
    persistLocale(next);
    set({ locale: next, t: makeT(next) });
  },

  t: makeT(DEFAULT_LOCALE),

  initLocale: () => {
    const locale = loadLocale();
    set({ locale, t: makeT(locale) });
  },
}));
