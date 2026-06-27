import { Component, type ErrorInfo, type ReactNode } from 'react';
import { captureException } from '@/lib/monitoring';
import { useLocaleStore } from '@/store/useLocaleStore';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * 错误边界组件。
 *
 * 捕获子树渲染异常，展示降级 UI（暖纸背景 + display 斜体标题 + brand 色按钮），
 * 让用户可以刷新页面恢复。ErrorBoundary 必须是 class 组件。
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    // 渲染异常时切换到降级 UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    captureException(error, {
      componentStack: errorInfo.componentStack,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const t = useLocaleStore.getState().t;

    return (
      <div
        className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center"
        style={{
          background:
            'radial-gradient(ellipse 100% 60% at 50% 0%, #ffffff 0%, #faf9f5 50%, #f5f4ef 100%)',
        }}
      >
        <h2
          className="mb-3 text-[32px] leading-[1.2] text-[var(--color-ink-900)]"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
          }}
        >
          {t('error.title')}
        </h2>
        <p
          className="mb-6 text-[13px] text-[var(--color-ink-500)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {t('error.desc')}
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          className="rounded-[var(--radius-sm)] bg-[var(--color-brand-500)] px-6 py-2.5 text-[13px] text-white transition-colors hover:bg-[var(--color-brand-600)]"
          style={{ fontFamily: 'var(--font-ui)', fontWeight: 500 }}
        >
          {t('error.reload')}
        </button>
      </div>
    );
  }
}
