import { useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useLocaleStore } from '@/store/useLocaleStore';

/**
 * 自定义确认对话框。
 *
 * 视觉风格参考 SavePresetDialog：scrim + 居中卡片 + 暖纸编辑风。
 * 通过 useUIStore 的 openConfirm / closeConfirm 控制，避免使用原生 window.confirm。
 * - 点击 scrim 关闭
 * - 按 Escape 关闭
 * - 确认按钮使用 brand 色，取消按钮使用次级描边样式
 */
export function ConfirmDialog() {
  const config = useUIStore((s) => s.confirmDialog);
  const closeConfirm = useUIStore((s) => s.closeConfirm);
  const t = useLocaleStore((s) => s.t);

  const open = config !== null;

  const containerRef = useFocusTrap<HTMLDivElement>(open);

  // Escape 键关闭
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, closeConfirm]);

  if (!config) return null;

  const { title, description, confirmText = t('confirm.defaultConfirm'), cancelText = t('confirm.defaultCancel'), onConfirm } = config;

  const handleConfirm = () => {
    // 先关闭再触发回调，避免回调中再次 openConfirm 时被清空
    closeConfirm();
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        animation: 'scrim-in 0.2s ease-out',
        background: 'rgba(40,38,27,0.4)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        // 点击 scrim（非卡片区域）关闭
        if (e.target === e.currentTarget) closeConfirm();
      }}
    >
      <div
        ref={containerRef}
        className="mx-6 w-full max-w-[320px] rounded-[var(--radius-lg)] border border-[var(--color-line-300)] bg-[var(--color-paper-50)] p-6 shadow-2xl lg:max-w-md"
        style={{
          animation: 'result-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <h3
          id="confirm-dialog-title"
          className="mb-4 text-[16px] text-[var(--color-ink-900)]"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400 }}
        >
          {title}
        </h3>
        {description ? (
          <p
            className="mb-6 text-[12px] leading-relaxed text-[var(--color-ink-500)]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {description}
          </p>
        ) : null}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={closeConfirm}
            className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-line-400)] py-3 text-[13px] text-[var(--color-ink-600)] transition-colors hover:bg-[var(--color-paper-200)]"
            style={{ fontFamily: 'var(--font-ui)', fontWeight: 500 }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-[var(--radius-sm)] bg-[var(--color-brand-500)] py-3 text-[13px] text-white transition-colors hover:bg-[var(--color-brand-600)]"
            style={{ fontFamily: 'var(--font-ui)', fontWeight: 500 }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
