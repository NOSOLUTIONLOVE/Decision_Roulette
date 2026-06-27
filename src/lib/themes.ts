import type { ThemeDef } from '@/types';

/** 默认暖纸编辑主题（沿用 globals.css 中 :root 的原始值） */
const editorial: ThemeDef = {
  id: 'editorial',
  name: '暖纸编辑',
  bg: '#faf9f5',
  bgElevated: '#ffffff',
  bgSurface: '#f5f4ef',
  textPrimary: '#3d3929',
  textSecondary: '#535146',
  textMuted: '#6e6d68',
  brand: '#c96442',
  brandHover: '#b0562f',
  brandMuted: '#f4e0d5',
  border: '#dad9d4',
  wheelColors: ['#c96442', '#788c5d', '#d6b65a', '#8b6f47', '#9c87f5', '#b05730', '#6b4f3a', '#a89373'],
  isDark: false,
  // ink 色阶（取自 globals.css @theme 原始值）
  ink50: '#f6f5f0',
  ink100: '#ece9de',
  ink200: '#dad9d4',
  ink300: '#c2c0b6',
  ink400: '#9b988c',
  ink500: '#6e6d68',
  ink600: '#535146',
  ink700: '#46443b',
  ink800: '#3d3929',
  ink900: '#28261b',
  // paper 色阶
  paper50: '#ffffff',
  paper100: '#faf9f5',
  paper200: '#f5f4ef',
  paper300: '#ede9de',
  paper400: '#e3e0d4',
  paper500: '#dad9d4',
  // line 色阶
  line200: '#e3e0d4',
  line300: '#dad9d4',
  line400: '#cdcabf',
  line500: '#b4b2a7',
  // brand 色阶
  brand50: '#fbf2ed',
  brand100: '#f4e0d5',
  brand200: '#ebc6b6',
  brand300: '#e0a892',
  brand400: '#d6866a',
  brand500: '#c96442',
  brand600: '#b0562f',
  brand700: '#934828',
  brand800: '#753a22',
  brand900: '#582e1d',
  // 状态色
  success: '#788c5d',
  error: '#d64545',
  warning: '#b88a3e',
};

/** 霓虹夜主题（深色背景 + 高饱和霓虹强调色，文字反相为浅色） */
const neonNight: ThemeDef = {
  id: 'neon-night',
  name: '霓虹夜',
  bg: '#0F0E17',
  bgElevated: '#1A1825',
  bgSurface: '#232036',
  textPrimary: '#FFFFFE',
  textSecondary: '#A7A9BE',
  textMuted: '#A7A9BE',
  brand: '#7C5CFC',
  brandHover: '#6B4CE0',
  brandMuted: '#2E2B3D',
  border: '#2E2B3D',
  wheelColors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF8906', '#E53170', '#7C5CFC', '#00D9A3', '#FF8906'],
  isDark: true,
  // ink 色阶：深色主题下反相，ink-900（主文字）为浅色，ink-50（次级背景）为深色
  ink50: '#1A1825',
  ink100: '#232036',
  ink200: '#2A2740',
  ink300: '#3D3A55',
  ink400: '#7C7E94',
  ink500: '#A7A9BE',
  ink600: '#C5C7DA',
  ink700: '#E8E7EE',
  ink800: '#FFFFFE',
  ink900: '#FFFFFE',
  // paper 色阶：深色主题下越亮越浅的层级反转
  paper50: '#1A1825',
  paper100: '#0F0E17',
  paper200: '#232036',
  paper300: '#2A2740',
  paper400: '#353150',
  paper500: '#454065',
  // line 色阶
  line200: '#2A2740',
  line300: '#2E2B3D',
  line400: '#3D3A55',
  line500: '#5A5778',
  // brand 色阶（紫色霓虹）
  brand50: '#1F1D2D',
  brand100: '#2E2B3D',
  brand200: '#312E45',
  brand300: '#4A4568',
  brand400: '#6B5FDB',
  brand500: '#7C5CFC',
  brand600: '#6B4CE0',
  brand700: '#8E73FF',
  brand800: '#AD95FF',
  brand900: '#C9B8FF',
  // 状态色（深色背景下提高亮度保证可读）
  success: '#4ECDC4',
  error: '#FF6B6B',
  warning: '#FFE66D',
};

/** 莫兰迪主题（低饱和度柔和色调，浅色背景） */
const morandi: ThemeDef = {
  id: 'morandi',
  name: '莫兰迪',
  bg: '#E8E4DC',
  bgElevated: '#F0EDE6',
  bgSurface: '#DFDAD0',
  textPrimary: '#4A4640',
  textSecondary: '#6B6660',
  textMuted: '#8A8580',
  brand: '#A0826D',
  brandHover: '#8B6F5A',
  brandMuted: '#D4C8BC',
  border: '#C8C2B6',
  wheelColors: ['#A0826D', '#8A9A8B', '#B8A07A', '#9B8E7F', '#8B7E8B', '#A89080', '#7A6E5E', '#9E9088'],
  isDark: false,
  // ink 色阶（低饱和暖灰）
  ink50: '#EDEAE3',
  ink100: '#E0DCD3',
  ink200: '#D4CFC4',
  ink300: '#BDB8B0',
  ink400: '#A6A19A',
  ink500: '#8A8580',
  ink600: '#6B6660',
  ink700: '#5C5852',
  ink800: '#4A4640',
  ink900: '#3A3631',
  // paper 色阶（柔和米灰）
  paper50: '#F0EDE6',
  paper100: '#E8E4DC',
  paper200: '#DFDAD0',
  paper300: '#D4CFC4',
  paper400: '#C8C2B6',
  paper500: '#B5AFA2',
  // line 色阶
  line200: '#C8C2B6',
  line300: '#B5AFA2',
  line400: '#A29B8E',
  line500: '#8A8478',
  // brand 色阶（柔和棕调）
  brand50: '#EAE3DC',
  brand100: '#DFD5CB',
  brand200: '#D4C8BC',
  brand300: '#C2A593',
  brand400: '#B29380',
  brand500: '#A0826D',
  brand600: '#8B6F5A',
  brand700: '#7A6049',
  brand800: '#6B5443',
  brand900: '#584637',
  // 状态色（低饱和柔和）
  success: '#8A9A8B',
  error: '#B08080',
  warning: '#B8A07A',
};

