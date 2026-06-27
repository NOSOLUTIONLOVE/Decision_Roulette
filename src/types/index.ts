/** Option in the wheel */
export interface Option {
  id: string;
  text: string;
  color: string;
}

/** A saved decision result */
export interface HistoryRecord {
  id?: number;
  timestamp: number;
  options: Option[];
  result: string;
  resultColor: string;
  resultOptionId: string;
  theme: string;
}

/** A saved preset of options */
export interface Preset {
  id?: number;
  name: string;
  options: Option[];
  createdAt: number;
}

/** Theme definition */
export interface ThemeDef {
  id: string;
  name: string;
  // 语义别名（向后兼容字段）
  bg: string;
  bgElevated: string;
  bgSurface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  brand: string;
  brandHover: string;
  brandMuted: string;
  border: string;
  wheelColors: string[];
  isDark: boolean;

  // ink 色阶（全套 50~900）—— 对应 --color-ink-* CSS 变量
  ink50: string;
  ink100: string;
  ink200: string;
  ink300: string;
  ink400: string;
  ink500: string;
  ink600: string;
  ink700: string;
  ink800: string;
  ink900: string;
  // paper 色阶（全套 50~500）
  paper50: string;
  paper100: string;
  paper200: string;
  paper300: string;
  paper400: string;
  paper500: string;
  // line 色阶（全套 200~500）
  line200: string;
  line300: string;
  line400: string;
  line500: string;
  // brand 色阶（全套 50~900）
  brand50: string;
  brand100: string;
  brand200: string;
  brand300: string;
  brand400: string;
  brand500: string;
  brand600: string;
  brand700: string;
  brand800: string;
  brand900: string;
  // 状态色
  success: string;
  error: string;
  warning: string;
}

/** Text size setting */
export type TextSize = 'small' | 'medium' | 'large';

/** Pointer style */
export type PointerStyle = 'triangle' | 'circle' | 'arrow';

/** User settings */
export interface Settings {
  themeId: string;
  textSize: TextSize;
  pointerStyle: PointerStyle;
  muted: boolean;
  volume: number;
  analyticsConsent: boolean;
}

/** Share data (renamed to avoid conflict with DOM global ShareData) */
export interface DecisionShareData {
  options: Pick<Option, 'text' | 'color'>[];
  result: string;
  resultColor: string;
}
