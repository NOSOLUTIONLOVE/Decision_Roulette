import { useState, useRef, useCallback, useEffect } from 'react';

const DRAG_THRESHOLD = 5; // px — must move this far to enter drag mode

interface DragState {
  fromIndex: number;
  toIndex: number;
  startY: number;
  isDragging: boolean;
}

interface UseDragReorderResult {
  draggedIndex: number | null;
  hoverIndex: number | null;
  handlePointerDown: (index: number, e: React.PointerEvent) => void;
}

/** Hook for drag-to-reorder using Pointer Events API (no dependencies). */
export function useDragReorder(
  onReorder: (from: number, to: number) => void,
): UseDragReorderResult {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const dragRef = useRef<DragState | null>(null);

  // 组件卸载时若仍在拖拽，恢复 body overflow，避免遗留 hidden 状态
  useEffect(() => {
    return () => {
      if (dragRef.current?.isDragging) {
        document.body.style.overflow = '';
      }
    };
  }, []);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const dy = e.clientY - drag.startY;

      // Check threshold
      if (!drag.isDragging && Math.abs(dy) > DRAG_THRESHOLD) {
        drag.isDragging = true;
        setDraggedIndex(drag.fromIndex);
        document.body.style.overflow = 'hidden';
      }

      if (!drag.isDragging) return;

      // Find target item via elementFromPoint
      const elem = document.elementFromPoint(e.clientX, e.clientY);
      const target = elem?.closest('[data-option-index]') as HTMLElement | null;
      if (target) {
        const targetIndex = parseInt(target.dataset.optionIndex || '-1', 10);
        if (targetIndex >= 0 && targetIndex !== drag.toIndex) {
          drag.toIndex = targetIndex;
          setHoverIndex(targetIndex);
        }
      }
    },
    [],
  );

  const handlePointerUp = useCallback(
    () => {
      const drag = dragRef.current;
      if (!drag) {
        return;
      }

      if (drag.isDragging && drag.fromIndex !== drag.toIndex) {
        onReorder(drag.fromIndex, drag.toIndex);
      }

      dragRef.current = null;
      setDraggedIndex(null);
      setHoverIndex(null);
      document.body.style.overflow = '';

      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    },
    [onReorder, handlePointerMove],
  );

  const handlePointerDown = useCallback(
    (index: number, e: React.PointerEvent) => {
      // Only respond to primary button
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      dragRef.current = {
        fromIndex: index,
        toIndex: index,
        startY: e.clientY,
        isDragging: false,
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointercancel', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp],
  );

  return { draggedIndex, hoverIndex, handlePointerDown };
}
