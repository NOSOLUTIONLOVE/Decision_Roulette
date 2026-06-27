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
 * 异步错误桥接 — 让 ErrorBoundary 能响应 useEffect / 事件回调 / Promise 拒绝中抛出的错误。
 *
 * React 的 ErrorBoundary 仅捕获子树「渲染阶段」异常；async 上下文中的错误需手动上报。
 * main.tsx 的 window error / unhandledrejection 监听器调用 reportAsyncError，
 * 后者通过此回调列表把错误转交给当前挂载的 ErrorBoundary 实例，触发降级 UI。
 */
const asyncErrorSubscribers: Array<(e: Error) => void> = [];

export function reportAsyncError(error: unknown): void {
  const err = error instanceof Error ? error : new Error(String(error));
  // 通知所有订阅的 ErrorBoundary 实例切换到降级 UI
  for (const sub of asyncErrorSubscribers) {
    try {
      sub(err);
    } catch {
      // 订阅方自身抛错时忽略，避免一个失败的 boundary 影响其他订阅者
    }
  }
}

/**
 * 错误边界组件。
 *
 * 捕获子树渲染异常，展示降级 UI（暖纸背景 + display 斜体标题 + brand 色按钮），
 * 让用户可以刷新页面恢复。ErrorBoundary 必须是 class 组件。
 *
 * 通过 reportAsyncError 订阅 async 错误，扩展覆盖范围至 useEffect / 事件回调 / Promise 拒绝。
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

  override componentDidMount(): void {
    // 订阅 async 错误：window error / unhandledrejection 通过 reportAsyncError 转发至此
    const handler = (e: Error): void => {
      this.setState({ hasError: true });
      captureException(e, { source: 'async-bridge' });
    };
    asyncErrorSubscribers.push(handler);
    this.unsubscribe = () => {
      const i = asyncErrorSubscribers.indexOf(handler);
      if (i >= 0) asyncErrorSubscribers.splice(i, 1);
    };
  }

  override componentWillUnmount(): void {
    this.unsubscribe?.();
  }

  private unsubscribe?: () => void;

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    captureException(error, {
      componentStack: errorInfo.componentStack,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  override render() {
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
