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

/** captureException 允许的 context 键白名单——防止用户选项文本等 PII 泄露到 Sentry。 */
const ALLOWED_CONTEXT_KEYS = new Set([
  'type',
  'filename',
  'lineno',
  'colno',
  'phase',
  'message',
]);

/** 面包屑分类拒绝列表——过滤可能携带用户数据的面包屑。 */
const DENIED_BREADCRUMB_CATEGORIES = new Set(['ui', 'fetch', 'xhr', 'location']);

/**
 * 初始化监控。
 *
 * 幂等：重复调用不会重复初始化。
 * 未配置 DSN 时为 no-op；配置了 DSN 但 @sentry/react 未安装时仅打印警告。
 * 需用户同意后才执行（通过 setMonitoringConsent 触发）。
 */
export async function initMonitoring(): Promise<void> {
  if (initialized) return;
  initialized = true;

  if (!SENTRY_DSN) {
    return;
  }

  try {
    const sentryModule = '@sentry/react';
    const Sentry = (await import(/* @vite-ignore */ sentryModule)) as SentryModule;
    sentry = Sentry;
    Sentry.init({
      dsn: SENTRY_DSN,
      release: RELEASE,
      environment: import.meta.env.MODE,
      beforeSend(event) {
        // 过滤可能携带用户数据的面包屑。
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.filter(
            (b) => !DENIED_BREADCRUMB_CATEGORIES.has(b.category ?? ''),
          );
        }
        return event;
      },
      beforeBreadcrumb(breadcrumb) {
        if (DENIED_BREADCRUMB_CATEGORIES.has(breadcrumb.category ?? '')) {
          return null;
        }
        return breadcrumb;
      },
    });
  } catch (error) {
    console.warn(
      '[monitoring] Failed to load @sentry/react. Install it with: npm install @sentry/react',
      error,
    );
  }
}

/** 设置用户同意状态。仅当 consent=true 时才初始化监控。 */
export function setMonitoringConsent(consent: boolean): void {
  if (consent) {
    void initMonitoring();
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
    // 仅允许白名单内的 context 键，防止用户选项文本等 PII 泄露。
    const filtered: MonitoringContext = {};
    for (const [key, value] of Object.entries(context)) {
      if (ALLOWED_CONTEXT_KEYS.has(key)) {
        filtered[key] = value;
      }
    }
    client.withScope((scope) => {
      for (const [key, value] of Object.entries(filtered)) {
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
