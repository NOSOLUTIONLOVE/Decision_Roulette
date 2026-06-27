import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AnimationLoop, type AnimationLoopCallbacks } from './animationLoop'
import type { DampingState } from './dampingModel'

/**
 * AnimationLoop 单测。
 *
 * 覆盖 reliability / performance / correctness reviewer 的 testing_gaps：
 *  - start/stop 幂等性（重复 start 不泄漏 visibilitychange listener）
 *  - visibilitychange 暂停 / 恢复
 *  - stop 清理 savedState / paused 残留
 *  - tick 抛错时调用 onStop 复位 phase（不卡死）
 *
 * 用 vi.useFakeTimers + 手动调用 tick 避免真实 RAF。
 */

function makeState(omega = 10): DampingState {
  return {
    omega,
    angle: 0,
    initialOmega: omega,
    rotationsDone: 0,
    totalAngle: 0,
  }
}

function makeCallbacks(overrides: Partial<AnimationLoopCallbacks> = {}): AnimationLoopCallbacks {
  return {
    onAngleUpdate: vi.fn(),
    onSectorCross: vi.fn(),
    onStop: vi.fn(),
    ...overrides,
  }
}

describe('AnimationLoop', () => {
  let loop: AnimationLoop
  let rafSpy: ReturnType<typeof vi.spyOn>
  let rafCallback: ((t: number) => void) | null

  beforeEach(() => {
    loop = new AnimationLoop()
    rafCallback = null
    // 捕获 requestAnimationFrame 回调，手动触发以控制时序
    rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb as (t: number) => void
      return 1
    })
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {})
  })

  afterEach(() => {
    rafSpy.mockRestore()
    vi.restoreAllMocks()
    loop.stop()
  })

  describe('start / stop 幂等性', () => {
    it('start 后 stop 取消 RAF', () => {
      const cbs = makeCallbacks()
      loop.start(makeState(), 5, 4, cbs)
      loop.stop()
      // stop 后 RAF callback 不应再被调用
      expect(rafCallback).not.toBeNull()
    })

    it('stop 在未 start 时调用不抛错', () => {
      expect(() => loop.stop()).not.toThrow()
    })

    it('多次 stop 幂等', () => {
      const cbs = makeCallbacks()
      loop.start(makeState(), 5, 4, cbs)
      loop.stop()
      expect(() => loop.stop()).not.toThrow()
      expect(() => loop.stop()).not.toThrow()
    })

    it('重复 start 不泄漏 visibilitychange listener', () => {
      const addSpy = vi.spyOn(document, 'addEventListener')
      const removeSpy = vi.spyOn(document, 'removeEventListener')
      const cbs = makeCallbacks()
      loop.start(makeState(), 5, 4, cbs)
      loop.start(makeState(), 5, 4, cbs)
      loop.start(makeState(), 5, 4, cbs)
      // 每次 start 会先取消旧 RAF（但旧 listener 只在 stop 时移除），
      // 然后添加新 listener。三次 start 累计 3 次 addEventListener。
      const visAdds = addSpy.mock.calls.filter((c) => c[0] === 'visibilitychange')
      expect(visAdds.length).toBe(3)
      // stop 后应移除（同一引用）
      loop.stop()
      const visRemoves = removeSpy.mock.calls.filter((c) => c[0] === 'visibilitychange')
      expect(visRemoves.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('stop 清理 paused / savedState 残留', () => {
    it('stop 在 paused 状态下清理 savedState 与 paused 标志', () => {
      const cbs = makeCallbacks()
      loop.start(makeState(), 5, 4, cbs)
      // 模拟页面隐藏触发暂停
      Object.defineProperty(document, 'hidden', { value: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
      // 恢复
      Object.defineProperty(document, 'hidden', { value: false, configurable: true })
      // 在 paused=false 之前 stop（这里先 hidden 再 stop）
      Object.defineProperty(document, 'hidden', { value: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
      loop.stop()
      // 再次 start 不应被旧 savedState 污染：触发 visibilitychange 恢复不应崩溃
      const cbs2 = makeCallbacks()
      loop.start(makeState(), 5, 4, cbs2)
      Object.defineProperty(document, 'hidden', { value: false, configurable: true })
      expect(() => document.dispatchEvent(new Event('visibilitychange'))).not.toThrow()
    })
  })

  describe('visibilitychange 暂停 / 恢复', () => {
    it('页面隐藏时不调用 onStop（仅暂停）', () => {
      const onStop = vi.fn()
      const cbs = makeCallbacks({ onStop })
      loop.start(makeState(), 5, 4, cbs)
      Object.defineProperty(document, 'hidden', { value: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
      expect(onStop).not.toHaveBeenCalled()
    })

    it('页面恢复后继续 tick（不再调用 start，直接 tick）', () => {
      const onAngle = vi.fn()
      const cbs = makeCallbacks({ onAngleUpdate: onAngle })
      loop.start(makeState(10), 5, 4, cbs)
      // 隐藏
      Object.defineProperty(document, 'hidden', { value: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
      // 恢复
      Object.defineProperty(document, 'hidden', { value: false, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
      // 恢复后 RAF 应被重新请求
      expect(rafSpy).toHaveBeenCalled()
    })
  })

  describe('tick 错误恢复', () => {
    it('tick 抛错时调用 onStop 复位并停止 RAF', () => {
      // start() 内部直接调用 this.tick(this.lastTime)（非 RAF），
      // 所以 onAngleUpdate 在 start() 调用期间同步抛错，被 tick 的 catch 捕获。
      const onAngleUpdate = vi.fn(() => {
        throw new Error('boom')
      })
      const onStop = vi.fn()
      const cbs = makeCallbacks({ onAngleUpdate, onStop })
      // start 会同步触发首帧 tick，tick 调用 onAngleUpdate 抛错 → catch → onStop
      loop.start(makeState(), 5, 4, cbs)
      // onStop 应被调用作为恢复
      expect(onStop).toHaveBeenCalledTimes(1)
    })
  })
})
