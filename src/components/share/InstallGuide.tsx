import { Smartphone } from 'lucide-react';
import { useLocaleStore } from '@/store/useLocaleStore';

interface InstallGuideProps {
  /** 是否已安装 */
  installed: boolean;
  /** 是否捕获到了 beforeinstallprompt 事件（可触发原生安装弹窗） */
  canPrompt: boolean;
  /** 触发安装 */
  onInstall: () => void;
}

/**
 * PWA 安装引导区块 — 在分享页底部展示。
 *
 * 三种状态：
 *   1. 已安装 → 显示成功提示
 *   2. 可触发原生弹窗 → 显示「立即安装」按钮
 *   3. 不支持原生弹窗 → 显示 iOS / Android 手动安装指引
 *
 * 抽取自 ShareResultPage，让页面主体聚焦于结果展示与分享操作。
 */
export function InstallGuide({ installed, canPrompt, onInstall }: InstallGuideProps) {
  const t = useLocaleStore((s) => s.t);

  return (
    <section className="mt-10 rounded-[var(--radius-lg)] border border-[var(--color-line-300)] bg-[var(--color-paper-200)] p-6">
      <div className="mb-4 flex items-center gap-3">
        <Smartphone size={18} className="text-[var(--color-brand-500)]" strokeWidth={1.5} />
        <h3
          className="text-[14px] font-medium text-[var(--color-ink-800)]"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          {t('shareResult.installTitle')}
        </h3>
      </div>

      {installed ? (
        <p
          className="text-[12px] text-[var(--color-success)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('shareResult.installed')}
        </p>
      ) : canPrompt ? (
        <button
          type="button"
          onClick={onInstall}
          className="w-full rounded-[var(--radius-md)] bg-[var(--color-brand-500)] px-5 py-3.5 text-[13px] text-white transition-colors hover:bg-[var(--color-brand-600)]"
          style={{ fontFamily: 'var(--font-ui)' }}
        >
          {t('shareResult.installNow')}
        </button>
      ) : (
        <div
          className="space-y-3 text-[12px] leading-relaxed text-[var(--color-ink-600)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <p>
            <span className="font-medium text-[var(--color-ink-800)]">{t('shareResult.iosLabel')}</span>
            {t('shareResult.iosGuide')}
          </p>
          <p>
            <span className="font-medium text-[var(--color-ink-800)]">{t('shareResult.androidLabel')}</span>
            {t('shareResult.androidGuide')}
          </p>
          <p className="text-[var(--color-ink-500)]" style={{ fontStyle: 'italic' }}>
            {t('shareResult.installHint')}
          </p>
        </div>
      )}
    </section>
  );
}
