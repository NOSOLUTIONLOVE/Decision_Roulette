import { version } from '../../package.json';

/**
 * 轻量级错误监控抽象层。
 *
 * 设计目标：
 * - 不在主 bundle 中静态引入 Sentry SDK（避免重依赖）。
 * - 通过环境变量 `VITE_SENTRY_DSN` 控制：未配置时所有上报函数为 no-op。
 * - 配置了 DSN 时通过 `await import('@sentry/react')` 动态加载 SDK；
 *   若包未安装则 catch 错误并 console.warn，应用继续运行。
 * - 类型安全：通过 vite-env.d.ts 中的 ambient 模块声明提供兜底类型。
 */

type CaptureLevel = 'info' | 'warning' | 'error';
type MonitoringContext = Record<string, unknown>;

type SentryModule = typeof import('@sentry/react');

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const RELEASE = `decision-roulette@${version}`;

let initialized = false;
let sentry: SentryModule | null = null;

/**
 * 初始化监控。
 *
 * 幂等：重复调用不会重复初始化。
 * 未配置 DSN 时为 no-op；配置了 DSN 但 @sentry/react 未安装时仅打印警告。
 */
export async function initMonitoring(): Promise<void> {
  if (initialized) return;
  initialized = true;

  if (!SENTRY_DSN) {
    return;
  }

  try {
    // 使用变量作为 import() 说明符，使 Vite 无法在构建/转换期静态解析此模块。
    // 仅当 initMonitoring 在运行时实际执行此 import 时，浏览器才会请求 @sentry/react；
    // 若包未安装则 import() reject，由下方 catch 处理，应用继续运行。
    // 类型通过 ambient 声明 + as 断言保证安全。
    const sentryModule = '@sentry/react';
    const Sentry = (await import(/* @vite-ignore */ sentryModule)) as SentryModule;
    sentry = Sentry;
    Sentry.init({
      dsn: SENTRY_DSN,
      release: RELEASE,
      environment: import.meta.env.MODE,
    });
  } catch (error) {
    console.warn(
      '[monitoring] Failed to load @sentry/react. Install it with: npm install @sentry/react',
      error,
    );
  }
}

/**
 * 上报异常。
 *
 * monitoring 未初始化（无 DSN 或 SDK 加载失败）时，仅 console.error。
 * 提供可选 context 时，会通过 Sentry scope.setContext 附加上下文后上报。
 */
export function captureException(error: unknown, context?: MonitoringContext): void {
  const client = sentry;
  if (!client) {
    console.error('[captureException]', error, context);
    return;
  }

  if (context) {
    client.withScope((scope) => {
      for (const [key, value] of Object.entries(context)) {
        scope.setContext(key, { value });
      }
      client.captureException(error);
    });
  } else {
    client.captureException(error);
  }
}

/**
 * 上报消息。
 *
 * monitoring 未初始化时，根据 level 路由到 console.info/warn/error。
 */
export function captureMessage(message: string, level: CaptureLevel = 'info'): void {
  const client = sentry;
  if (!client) {
    const consoleFn =
      level === 'error' ? console.error : level === 'warning' ? console.warn : console.info;
    consoleFn(`[captureMessage:${level}]`, message);
    return;
  }

  client.captureMessage(message, level);
}
