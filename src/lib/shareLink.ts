import type { Option, DecisionShareData } from '@/types';

/** Query parameter key that carries the encoded share payload. */
const SHARE_QUERY_KEY = 'd';

/** Hard cap on the final share URL length (safe for most messengers / browsers). */
const SHARE_MAX_LENGTH = 2000;

/** Fallback color when the payload lacks a result color. */
const FALLBACK_RESULT_COLOR = 'var(--color-brand-500)';

/**
 * Base64-encode a UTF-8 string safely (handles CJK / emoji).
 * Uses TextEncoder so we never rely on the deprecated `escape` helper.
 */
function encodeBase64Utf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Inverse of {@link encodeBase64Utf8}. */
function decodeBase64Utf8(str: string): string {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Encode the wheel options + winning result into a shareable URL of the form
 * `https://.../share?d=<base64-json>`. Throws if the resulting URL would
 * exceed {@link SHARE_MAX_LENGTH} so callers can surface a friendly error.
 *
 * The result color is derived from the matching option (falling back to the
 * brand color), keeping the call signature minimal: `encodeShareLink(options, result)`.
 */
export function encodeShareLink(
  options: Pick<Option, 'text' | 'color'>[],
  result: string,
): string {
  const matched = options.find((o) => o.text === result);
  const resultColor = matched?.color ?? FALLBACK_RESULT_COLOR;

  const payload: DecisionShareData = { options, result, resultColor };
  const encoded = encodeBase64Utf8(JSON.stringify(payload));

  const url = new URL(window.location.href);
  url.pathname = '/share';
  url.search = '';
  url.hash = '';
  url.searchParams.set(SHARE_QUERY_KEY, encoded);

  const link = url.toString();
  if (link.length > SHARE_MAX_LENGTH) {
    throw new Error(
      `分享链接超出长度上限（${link.length}/${SHARE_MAX_LENGTH} 字符），请减少选项数量或缩短文本。`,
    );
  }
  return link;
}

/**
 * Decode a share payload from a full URL, a `URL` object, or raw
 * `URLSearchParams` (handy for `useSearchParams`). Returns `null` for any
 * malformed / truncated input instead of throwing.
 */
export function decodeShareLink(
  input: string | URL | URLSearchParams,
): DecisionShareData | null {
  try {
    let encoded: string | null;
    if (typeof input === 'string') {
      encoded = new URL(input, window.location.origin).searchParams.get(SHARE_QUERY_KEY);
    } else if (input instanceof URLSearchParams) {
      encoded = input.get(SHARE_QUERY_KEY);
    } else {
      encoded = input.searchParams.get(SHARE_QUERY_KEY);
    }
    if (!encoded) return null;

    const data = JSON.parse(decodeBase64Utf8(encoded)) as Partial<DecisionShareData>;
    if (!data || !Array.isArray(data.options) || typeof data.result !== 'string') {
      return null;
    }

    const options = data.options.filter(
      (o): o is Pick<Option, 'text' | 'color'> =>
        o != null && typeof o.text === 'string' && typeof o.color === 'string',
    );

    return {
      options,
      result: data.result,
      resultColor:
        typeof data.resultColor === 'string' ? data.resultColor : FALLBACK_RESULT_COLOR,
    };
  } catch {
    return null;
  }
}

/** Name of the query parameter that carries the encoded payload. */
export function getShareQueryKey(): string {
  return SHARE_QUERY_KEY;
}

/** Maximum allowed length for a generated share URL. */
export function getShareMaxLength(): number {
  return SHARE_MAX_LENGTH;
}
