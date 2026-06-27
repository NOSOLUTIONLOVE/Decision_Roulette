import { useEffect, useRef } from 'react';

/**
 * 焦点陷阱 hook。
 * - 打开时聚焦容器内首个可聚焦元素
 * - Tab/Shift+Tab 在容器内循环
 * - 关闭时恢复焦点到打开前的元素
 *
 * 每次 Tab 按键时重新查询可聚焦元素，以支持 modal 内的动态内容变化。
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const containerRef = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    // 保存当前焦点
    previousFocusRef.current = document.activeElement as HTMLElement;

    // 延迟一帧聚焦首个可聚焦元素，确保动态内容已渲染
    const rafId = requestAnimationFrame(() => {
      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      focusable[0]?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      // 每次重新查询，以适应 modal 内动态增减的元素
      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('keydown', handleKeyDown);
      // 恢复焦点到打开前的元素
      previousFocusRef.current?.focus();
    };
  }, [active]);

  return containerRef;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
