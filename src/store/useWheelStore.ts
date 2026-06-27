import { create } from 'zustand';
import type { Option } from '@/types';
import type { SpinPhase, SpinResult } from '@/types/engine';
import { generateId } from '@/lib/id';

interface WheelState {
  options: Option[];
  phase: SpinPhase;
  result: SpinResult | null;
  chargeRatio: number;

  addOption: (text: string, color: string) => void;
  addOptionsBulk: (items: { text: string; color: string }[]) => void;
  removeOption: (id: string) => void;
  updateOption: (id: string, text: string) => void;
  reorderOptions: (from: number, to: number) => void;
  loadPreset: (options: Option[]) => void;
  clearOptions: () => void;

  setPhase: (phase: SpinPhase) => void;
  setResult: (result: SpinResult | null) => void;
  setChargeRatio: (ratio: number) => void;
  /** 重置转盘状态（phase/result/chargeRatio），不清空选项 */
  resetSpin: () => void;
}

export const useWheelStore = create<WheelState>((set) => ({
  options: [
    { id: generateId(), text: '火锅', color: 'var(--color-wheel-1)' },
    { id: generateId(), text: '寿司', color: 'var(--color-wheel-2)' },
    { id: generateId(), text: '沙拉', color: 'var(--color-wheel-3)' },
    { id: generateId(), text: '麻辣烫', color: 'var(--color-wheel-4)' },
    { id: generateId(), text: '汉堡', color: 'var(--color-wheel-5)' },
    { id: generateId(), text: '惊喜', color: 'var(--color-wheel-6)' },
  ],
  phase: 'idle',
  result: null,
  chargeRatio: 0,

  addOption: (text, color) =>
    set((s) => ({
      options: [...s.options, { id: generateId(), text, color }],
    })),

  addOptionsBulk: (items) =>
    set((s) => ({
      options: [
        ...s.options,
        ...items.map((item) => ({
          id: generateId(),
          text: item.text,
          color: item.color,
        })),
      ],
    })),

  removeOption: (id) =>
    set((s) => ({ options: s.options.filter((o) => o.id !== id) })),

  updateOption: (id, text) =>
    set((s) => ({
      options: s.options.map((o) => (o.id === id ? { ...o, text } : o)),
    })),

  reorderOptions: (from, to) =>
    set((s) => {
      // 边界与同索引守卫：from/to 必须是有效索引且互不相同
      if (
        !Number.isInteger(from) ||
        !Number.isInteger(to) ||
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= s.options.length ||
        to >= s.options.length
      ) {
        return {};
      }
      const next = [...s.options];
      const [moved] = next.splice(from, 1);
      if (!moved) return {};
      next.splice(to, 0, moved);
      return { options: next };
    }),

  loadPreset: (options) =>
    set({
      // 重新生成 ID，避免与原预设 key 冲突
      options: options.map((o) => ({ ...o, id: generateId() })),
      phase: 'idle',
      result: null,
    }),

  clearOptions: () => set({ options: [], phase: 'idle', result: null }),

  setPhase: (phase) => set({ phase }),
  setResult: (result) => set({ result }),
  setChargeRatio: (chargeRatio) => set({ chargeRatio }),
  resetSpin: () => set({ phase: 'idle', result: null, chargeRatio: 0 }),
}));
