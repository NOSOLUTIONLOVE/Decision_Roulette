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
}

/** Share data (renamed to avoid conflict with DOM global ShareData) */
export interface DecisionShareData {
  options: Pick<Option, 'text' | 'color'>[];
  result: string;
  resultColor: string;
}
