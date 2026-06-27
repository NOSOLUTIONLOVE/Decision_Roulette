import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { AppShell } from './AppShell';
import { ReloadPrompt } from '@/components/pwa/ReloadPrompt';
import { trackPageview, setAnalyticsConsent, reportWebVitals } from '@/lib/analytics';
import { setMonitoringConsent } from '@/lib/monitoring';
import { useSettingsStore } from '@/store/useSettingsStore';

const WheelPage = lazy(() => import('@/pages/WheelPage'));
const ShareResultPage = lazy(() => import('@/pages/ShareResultPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

/** Suspense fallback — 居中品牌风 spinner。 */
function Loader() {
  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <LoaderCircle
        size={24}
        className="animate-spin text-[var(--color-brand-500)]"
        strokeWidth={1.5}
      />
    </div>
  );
}

/**
 * 路由监听组件 — 根据用户同意初始化分析/监控，并跟踪路由变化。
 *
 * 必须挂在 `<BrowserRouter>` 内部，以使用 useLocation。
 * analyticsConsent 从 useSettingsStore 读取；仅当用户同意时才注入脚本与上报。
 */
function RouteTracker() {
  const location = useLocation();
  const consent = useSettingsStore((s) => s.analyticsConsent);

  // 同意状态变化时同步到 analytics + monitoring
  useEffect(() => {
    setAnalyticsConsent(consent);
    setMonitoringConsent(consent);
    if (consent) {
      reportWebVitals();
    }
  }, [consent]);

  useEffect(() => {
    if (consent) {
      trackPageview(location.pathname);
    }
  }, [location.pathname, consent]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteTracker />
      <AppShell>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<WheelPage />} />
            <Route path="/share" element={<ShareResultPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <ReloadPrompt />
      </AppShell>
    </BrowserRouter>
  );
}
