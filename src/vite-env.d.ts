/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string;
  /** Plausible analytics domain (e.g. "decision-roulette.app"). 未配置时分析函数为 no-op。 */
  readonly VITE_ANALYTICS_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * @sentry/react 的最小类型声明。
 *
 * 仅在 @sentry/react 未安装时作为兜底类型解析；
 * 当实际安装该包后，TypeScript 会优先使用 node_modules 中的真实类型，
 * 本声明不会与之冲突。这样可在「按需动态 import」模式下保持类型安全，
 * 同时避免在未安装 SDK 时出现「Cannot find module」编译错误。
 */
declare module '@sentry/react' {
  export interface Scope {
    setContext(name: string, context: Record<string, unknown> | null): void;
  }

  /** 最小化 Sentry Event 类型 — 仅覆盖 monitoring.ts 中使用到的字段 */
  export interface SentryEvent {
    breadcrumbs?: Array<{ category?: string; message?: string; level?: string }>;
  }

  /** 最小化 Sentry Breadcrumb 类型 */
  export interface Breadcrumb {
    category?: string;
    message?: string;
    level?: string;
  }

  export interface BrowserOptions {
    dsn: string;
    release?: string;
    environment?: string;
    beforeSend?: (event: SentryEvent) => SentryEvent | null;
    beforeBreadcrumb?: (breadcrumb: Breadcrumb) => Breadcrumb | null;
  }

  export function init(options: BrowserOptions): void;
  export function captureException(error: unknown): void;
  export function captureMessage(message: string, level?: string): void;
  export function withScope(callback: (scope: Scope) => void): void;
}
