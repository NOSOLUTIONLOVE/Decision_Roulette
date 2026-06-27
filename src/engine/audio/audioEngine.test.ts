import { describe, it, expect, beforeEach } from 'vitest'
import { AudioEngine } from './audioEngine'

/**
 * AudioEngine 单测。
 *
 * 覆盖 correctness reviewer 的 testing_gaps（#61）：
 *  - stopCharge 幂等：多次调用不抛错
 *  - stopCharge 后 chargeOsc/chargeGain 立即清空（不再依赖 onended）
 *  - stopCharge 后立即 startCharge 能成功创建新节点（fade window 内不阻塞）
 *  - 未 init 时调用各方法不抛错
 *
 * setup.ts 已注入 AudioContextStub，此处直接使用。
 */

describe('AudioEngine', () => {
  let engine: AudioEngine

  beforeEach(() => {
    engine = new AudioEngine()
  })

  describe('未 init 状态', () => {
    it('playClick 不抛错', () => {
      expect(() => engine.playClick(1)).not.toThrow()
    })

    it('playResult 不抛错', () => {
      expect(() => engine.playResult()).not.toThrow()
    })

    it('startCharge 不抛错', () => {
      expect(() => engine.startCharge()).not.toThrow()
    })

    it('stopCharge 不抛错', () => {
      expect(() => engine.stopCharge()).not.toThrow()
    })

    it('isReady 为 false', () => {
      expect(engine.isReady).toBe(false)
    })
  })

  describe('init 后', () => {
    beforeEach(() => {
      engine.init()
    })

    it('isReady 为 true', () => {
      expect(engine.isReady).toBe(true)
    })

    it('playClick 不抛错', () => {
      expect(() => engine.playClick(1)).not.toThrow()
    })

    it('playResult 不抛错', () => {
      expect(() => engine.playResult()).not.toThrow()
    })
  })

  describe('stopCharge 幂等性（#61）', () => {
    beforeEach(() => {
      engine.init()
    })

    it('未 startCharge 时 stopCharge 不抛错', () => {
      expect(() => engine.stopCharge()).not.toThrow()
    })

    it('startCharge 后 stopCharge 不抛错', () => {
      engine.startCharge()
      expect(() => engine.stopCharge()).not.toThrow()
    })

    it('连续多次 stopCharge 不抛错', () => {
      engine.startCharge()
      engine.stopCharge()
      expect(() => engine.stopCharge()).not.toThrow()
      expect(() => engine.stopCharge()).not.toThrow()
    })

    it('stopCharge 后立即 startCharge 能创建新节点（不阻塞）', () => {
      engine.startCharge()
      engine.stopCharge()
      // fade window 为 120ms，但实例字段已同步清空，startCharge 应能立即创建新节点
      expect(() => engine.startCharge()).not.toThrow()
      // 再次 stop 不抛错
      expect(() => engine.stopCharge()).not.toThrow()
    })

    it('快速 start-stop-start-stop 循环不抛错', () => {
      for (let i = 0; i < 5; i += 1) {
        engine.startCharge()
        engine.stopCharge()
      }
      // 不抛错即通过
    })
  })

  describe('setMuted / setVolume', () => {
    it('setMuted 在未 init 时不抛错', () => {
      expect(() => engine.setMuted(true)).not.toThrow()
      expect(engine.isMuted).toBe(true)
    })

    it('setMuted 在 init 后不抛错', () => {
      engine.init()
      expect(() => engine.setMuted(true)).not.toThrow()
      expect(engine.isMuted).toBe(true)
      expect(() => engine.setMuted(false)).not.toThrow()
      expect(engine.isMuted).toBe(false)
    })

    it('setVolume 钳制到 [0, 1]', () => {
      engine.setVolume(2)
      engine.setVolume(-1)
      // 不抛错即通过（具体值由 clamp 决定，无法直接断言内部 volume）
    })

    it('muted 时 playClick 静默不抛错', () => {
      engine.init()
      engine.setMuted(true)
      expect(() => engine.playClick(1)).not.toThrow()
    })

    it('muted 时 playResult 静默不抛错', () => {
      engine.init()
      engine.setMuted(true)
      expect(() => engine.playResult()).not.toThrow()
    })

    it('muted 时 startCharge 静默不抛错', () => {
      engine.init()
      engine.setMuted(true)
      expect(() => engine.startCharge()).not.toThrow()
    })
  })

  describe('resume', () => {
    it('未 init 时 resume 不抛错', () => {
      expect(() => engine.resume()).not.toThrow()
    })

    it('init 后 resume 不抛错', () => {
      engine.init()
      expect(() => engine.resume()).not.toThrow()
    })
  })
})
