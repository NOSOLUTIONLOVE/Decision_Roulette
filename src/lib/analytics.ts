import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';

/**
 * 隐私友好的访问分析接入层。
 *
 * 设计目标（与 monitoring.ts 一致的 no-op 模式）：
 * - 通过环境变量 `VITE_ANALYTICS_DOMAIN` 控制（Plausible 的 domain 参数）。
 * - 未配置时所有上报函数为 no-op，不发起任何网络请求。
 * - 配置后动态注入 Plausible 的 script.js，并通过 window.plausible 上报。
 * - Plausible 不使用 Cookie，不采集 PII，仅记录匿名聚合数据。
 *
 * Web Vitals：使用 web-vitals v5（onCLS / onFCP / onINP / onLCP / onTTFB）。
 * 注：onFID 在 web-vitals v4 起被移除（FID 已废弃，由 INP 取代），
 * 故采用 onFCP（First Contentful Paint）作为补充性能指标。
 */

const ANALYTICS_DOMAIN = import.meta.env.VITE_ANALYTICS_DOMAIN;

let initialized = false;
let consentGranted = false;

/** Plausible 全局函数的可选参数（由 script.js 注入到 window）。 */
interface PlausibleOptions {
  props?: Record<string, string | number | boolean | null | undefined>;
  url?: string;
  referrer?: string;
  device?: string;
  callback?: () => void;
}

declare global {
  interface Window {
    plausible?: (event: string, options?: PlausibleOptions) => void;
  }
}

/** 是否已启用分析（配置了 domain）。 */
export function isAnalyticsEnabled(): boolean {
  return Boolean(ANALYTICS_DOMAIN);
}

/** 设置用户同意状态。仅当 consent=true 时才会注入脚本与上报。 */
export function setAnalyticsConsent(consent: boolean): void {
  consentGranted = consent;
  if (consent) {
    initAnalytics();
  }
}

/**
 * 初始化分析。
 *
 * 幂等：重复调用不会重复注入脚本。
 * 未配置 domain 或未获用户同意时为 no-op。
 */
export function initAnalytics(): void {
  if (initialized) return;
  if (!ANALYTICS_DOMAIN) return;
  if (!consentGranted) return;
  initialized = true;

  // 避免重复注入
  if (document.querySelector('script[data-plausible]')) return;

  const script = document.createElement('script');
  script.defer = true;
  script.async = true;
  script.setAttribute('data-domain', ANALYTICS_DOMAIN);
  script.src = 'https://plausible.io/js/script.js';
  script.crossOrigin = 'anonymous';
  script.setAttribute('data-plausible', '');
  document.head.appendChild(script);
}

/**
 * 记录页面访问。
 *
 * 未配置 domain 或未获同意时为 no-op。Plausible 的 script.js 会自动记录首次访问；
 * SPA 路由切换需手动调用此函数以触发后续 pageview。
 */
export function trackPageview(url?: string): void {
  if (!ANALYTICS_DOMAIN || !consentGranted) return;
  window.plausible?.('pageview', url ? { url } : undefined);
}

/**
 * 自定义事件。未配置 domain 或未获同意时为 no-op。
 */
export function trackEvent(
  name: string,
  props?: Record<string, string | number | boolean>,
): void {
  if (!ANALYTICS_DOMAIN || !consentGranted) return;
  window.plausible?.(name, props ? { props } : undefined);
}

/** 将单个 web-vital 指标上报或 debug 打印。 */
function reportMetric(metric: Metric): void {
  const payload = {
    name: metric.name,
    value: Math.round(metric.value * 1000) / 1000,
    rating: metric.rating,
  };
  if (ANALYTICS_DOMAIN) {
    trackEvent('web-vital', payload);
  } else {
    console.debug('[web-vital]', payload);
  }
}

/**
 * 采集 Web Vitals 指标。
 *
 * 每个指标采集后调用 trackEvent('web-vital', { name, value, rating })；
 * 未配置分析时退化为 console.debug。
 */
export function reportWebVitals(): void {
  onCLS(reportMetric);
  onFCP(reportMetric);
  onINP(reportMetric);
  onLCP(reportMetric);
  onTTFB(reportMetric);
}
