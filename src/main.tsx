import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { initMonitoring, captureException } from './lib/monitoring';
import { reportWebVitals } from './lib/analytics';
import { getThemeColors } from './lib/themes';
import { useLocaleStore } from './store/useLocaleStore';
import './styles/globals.css';

// 初始化错误监控（无 DSN 时为 no-op，不阻塞渲染）
initMonitoring();

// 从 localStorage 读取已保存的语言偏好，默认中文
useLocaleStore.getState().initLocale();

// 采集 Web Vitals（未配置分析时退化为 console.debug）
reportWebVitals();

// 向外部预览/设计工具暴露主题色读取入口，避免其调用 window.getThemeColors?.()
// 时因返回 undefined 而解构 exportedColors 失败。
// index.html 中已通过 Object.defineProperty 注册 getter/setter，直接赋值即可触发 setter
// 更新底层 holder，确保任意读取时机均返回有效函数。
if (typeof window !== 'undefined') {
  window.getThemeColors = getThemeColors;
}

// 全局错误监听：捕获未处理的运行时错误与 Promise 拒绝
window.addEventListener('error', (event) => {
  captureException(event.error, {
    type: 'window.error',
    filename: event.filename,
    lineno: event.lineno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  captureException(event.reason, { type: 'unhandledrejection' });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
