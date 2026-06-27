import { useCallback, useEffect, useState } from 'react';

/** Minimal shape of the `beforeinstallprompt` event (not in lib.dom yet). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * 运行时守卫：验证事件确实带有 prompt / userChoice 字段后再转型，
 * 避免在不支持 PWA 安装的浏览器上误把普通 Event 当作 BeforeInstallPromptEvent。
 */
function isBeforeInstallPromptEvent(e: Event): e is BeforeInstallPromptEvent {
  return (
    'prompt' in e &&
    typeof (e as BeforeInstallPromptEvent).prompt === 'function' &&
    'userChoice' in e
  );
}

export interface BeforeInstallPromptState {
  /** 捕获到的安装提示事件，未触发或已消费时为 null */
  installEvent: BeforeInstallPromptEvent | null;
  /** 应用是否已安装 */
  installed: boolean;
  /** 触发安装提示（消费后清空 installEvent） */
  promptInstall: () => Promise<void>;
}

/**
 * 捕获 PWA `beforeinstallprompt` 事件并暴露触发安装的接口。
 *
 * 抽取自 ShareResultPage：监听 `beforeinstallprompt` 拦截浏览器默认弹窗，
 * 在应用内提供「立即安装」按钮；`appinstalled` 事件标记已安装状态。
 */
export function useBeforeInstallPrompt(): BeforeInstallPromptState {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      if (!isBeforeInstallPromptEvent(e)) return;
      e.preventDefault();
      setInstallEvent(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
    } catch {
      /* user dismissed or prompt unavailable */
    }
    setInstallEvent(null);
  }, [installEvent]);

  return { installEvent, installed, promptInstall };
}
