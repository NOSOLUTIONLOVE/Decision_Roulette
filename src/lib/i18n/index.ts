/**
 * 国际化文案入口 — 组装 zh / en 字典并导出公共 API。
 *
 * 字典按语言拆分到 zh.ts / en.ts，便于查找与维护；
 * 缺失策略：t(key) 在当前语言未命中时回退到 zh，zh 也未命中则返回 key 本身。
 */
import { zh } from './zh';
import { en } from './en';

export type Locale = 'zh' | 'en';

export const DEFAULT_LOCALE: Locale = 'zh';
export const LOCALE_STORAGE_KEY = 'dr-locale';

type Dict = Record<string, string>;

export const translations: Record<Locale, Dict> = { zh, en };

/**
 * 插值：将 {key} 占位符替换为 params 中的值。
 * 例如 t('history.optionCount', { count: 5 }) -> "5 个选项" / "5 options"
 */
export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`,
  );
}

/**
 * 翻译键联合类型 — 从 zh 字典推导，用于 t(key) 的编译期校验。
 *
 * 使用 `keyof typeof translations.zh` 让键集合与字典保持同步：
 * 字典增删键时类型自动更新，调用方拼写错误会在 tsc 阶段暴露。
 */
export type TranslationKey = keyof typeof translations.zh;
