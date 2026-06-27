import type { Option } from '@/types';

const WHEEL_COLORS = [
  'var(--color-wheel-1)',
  'var(--color-wheel-2)',
  'var(--color-wheel-3)',
  'var(--color-wheel-4)',
  'var(--color-wheel-5)',
  'var(--color-wheel-6)',
  'var(--color-wheel-7)',
  'var(--color-wheel-8)',
];

/** Assign colors to options, cycling through the wheel palette */
export function assignColor(index: number): string {
  return WHEEL_COLORS[index % WHEEL_COLORS.length];
}

/** Get the list of wheel color CSS variables */
export function getWheelColors(): string[] {
  return [...WHEEL_COLORS];
}

/** Resolve a CSS color variable to its actual value */
export function resolveColor(color: string): string {
  if (color.startsWith('var(')) {
    const varName = color.match(/var\((--[^)]+)\)/)?.[1];
    if (varName) {
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || color;
    }
  }
  return color;
}

/** Get colors for a list of options */
export function getOptionColors(options: Option[]): string[] {
  return options.map((_, i) => assignColor(i));
}
