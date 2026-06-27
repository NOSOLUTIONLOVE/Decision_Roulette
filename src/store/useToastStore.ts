import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

/** 同时显示的 toast 上限：超过则丢弃最旧的，避免堆叠遮挡 UI */
const MAX_VISIBLE_TOASTS = 3;
/** 单条 toast 自动消失时长（ms） */
const TOAST_TTL_MS = 3000;

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = `toast-${++counter}`;
    set((state) => {
      const next = [...state.toasts, { id, message, type }];
      // 超过上限时裁掉最旧的，保持 UI 干净
      if (next.length > MAX_VISIBLE_TOASTS) {
        next.splice(0, next.length - MAX_VISIBLE_TOASTS);
      }
      return { toasts: next };
    });
    // Auto-remove after TTL
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, TOAST_TTL_MS);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