export const THEMES: ThemeDef[] = [editorial, neonNight, morandi];

export const DEFAULT_THEME = editorial;

export function getTheme(id: string): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? DEFAULT_THEME;
}

/** 将主题应用到 document root 的 CSS 自定义属性上 */
export function applyTheme(theme: ThemeDef): void {
  const root = document.documentElement;

  // === paper 色阶（背景层级）===
  root.style.setProperty('--color-paper-50', theme.paper50);
  root.style.setProperty('--color-paper-100', theme.paper100);
  root.style.setProperty('--color-paper-200', theme.paper200);
  root.style.setProperty('--color-paper-300', theme.paper300);
  root.style.setProperty('--color-paper-400', theme.paper400);
  root.style.setProperty('--color-paper-500', theme.paper500);

  // === ink 色阶（文字 / 图层）===
  root.style.setProperty('--color-ink-50', theme.ink50);
  root.style.setProperty('--color-ink-100', theme.ink100);
  root.style.setProperty('--color-ink-200', theme.ink200);
  root.style.setProperty('--color-ink-300', theme.ink300);
  root.style.setProperty('--color-ink-400', theme.ink400);
  root.style.setProperty('--color-ink-500', theme.ink500);
  root.style.setProperty('--color-ink-600', theme.ink600);
  root.style.setProperty('--color-ink-700', theme.ink700);
  root.style.setProperty('--color-ink-800', theme.ink800);
  root.style.setProperty('--color-ink-900', theme.ink900);

  // === line 色阶（边框 / 分隔线）===
  root.style.setProperty('--color-line-200', theme.line200);
  root.style.setProperty('--color-line-300', theme.line300);
  root.style.setProperty('--color-line-400', theme.line400);
  root.style.setProperty('--color-line-500', theme.line500);

  // === brand 色阶（品牌主色）===
  root.style.setProperty('--color-brand-50', theme.brand50);
  root.style.setProperty('--color-brand-100', theme.brand100);
  root.style.setProperty('--color-brand-200', theme.brand200);
  root.style.setProperty('--color-brand-300', theme.brand300);
  root.style.setProperty('--color-brand-400', theme.brand400);
  root.style.setProperty('--color-brand-500', theme.brand500);
  root.style.setProperty('--color-brand-600', theme.brand600);
  root.style.setProperty('--color-brand-700', theme.brand700);
  root.style.setProperty('--color-brand-800', theme.brand800);
  root.style.setProperty('--color-brand-900', theme.brand900);

  // === 状态色 ===
  root.style.setProperty('--color-success', theme.success);
  root.style.setProperty('--color-error', theme.error);
  root.style.setProperty('--color-warning', theme.warning);

  // === 轮盘扇区色 ===
  theme.wheelColors.forEach((c, i) => {
    root.style.setProperty(`--color-wheel-${i + 1}`, c);
  });

  // 深色主题标记
  root.classList.toggle('dark', theme.isDark);
}

/**
 * 导出当前主题色盘，供外部预览/调试工具读取。
 * 返回结构满足常见设计工具对 `{ exportedColors }` 的解构约定，
 * 若某 CSS 变量尚未生效则回退到默认主题字面量，避免返回 undefined。
 */
export function getThemeColors(): { exportedColors: Record<string, string> } {
  if (typeof document === 'undefined') {
    return { exportedColors: {} };
  }

  const root = getComputedStyle(document.documentElement);
  const getColor = (name: string, fallback: string): string =>
    root.getPropertyValue(name).trim() || fallback;

  const fallback = DEFAULT_THEME;

  return {
    exportedColors: {
      primary: getColor('--color-brand-500', fallback.brand),
      primaryHover: getColor('--color-brand-600', fallback.brandHover),
      background: getColor('--color-paper-100', fallback.bg),
      surface: getColor('--color-paper-200', fallback.bgSurface),
      elevated: getColor('--color-paper-50', fallback.bgElevated),
      text: getColor('--color-ink-900', fallback.textPrimary),
      textSecondary: getColor('--color-ink-600', fallback.textSecondary),
      textMuted: getColor('--color-ink-500', fallback.textMuted),
      border: getColor('--color-line-300', fallback.border),
      success: getColor('--color-success', fallback.success),
      error: getColor('--color-error', fallback.error),
      warning: getColor('--color-warning', fallback.warning),
    },
  };
}

declare global {
  interface Window {
    getThemeColors: typeof getThemeColors;
  }
}
