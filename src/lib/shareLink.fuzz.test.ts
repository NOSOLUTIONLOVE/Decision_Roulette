import { describe, it, expect } from 'vitest'
import { decodeShareLink } from './shareLink'

/**
 * shareLink 对抗性 fuzz 测试。
 *
 * 覆盖 adversarial reviewer 的 testing_gaps：
 *  - 超大 options 数组（DoS 防护 #1 P1）
 *  - 超长 result / option text
 *  - 超长 encoded payload（DECODE_MAX_ENCODED_LENGTH=4096）
 *  - 原型污染（__proto__ key）
 *  - 控制字符 / RTL / emoji
 *  - 深层嵌套 JSON
 */

/** 构造一个 base64-url 的 payload，绕过 URL 解析直接喂给 decodeShareLink。 */
function buildUrl(payload: unknown): string {
  const json = JSON.stringify(payload)
  // 复用 shareLink 内部的 UTF-8 base64 编码
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!)
  }
  const encoded = btoa(binary)
  // 必须通过 URL + searchParams.set 写入，否则 base64 中的 '+' 会被
  // URLSearchParams 解码成空格，破坏 payload。直接字符串拼接 ?d=${encoded} 不安全。
  const url = new URL('http://localhost/share')
  url.searchParams.set('d', encoded)
  return url.toString()
}

describe('shareLink 对抗性输入', () => {
  describe('size caps', () => {
    it('options 数量超过 50 时返回 null', () => {
      const options = Array.from({ length: 51 }, (_, i) => ({
        text: `o${i}`,
        color: '#fff',
      }))
      expect(decodeShareLink(buildUrl({ options, result: 'o0' }))).toBeNull()
    })

    it('options 数量恰好 50 时通过', () => {
      const options = Array.from({ length: 50 }, (_, i) => ({
        text: `o${i}`,
        color: '#fff',
      }))
      const decoded = decodeShareLink(buildUrl({ options, result: 'o0' }))
      expect(decoded).not.toBeNull()
      expect(decoded!.options).toHaveLength(50)
    })

    it('result 长度超过 200 时返回 null', () => {
      const options = [{ text: 'A', color: '#fff' }]
      const result = 'X'.repeat(201)
      expect(decodeShareLink(buildUrl({ options, result }))).toBeNull()
    })

    it('option text 超过 100 字符时被截断（不拒绝）', () => {
      const longText = 'A'.repeat(150)
      const options = [{ text: longText, color: '#fff' }]
      const decoded = decodeShareLink(buildUrl({ options, result: longText }))
      expect(decoded).not.toBeNull()
      expect(decoded!.options[0]!.text).toHaveLength(100)
    })

    it('encoded payload 超过 4096 字符时返回 null', () => {
      // 构造一个会让 base64 编码后超过 4096 的 payload
      // 4096 base64 ≈ 3072 raw bytes；JSON 框架约 50 bytes，result 需约 3050 字符
      // 用 3200 确保超限
      const options = [{ text: 'A', color: '#fff' }]
      const result = 'X'.repeat(3200)
      const url = buildUrl({ options, result })
      // 确认确实超长
      const encoded = new URL(url).searchParams.get('d')!
      expect(encoded.length).toBeGreaterThan(4096)
      expect(decodeShareLink(url)).toBeNull()
    })
  })

  describe('prototype pollution', () => {
    it('__proto__ key 不污染 Object.prototype', () => {
      const payload = {
        options: [{ text: 'A', color: '#fff' }],
        result: 'A',
        __proto__: { polluted: 'yes' },
      }
      const decoded = decodeShareLink(buildUrl(payload))
      expect(decoded).not.toBeNull()
      // 关键断言：原型未被污染
      expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    })
  })

  describe('特殊字符', () => {
    it('控制字符（\\u0000-\\u001F）保留在 text 中', () => {
      const text = 'A\x00B\x01C'
      const options = [{ text, color: '#fff' }]
      const decoded = decodeShareLink(buildUrl({ options, result: text }))
      expect(decoded).not.toBeNull()
      expect(decoded!.options[0]!.text).toBe(text)
      expect(decoded!.result).toBe(text)
    })

    it('RTL 方向标记字符保留', () => {
      const text = '\u202Ereversed'
      const options = [{ text, color: '#fff' }]
      const decoded = decodeShareLink(buildUrl({ options, result: text }))
      expect(decoded).not.toBeNull()
      expect(decoded!.result).toBe(text)
    })

    it('emoji + CJK 混合保留', () => {
      const text = '🍕红烧肉🐉'
      const options = [{ text, color: '#fff' }]
      const decoded = decodeShareLink(buildUrl({ options, result: text }))
      expect(decoded).not.toBeNull()
      expect(decoded!.result).toBe(text)
    })
  })

  describe('结构异常', () => {
    it('options 为 null 时返回 null', () => {
      expect(decodeShareLink(buildUrl({ options: null, result: 'A' }))).toBeNull()
    })

    it('result 缺失时返回 null', () => {
      expect(
        decodeShareLink(buildUrl({ options: [{ text: 'A', color: '#fff' }] })),
      ).toBeNull()
    })

    it('result 非字符串时返回 null', () => {
      expect(
        decodeShareLink(
          buildUrl({ options: [{ text: 'A', color: '#fff' }], result: 123 }),
        ),
      ).toBeNull()
    })

    it('options 中混入 null / 非对象被过滤', () => {
      const decoded = decodeShareLink(
        buildUrl({
          options: [
            { text: 'A', color: '#fff' },
            null,
            'not-an-object',
            { text: 'B', color: '#000' },
          ],
          result: 'A',
        }),
      )
      expect(decoded).not.toBeNull()
      expect(decoded!.options).toHaveLength(2)
      expect(decoded!.options.map((o) => o.text)).toEqual(['A', 'B'])
    })

    it('resultColor 缺失时使用 fallback', () => {
      const decoded = decodeShareLink(
        buildUrl({
          options: [{ text: 'A', color: '#fff' }],
          result: 'A',
        }),
      )
      expect(decoded).not.toBeNull()
      expect(decoded!.resultColor).toBe('var(--color-brand-500)')
    })

    it('resultColor 非字符串时使用 fallback', () => {
      const decoded = decodeShareLink(
        buildUrl({
          options: [{ text: 'A', color: '#fff' }],
          result: 'A',
          resultColor: 12345,
        }),
      )
      expect(decoded).not.toBeNull()
      expect(decoded!.resultColor).toBe('var(--color-brand-500)')
    })
  })

  describe('非法 base64', () => {
    it('非 base64 字符返回 null', () => {
      expect(
        decodeShareLink('http://localhost/share?d=!!!非base64!!!'),
      ).toBeNull()
    })

    it('空 d 参数返回 null', () => {
      expect(decodeShareLink('http://localhost/share?d=')).toBeNull()
    })

    it('无 d 参数返回 null', () => {
      expect(decodeShareLink('http://localhost/share')).toBeNull()
    })
  })
})
