import { type ReactNode, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '@/store/useSettingsStore';
import { ToastContainer } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { version } from '../../package.json';

interface AppShellProps {
  children: ReactNode;
}

/** 页脚法律链接区 — 暖纸风格，主内容区底部。 */
function LegalFooter() {
  return (
    <footer
      className="flex flex-shrink-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-[var(--color-line-300)]/40 px-5 py-3 text-[11px] text-[var(--color-ink-400)]"
      style={{ fontFamily: 'var(--font-ui)' }}
    >
      <Link
        to="/privacy"
        className="transition-colors hover:text-[var(--color-brand-500)]"
      >
        隐私政策
      </Link>
      <span aria-hidden="true">·</span>
      <Link
        to="/terms"
        className="transition-colors hover:text-[var(--color-brand-500)]"
      >
        服务条款
      </Link>
      <span aria-hidden="true">·</span>
      <span>v{version}</span>
    </footer>
  );
}

/** App shell — 居中容器，主题背景通过 CSS 变量驱动，自适应 PC/移动端 */
export function AppShell({ children }: AppShellProps) {
  const initTheme = useSettingsStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <>
      {/* Skip-to-content link for keyboard / a11y */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-[var(--color-paper-100)] focus:px-4 focus:py-2 focus:text-[var(--color-ink-900)]"
      >
        跳到主要内容
      </a>
      <main
        id="main-content"
        tabIndex={-1}
        className="app-shell mx-auto flex min-h-[100dvh] w-full max-w-[100%] flex-col relative sm:max-w-[560px] md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl"
        style={{ marginInline: 'auto' }}
      >
        {/* Subtle vignette — 通过 CSS 变量随主题变化 */}
        <div className="app-shell__vignette pointer-events-none absolute inset-0" />
        <div className="relative z-10 flex flex-1 flex-col">
          <ErrorBoundary>{children}</ErrorBoundary>
          <LegalFooter />
        </div>

        {/* Global toast notifications — 保留在 ErrorBoundary 外部，确保错误降级时 toast 仍可用 */}
        <ToastContainer />
      </main>
    </>
  );
}
