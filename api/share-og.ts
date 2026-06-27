/**
 * Vercel Edge Function — 为 /share 落地页动态注入 OG meta。
 *
 * 社交平台爬虫不执行 JavaScript，纯客户端 SPA 的 /share 路由只能拿到统一的
 * 默认预览。此 Edge Function 在服务端拦截 /share 请求，解码 `d` 查询参数，
 * 把结果相关的 og:title / og:description（以及 twitter:* / canonical）注入
 * 到静态 index.html 中再返回。
 *
 * 说明：
 * - Edge Runtime 只能用 Web 标准 API（Request/Response/URL/fetch/TextDecoder 等），
 *   不能 import src/ 下的浏览器端代码，因此解码逻辑在此独立实现，逻辑与
 *   src/lib/shareLink.ts 保持一致。
 * - 通过 `fetch(new URL('/index.html', request.url))` 从部署自身读取构建产物
 *   （生产环境即 dist/index.html；vercel dev 下即 Vite 服务的 index.html），
 *   无需依赖 Node fs。
 *
 * OG 图：当前阶段复用静态 /og-default.svg。未来可通过独立的
 * api/og-image.ts（使用 @vercel/og 的 ImageResponse）为每个分享结果生成
 * 动态 OG 图，这属于后续优化，本阶段先落地最关键的动态标题/描述注入。
 */

export const config = {
  runtime: 'edge',
};

/** 承载编码 payload 的查询参数名（与 shareLink.ts 保持一致）。 */
const SHARE_QUERY_KEY = 'd';

/** 编码 payload 长度上限——防止 Edge 函数内存峰值/成本放大。 */
const MAX_ENCODED_LENGTH = 4096;

/** 注入到 OG title 的 result 文本截断上限。 */
const MAX_RESULT_LENGTH = 200;

/** 默认 OG 图（静态）。TODO: 后续替换为动态 api/og-image.ts 生成结果。 */
const DEFAULT_OG_IMAGE = '/og-default.svg';

/** 注入到 OG / Twitter description 的固定文案。 */
const SHARE_DESCRIPTION = '用了命运之轮，替我做了选择。来看看结果吧！';

/** 统一返回头：HTML 文档。 */
const HTML_HEADERS: HeadersInit = { 'Content-Type': 'text/html; charset=utf-8' };

interface DecodedShare {
  result: string;
}

/**
 * 解码分享 payload。镜像 src/lib/shareLink.ts 中 encodeBase64Utf8 的逆运算
 * （atob → 重建 UTF-8 字节 → TextDecoder 解码，兼容 CJK / emoji），再做
 * JSON.parse 与结构校验。任何非法输入都返回 null 而非抛错。
 */
function decodeSharePayload(encoded: string): DecodedShare | null {
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const data = JSON.parse(json) as { options?: unknown; result?: unknown };

    // 与 shareLink.ts 的校验保持一致：options 必须是数组，result 必须是字符串。
    if (!data || !Array.isArray(data.options) || typeof data.result !== 'string') {
      return null;
    }
    return { result: data.result };
  } catch {
    return null;
  }
}

/** 转义字符串以安全嵌入 HTML 双引号属性。 */
function escapeHtmlAttr(value: string): string {
  return value
    .replace(/\u0000/g, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** 转义字符串以用于 RegExp 字面量。 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 替换由 `attr="key"` 标识的 meta/link 标签中 `targetAttr` 的值。
 * 匹配限定在单个标签内（[^>] 边界），支持 key 在 target 之前或之后两种
 * 属性顺序。使用替换函数以避免新值中可能出现的 `$` 被当作反向引用。
 */
function replaceTagAttribute(
  html: string,
  tag: 'meta' | 'link',
  attr: 'property' | 'name' | 'rel',
  key: string,
  targetAttr: 'content' | 'href',
  newValue: string,
): string {
  const escapedKey = escapeRegExp(key);
  const escapedValue = escapeHtmlAttr(newValue);

  // 情况一：标识属性出现在目标属性之前（index.html 的实际格式）。
  const keyBefore = new RegExp(
    `(<${tag}\\s+[^>]*?${attr}="${escapedKey}"[^>]*?${targetAttr}=")([^"]*)("[^>]*?>)`,
    'i',
  );
  if (keyBefore.test(html)) {
    return html.replace(keyBefore, (_match, p1: string, _p2: string, p3: string) => `${p1}${escapedValue}${p3}`);
  }

  // 情况二：目标属性出现在标识属性之前（属性顺序变化时的兜底）。
  const keyAfter = new RegExp(
    `(<${tag}\\s+[^>]*?${targetAttr}=")([^"]*)("[^>]*?${attr}="${escapedKey}"[^>]*?>)`,
    'i',
  );
  return html.replace(keyAfter, (_match, p1: string, _p2: string, p3: string) => `${p1}${escapedValue}${p3}`);
}

/** 从部署自身获取静态 index.html（Edge Runtime 无 fs）。失败返回 null。 */
async function fetchIndexHtml(request: Request): Promise<string | null> {
  try {
    const res = await fetch(new URL('/index.html', request.url));
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const encoded = url.searchParams.get(SHARE_QUERY_KEY);

  // 大小限制：防止 atob 内存峰值 / 成本放大。
  if (encoded && encoded.length > MAX_ENCODED_LENGTH) {
    return new Response('Payload Too Large', { status: 413 });
  }

  const decoded = encoded ? decodeSharePayload(encoded) : null;

  const html = await fetchIndexHtml(request);
  if (html === null) {
    // 降级：返回最小静态 HTML 壳，至少让爬虫拿到默认 OG 标签而非 500。
    return new Response(
      '<!DOCTYPE html><html><head><meta property="og:title" content="命运之轮"><meta property="og:description" content="用了命运之轮，替我做了选择。"></head><body></body></html>',
      { headers: HTML_HEADERS },
    );
  }

  // 无 d 参数或解码失败：直接返回原始 index.html（默认 meta），不做替换。
  if (decoded === null) {
    return new Response(html, { headers: HTML_HEADERS });
  }

  const fullUrl = url.toString();
  const safeResult = decoded.result.slice(0, MAX_RESULT_LENGTH);
  const ogTitle = `命运替我决定了：${safeResult}`;

  let out = html;
  out = replaceTagAttribute(out, 'meta', 'property', 'og:title', 'content', ogTitle);
  out = replaceTagAttribute(out, 'meta', 'property', 'og:description', 'content', SHARE_DESCRIPTION);
  out = replaceTagAttribute(out, 'meta', 'name', 'twitter:title', 'content', ogTitle);
  out = replaceTagAttribute(out, 'meta', 'name', 'twitter:description', 'content', SHARE_DESCRIPTION);
  out = replaceTagAttribute(out, 'link', 'rel', 'canonical', 'href', fullUrl);
  // OG 图：暂用默认静态图；未来由 api/og-image.ts 生成动态图后替换此处。
  out = replaceTagAttribute(out, 'meta', 'property', 'og:image', 'content', DEFAULT_OG_IMAGE);
  out = replaceTagAttribute(out, 'meta', 'name', 'twitter:image', 'content', DEFAULT_OG_IMAGE);

  return new Response(out, { headers: HTML_HEADERS });
}
