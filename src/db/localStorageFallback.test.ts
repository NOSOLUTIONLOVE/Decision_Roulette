import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * localStorageFallback 工厂单测。
 *
 * 覆盖 reliability / adversarial reviewer 的 testing_gaps：
 *  - Dexie 失败后降级到 LS（useFallback 翻转）
 *  - LS 写入配额超限（onWriteError 触发）
 *  - markFallback / isDegraded 手动标记
 *  - onDegraded 只触发一次
 *  - onWriteSuccess 在 LS 写入成功后触发
 *
 * jsdom 无 IndexedDB，直接导入 dexie 会得到 isAvailable=false、db=null，
 * 无法测试 dexie 成功 / 失败降级路径。因此用 vi.mock 控制 dexie 导出。
 */

const LS_KEY = 'test-ls-fallback'

// 默认 mock：dexie 可用，db 为可配置 mock 对象
// 每个测试可通过 mockDbFail / mockDbSuccess 控制行为
const mockDb = { _kind: 'mock-db' }
vi.mock('./dexie', () => ({
  isAvailable: true,
  db: mockDb,
}))

// 在 mock 生效后导入
const { createLSFallback } = await import('./localStorageFallback')

describe('createLSFallback', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('read 空时返回空数组', () => {
    const ls = createLSFallback<{ id: number }>({ key: LS_KEY })
    expect(ls.read()).toEqual([])
  })

  it('write 后 read 能还原', () => {
    const ls = createLSFallback<{ id: number }>({ key: LS_KEY })
    expect(ls.write([{ id: 1 }, { id: 2 }])).toBe(true)
    expect(ls.read()).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('onWriteSuccess 在写入成功后被调用', () => {
    const onSuccess = vi.fn()
    const ls = createLSFallback<{ id: number }>({
      key: LS_KEY,
      onWriteSuccess: onSuccess,
    })
    ls.write([{ id: 1 }])
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('LS setItem 抛错时 onWriteError 被调用并返回 false', () => {
    const onError = vi.fn()
    const ls = createLSFallback<{ id: number }>({
      key: LS_KEY,
      onWriteError: onError,
    })
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded', 'QuotaExceededError')
    })
    expect(ls.write([{ id: 1 }])).toBe(false)
    expect(onError).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('withFallback：dexie 成功时不调用 ls 分支', async () => {
    const ls = createLSFallback<{ id: number }>({ key: LS_KEY })
    const dexieFn = vi.fn().mockResolvedValue('from-dexie')
    const lsFn = vi.fn().mockReturnValue('from-ls')
    const result = await ls.withFallback(dexieFn as never, lsFn)
    expect(result).toBe('from-dexie')
    expect(dexieFn).toHaveBeenCalledTimes(1)
    expect(lsFn).not.toHaveBeenCalled()
  })

  it('withFallback：dexie 抛错时降级到 ls 并触发 onDegraded', async () => {
    const onDegraded = vi.fn()
    const ls = createLSFallback<{ id: number }>({
      key: LS_KEY,
      onDegraded,
    })
    const dexieFn = vi.fn().mockRejectedValue(new Error('idb failed'))
    const lsFn = vi.fn().mockReturnValue('from-ls')
    const result = await ls.withFallback(dexieFn as never, lsFn)
    expect(result).toBe('from-ls')
    expect(lsFn).toHaveBeenCalledTimes(1)
    expect(onDegraded).toHaveBeenCalledTimes(1)
    expect(ls.isDegraded()).toBe(true)
  })

  it('onDegraded 只在首次降级时触发一次', async () => {
    const onDegraded = vi.fn()
    const ls = createLSFallback<{ id: number }>({
      key: LS_KEY,
      onDegraded,
    })
    const dexieFn = vi.fn().mockRejectedValue(new Error('idb failed'))
    const lsFn = vi.fn().mockReturnValue('from-ls')
    await ls.withFallback(dexieFn as never, lsFn)
    await ls.withFallback(dexieFn as never, lsFn)
    await ls.withFallback(dexieFn as never, lsFn)
    expect(onDegraded).toHaveBeenCalledTimes(1)
  })

  it('降级后 withFallback 直接走 ls 分支，不再尝试 dexie', async () => {
    const ls = createLSFallback<{ id: number }>({ key: LS_KEY })
    // 先降级
    const dexieFail = vi.fn().mockRejectedValue(new Error('fail'))
    await ls.withFallback(dexieFail as never, () => 'ls-1')
    // 再次调用：应直接走 ls，不调 dexie
    const dexieAgain = vi.fn().mockResolvedValue('should-not-reach')
    const result = await ls.withFallback(dexieAgain as never, () => 'ls-2')
    expect(result).toBe('ls-2')
    expect(dexieAgain).not.toHaveBeenCalled()
  })

  it('markFallback 手动标记降级并触发 onDegraded', () => {
    const onDegraded = vi.fn()
    const ls = createLSFallback<{ id: number }>({
      key: LS_KEY,
      onDegraded,
    })
    // mock 让 isAvailable=true，所以初始未降级
    expect(ls.isDegraded()).toBe(false)
    ls.markFallback()
    expect(ls.isDegraded()).toBe(true)
    expect(onDegraded).toHaveBeenCalledTimes(1)
    // 重复 markFallback 不再触发 onDegraded
    ls.markFallback()
    expect(onDegraded).toHaveBeenCalledTimes(1)
  })

  it('read 在 JSON.parse 失败时返回空数组', () => {
    localStorage.setItem(LS_KEY, '{invalid json')
    const ls = createLSFallback<{ id: number }>({ key: LS_KEY })
    expect(ls.read()).toEqual([])
  })
})
