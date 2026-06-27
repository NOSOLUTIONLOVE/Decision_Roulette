import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { captureException } from './lib/monitoring';
import { reportAsyncError } from './components/ui/ErrorBoundary';
import { getThemeColors } from './lib/themes';
import { useLocaleStore } from './store/useLocaleStore';
import './styles/globals.css';

// 从 localStorage 读取已保存的语言偏好，默认中文
useLocaleStore.getState().initLocale();

// 向外部预览/设计工具暴露主题色读取入口，避免其调用 window.getThemeColors?.()
// 时因返回 undefined 而解构 exportedColors 失败。
// index.html 中已通过 Object.defineProperty 注册 getter/setter，直接赋值即可触发 setter
// 更新底层 holder，确保任意读取时机均返回有效函数。
if (typeof window !== 'undefined') {
  window.getThemeColors = getThemeColors;
}

// 全局错误监听：捕获未处理的运行时错误与 Promise 拒绝。
// 同步：captureException 上报（用户同意时发 Sentry）；异步：reportAsyncError 触发 ErrorBoundary 降级 UI。
window.addEventListener('error', (event) => {
  captureException(event.error, {
    type: 'window.error',
    filename: event.filename,
    lineno: event.lineno,
  });
  // 仅当错误有真实堆栈时才翻转 UI，避免无害的资源加载失败（img/script error）误伤
  if (event.error instanceof Error) {
    reportAsyncError(event.error);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  captureException(event.reason, { type: 'unhandledrejection' });
  if (event.reason instanceof Error) {
    reportAsyncError(event.reason);
  }
});

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
