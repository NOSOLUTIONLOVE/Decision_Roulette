import { create } from 'zustand';

/**
 * 确认对话框配置：由调用方提供标题、描述与确认回调。
 */
export interface ConfirmConfig {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

interface UIState {
  historyOpen: boolean;
  settingsOpen: boolean;
  shareOpen: boolean;
  resultOpen: boolean;
  presetDialogOpen: boolean;
  /** 自定义确认对话框配置，为 null 时关闭 */
  confirmDialog: ConfirmConfig | null;

  setHistoryOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setShareOpen: (open: boolean) => void;
  setResultOpen: (open: boolean) => void;
  setPresetDialogOpen: (open: boolean) => void;
  /** 打开确认对话框，传入标题、描述与确认回调 */
  openConfirm: (config: ConfirmConfig) => void;
  /** 关闭确认对话框 */
  closeConfirm: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  historyOpen: false,
  settingsOpen: false,
  shareOpen: false,
  resultOpen: false,
  presetDialogOpen: false,
  confirmDialog: null,

  setHistoryOpen: (historyOpen) => set({ historyOpen }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setShareOpen: (shareOpen) => set({ shareOpen }),
  setResultOpen: (resultOpen) => set({ resultOpen }),
  setPresetDialogOpen: (presetDialogOpen) => set({ presetDialogOpen }),
  openConfirm: (config) => set({ confirmDialog: config }),
  closeConfirm: () => set({ confirmDialog: null }),
  closeAll: () =>
    set({
      historyOpen: false,
      settingsOpen: false,
      shareOpen: false,
      resultOpen: false,
      presetDialogOpen: false,
      confirmDialog: null,
    }),
}));
