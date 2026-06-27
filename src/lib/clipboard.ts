/**
 * 复制文本到剪贴板，优先使用现代 Clipboard API，
 * 在不支持的浏览器（如 HTTP 环境 / 旧 Safari）上降级到隐藏 textarea + execCommand。
 *
 * 抽取自 ShareSheet / ShareResultPage 两处完全相同的内联实现。
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}
