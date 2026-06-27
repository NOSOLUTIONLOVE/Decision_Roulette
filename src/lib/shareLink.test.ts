import { describe, it, expect } from 'vitest'
import type { Option } from '@/types'
import {
  encodeShareLink,
  decodeShareLink,
  getShareQueryKey,
  getShareMaxLength,
} from './shareLink'

/**
 * 分享链接编解码测试。
 *
 * 被测模块 `shareLink.ts` 通过 Base64-UTF8 把 { options, result, resultColor }
 * 序列化到 URL 的 `d` 查询参数中。encodeShareLink 读取 window.location.href 作为
 * 基底 URL，decodeShareLink 接收 string | URL | URLSearchParams。
 *
 * jsdom 默认 origin 为 http://localhost/，encode/decode 使用同一 origin，因此
 * 往返测试无需特别设置 location。
 */
describe('shareLink', () => {
  describe('getShareQueryKey / getShareMaxLength', () => {
    it('getShareQueryKey 返回固定的查询参数名 "d"', () => {
      expect(getShareQueryKey()).toBe('d')
    })

    it('getShareMaxLength 返回 2000 字符上限', () => {
      expect(getShareMaxLength()).toBe(2000)
    })
  })

  describe('encodeShareLink / decodeShareLink 往返', () => {
    it('基本往返：encode 后 decode 应还原原始数据', () => {
      const options: Pick<Option, 'text' | 'color'>[] = [
        { text: '吃饭', color: '#c96442' },
        { text: '睡觉', color: '#7e9c8e' },
        { text: '写代码', color: '#3a5a40' },
      ]
      const result = '睡觉'

      const url = encodeShareLink(options, result)
      expect(url).toContain('/share?d=')

      const decoded = decodeShareLink(url)
      expect(decoded).not.toBeNull()
      expect(decoded!.result).toBe('睡觉')
      expect(decoded!.resultColor).toBe('#7e9c8e')
      expect(decoded!.options).toEqual(options)
    })

    it('result 不匹配任何 option 时使用 fallback 颜色', () => {
      const options: Pick<Option, 'text' | 'color'>[] = [
        { text: 'A', color: '#111111' },
      ]
      const url = encodeShareLink(options, '不存在的选项')
      const decoded = decodeShareLink(url)
      expect(decoded).not.toBeNull()
      // FALLBACK_RESULT_COLOR = 'var(--color-brand-500)'
      expect(decoded!.resultColor).toBe('var(--color-brand-500)')
    })

    it('中文支持：含中文选项的编解码', () => {
      const options: Pick<Option, 'text' | 'color'>[] = [
        { text: '红烧肉盖饭', color: '#c96442' },
        { text: '麻辣火锅', color: '#7e9c8e' },
        { text: '日式拉面', color: '#3a5a40' },
      ]
      const url = encodeShareLink(options, '麻辣火锅')
      const decoded = decodeShareLink(url)
      expect(decoded!.options.map((o) => o.text)).toEqual([
        '红烧肉盖饭',
        '麻辣火锅',
        '日式拉面',
      ])
      expect(decoded!.result).toBe('麻辣火锅')
    })

    it('emoji 支持：含 emoji 的编解码', () => {
      const options: Pick<Option, 'text' | 'color'>[] = [
        { text: '🍕披萨', color: '#c96442' },
        { text: '🍜拉面', color: '#7e9c8e' },
        { text: '🍔汉堡', color: '#3a5a40' },
        { text: '🐉龙年限定', color: '#9b5de5' },
      ]
      const url = encodeShareLink(options, '🐉龙年限定')
      const decoded = decodeShareLink(url)
      expect(decoded!.options.map((o) => o.text)).toEqual([
        '🍕披萨',
        '🍜拉面',
        '🍔汉堡',
        '🐉龙年限定',
      ])
      expect(decoded!.result).toBe('🐉龙年限定')
      expect(decoded!.resultColor).toBe('#9b5de5')
    })

    it('超长文本：较长 payload 仍能成功编码并往返', () => {
      // 单个选项 + 150 字符 ASCII 长文本（decode 限制 result <= 200、option.text 截断到 100）。
      // URL 前缀 http://localhost/share?d= 约 24 字符，base64 部分约 500 字符，
      // 总 URL ~530 字符，低于 2000 上限。
      const longText = 'A'.repeat(150)
      const options: Pick<Option, 'text' | 'color'>[] = [
        { text: longText, color: '#000000' },
      ]
      const url = encodeShareLink(options, longText)
      expect(url.length).toBeLessThanOrEqual(getShareMaxLength())
      expect(url.length).toBeGreaterThan(300) // 确实是长文本
      const decoded = decodeShareLink(url)
      expect(decoded).not.toBeNull()
      // option.text 被 decode 截断到 100 字符
      expect(decoded!.options[0]!.text).toBe('A'.repeat(100))
      // result 不截断（150 < 200）
      expect(decoded!.result).toBe(longText)
    })

    it('超过 2000 字符上限时 encode 应抛错', () => {
      // 构造明显超过上限的 payload
      const hugeText = 'X'.repeat(2000)
      const options: Pick<Option, 'text' | 'color'>[] = [
        { text: hugeText, color: '#000000' },
      ]
      expect(() => encodeShareLink(options, hugeText)).toThrowError(
        /分享链接超出长度上限/,
      )
    })

    it('空选项数组：encode/decode 应正常工作', () => {
      const options: Pick<Option, 'text' | 'color'>[] = []
      const url = encodeShareLink(options, '无匹配结果')
      const decoded = decodeShareLink(url)
      expect(decoded).not.toBeNull()
      expect(decoded!.options).toEqual([])
      expect(decoded!.result).toBe('无匹配结果')
      // 空 options 也走 fallback 颜色
      expect(decoded!.resultColor).toBe('var(--color-brand-500)')
    })

    it('边界：单个选项的编解码', () => {
      const options: Pick<Option, 'text' | 'color'>[] = [
        { text: '唯一选项', color: '#abcdef' },
      ]
      const url = encodeShareLink(options, '唯一选项')
      const decoded = decodeShareLink(url)
      expect(decoded!.options).toHaveLength(1)
      expect(decoded!.options[0]!.text).toBe('唯一选项')
      expect(decoded!.result).toBe('唯一选项')
      expect(decoded!.resultColor).toBe('#abcdef')
    })

    it('边界：多个选项（20 个）的编解码', () => {
      const options: Pick<Option, 'text' | 'color'>[] = Array.from(
        { length: 20 },
        (_, i) => ({ text: `选项${i + 1}`, color: `#${i.toString(16).padStart(6, '0')}` }),
      )
      const url = encodeShareLink(options, '选项10')
      const decoded = decodeShareLink(url)
      expect(decoded!.options).toHaveLength(20)
      expect(decoded!.options[9]!.text).toBe('选项10')
      expect(decoded!.result).toBe('选项10')
    })
  })

  describe('decodeShareLink 容错', () => {
    it('非法 base64 字符串应返回 null（不抛错）', () => {
      const url = `http://localhost/share?d=${encodeURIComponent('!!!非base64!!!')}`
      expect(decodeShareLink(url)).toBeNull()
    })

    it('截断的 base64 应返回 null', () => {
      // 合法 base64 起始但被截断
      const url = 'http://localhost/share?d=eyJoZWxsbyI6'
      expect(decodeShareLink(url)).toBeNull()
    })

    it('JSON 结构不匹配（缺少 result）应返回 null', () => {
      // 构造一个合法 base64 但 JSON 缺少 result 字段
      const payload = JSON.stringify({ options: [{ text: 'A', color: '#fff' }] })
      const encoded = btoa(
        Array.from(new TextEncoder().encode(payload))
          .map((b) => String.fromCharCode(b))
          .join(''),
      )
      const url = `http://localhost/share?d=${encoded}`
      expect(decodeShareLink(url)).toBeNull()
    })

    it('JSON 结构不匹配（options 非数组）应返回 null', () => {
      const payload = JSON.stringify({ options: 'not-an-array', result: 'x' })
      const encoded = btoa(
        Array.from(new TextEncoder().encode(payload))
          .map((b) => String.fromCharCode(b))
          .join(''),
      )
      const url = `http://localhost/share?d=${encoded}`
      expect(decodeShareLink(url)).toBeNull()
    })

    it('options 中混入非法条目应被过滤', () => {
      // options 中含一条缺 color 的条目，应被 decode 过滤掉
      const payload = JSON.stringify({
        options: [
          { text: 'A', color: '#fff' },
          { text: 'B' /* 缺 color */ },
          { color: '#000' /* 缺 text */ },
          null,
        ],
        result: 'A',
        resultColor: '#fff',
      })
      const encoded = btoa(
        Array.from(new TextEncoder().encode(payload))
          .map((b) => String.fromCharCode(b))
          .join(''),
      )
      const url = `http://localhost/share?d=${encoded}`
      const decoded = decodeShareLink(url)
      expect(decoded).not.toBeNull()
      expect(decoded!.options).toEqual([{ text: 'A', color: '#fff' }])
    })

    it('resultColor 缺失时使用 fallback 颜色', () => {
      const payload = JSON.stringify({
        options: [{ text: 'A', color: '#fff' }],
        result: 'A',
      })
      const encoded = btoa(
        Array.from(new TextEncoder().encode(payload))
          .map((b) => String.fromCharCode(b))
          .join(''),
      )
      const url = `http://localhost/share?d=${encoded}`
      const decoded = decodeShareLink(url)
      expect(decoded).not.toBeNull()
      expect(decoded!.resultColor).toBe('var(--color-brand-500)')
    })

    it('无 d 参数的 URL 应返回 null', () => {
      expect(decodeShareLink('http://localhost/share')).toBeNull()
      expect(decodeShareLink('http://localhost/share?other=abc')).toBeNull()
    })

    it('接受 URL 对象作为输入', () => {
      const options: Pick<Option, 'text' | 'color'>[] = [
        { text: 'A', color: '#fff' },
      ]
      const urlStr = encodeShareLink(options, 'A')
      const url = new URL(urlStr)
      const decoded = decodeShareLink(url)
      expect(decoded).not.toBeNull()
      expect(decoded!.result).toBe('A')
    })

    it('接受 URLSearchParams 作为输入', () => {
      const options: Pick<Option, 'text' | 'color'>[] = [
        { text: 'A', color: '#fff' },
      ]
      const urlStr = encodeShareLink(options, 'A')
      const params = new URL(urlStr).searchParams
      const decoded = decodeShareLink(params)
      expect(decoded).not.toBeNull()
      expect(decoded!.result).toBe('A')
    })

    it('相对 URL 字符串应以当前 origin 解析', () => {
      const options: Pick<Option, 'text' | 'color'>[] = [
        { text: 'A', color: '#fff' },
      ]
      const urlStr = encodeShareLink(options, 'A')
      // 提取相对路径 /share?d=...
      const relative = urlStr.slice(new URL(urlStr).origin.length)
      const decoded = decodeShareLink(relative)
      expect(decoded).not.toBeNull()
      expect(decoded!.result).toBe('A')
    })
  })
})
