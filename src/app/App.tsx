import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { AppShell } from './AppShell';
import { ReloadPrompt } from '@/components/pwa/ReloadPrompt';
import { initAnalytics, trackPageview } from '@/lib/analytics';

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
 * 路由监听组件 — 初始化分析并跟踪路由变化。
 *
 * 必须挂在 `<BrowserRouter>` 内部，以使用 useLocation。
 * initAnalytics 幂等；trackPageview 在每次 pathname 变化时触发。
 */
function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageview(location.pathname);
  }, [location.pathname]);

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
