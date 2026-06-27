import { create } from 'zustand';
import type { Settings, TextSize, PointerStyle } from '@/types';
import { DEFAULT_THEME, applyTheme, getTheme } from '@/lib/themes';

const STORAGE_KEY = 'dr-settings';
const MUTE_STORAGE_KEY = 'dr-audio-muted';

// 全局字号映射：通过修改 root font-size 控制整个网页文字大小
const FONT_SIZE_MAP: Record<TextSize, string> = {
  small: '15px',
  medium: '16px',
  large: '18px',
};

function applyTextSize(size: TextSize): void {
  if (typeof document !== 'undefined') {
    document.documentElement.style.fontSize = FONT_SIZE_MAP[size];
  }
}

function loadMuted(): boolean {
  try {
    const raw = localStorage.getItem(MUTE_STORAGE_KEY);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
  } catch {
    // ignore
  }
  return false;
}

function loadSettings(): Settings {
  const muted = loadMuted();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return {
        themeId: parsed.themeId ?? DEFAULT_THEME.id,
        textSize: parsed.textSize ?? 'medium',
        pointerStyle: parsed.pointerStyle ?? 'triangle',
        muted,
        volume: parsed.volume ?? 0.6,
      };
    }
  } catch {
    // ignore
  }
  return {
    themeId: DEFAULT_THEME.id,
    textSize: 'medium',
    pointerStyle: 'triangle',
    muted,
    volume: 0.6,
  };
}

function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

interface SettingsState extends Settings {
  setTheme: (themeId: string) => void;
  setTextSize: (size: TextSize) => void;
  setPointerStyle: (style: PointerStyle) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  initTheme: () => void;
}

const initial = loadSettings();

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...initial,

  setTheme: (themeId) => {
    const theme = getTheme(themeId);
    applyTheme(theme);
    const next = { ...get(), themeId };
    saveSettings(next);
    set({ themeId });
  },

  setTextSize: (textSize) => {
    applyTextSize(textSize);
    const next = { ...get(), textSize };
    saveSettings(next);
    set({ textSize });
  },

  setPointerStyle: (pointerStyle) => {
    const next = { ...get(), pointerStyle };
    saveSettings(next);
    set({ pointerStyle });
  },

  setMuted: (muted) => {
    const next = { ...get(), muted };
    saveSettings(next);
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, String(muted));
    } catch {
      // ignore
    }
    set({ muted });
  },

  setVolume: (volume) => {
    const next = { ...get(), volume };
    saveSettings(next);
    set({ volume });
  },

  initTheme: () => {
    const theme = getTheme(get().themeId);
    applyTheme(theme);
    applyTextSize(get().textSize);
  },
}));
