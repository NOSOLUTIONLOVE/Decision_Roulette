import { describe, it, expect, beforeEach } from 'vitest'
import { useWheelStore } from './useWheelStore'
import type { Option } from '@/types'

/**
 * useWheelStore 单测。
 *
 * 覆盖评审中反复提及的边界问题：
 *  - reorderOptions 越界索引（correctness / kieran-typescript）
 *  - resetSpin 行为（maintainability #65 重命名后语义）
 *  - phase / result / chargeRatio 基本状态机
 */
function makeOptions(n: number): Option[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `id-${i}`,
    text: `opt-${i}`,
    color: `#${i.toString(16).padStart(6, '0')}`,
  }))
}

describe('useWheelStore', () => {
  beforeEach(() => {
    // 每个用例重置到已知状态：2 个选项 + idle
    useWheelStore.setState({
      options: makeOptions(2),
      phase: 'idle',
      result: null,
      chargeRatio: 0,
    })
  })

  describe('reorderOptions 边界守卫', () => {
    it('合法 from/to 正确重排', () => {
      useWheelStore.getState().reorderOptions(0, 1)
      const opts = useWheelStore.getState().options
      expect(opts.map((o) => o.id)).toEqual(['id-1', 'id-0'])
    })

    it('from 越界（>= length）时保持原数组不变', () => {
      const before = useWheelStore.getState().options
      useWheelStore.getState().reorderOptions(99, 0)
      expect(useWheelStore.getState().options).toBe(before)
    })

    it('to 越界（>= length）时保持原数组不变', () => {
      const before = useWheelStore.getState().options
      useWheelStore.getState().reorderOptions(0, 99)
      expect(useWheelStore.getState().options).toBe(before)
    })

    it('负数索引被拒绝', () => {
      const before = useWheelStore.getState().options
      useWheelStore.getState().reorderOptions(-1, 0)
      useWheelStore.getState().reorderOptions(0, -1)
      expect(useWheelStore.getState().options).toBe(before)
    })

    it('非整数索引被拒绝', () => {
      const before = useWheelStore.getState().options
      useWheelStore.getState().reorderOptions(0.5, 1)
      useWheelStore.getState().reorderOptions(0, 1.5)
      expect(useWheelStore.getState().options).toBe(before)
    })

    it('from === to 时 no-op', () => {
      const before = useWheelStore.getState().options
      useWheelStore.getState().reorderOptions(0, 0)
      expect(useWheelStore.getState().options).toBe(before)
    })

    it('重排后数组中无 undefined 混入', () => {
      useWheelStore.getState().reorderOptions(0, 1)
      const opts = useWheelStore.getState().options
      expect(opts.every((o) => o !== undefined && o !== null)).toBe(true)
      expect(opts.every((o) => typeof o.text === 'string')).toBe(true)
    })
  })

  describe('resetSpin', () => {
    it('清空 phase / result / chargeRatio，但保留 options', () => {
      const opts = useWheelStore.getState().options
      useWheelStore.setState({
        phase: 'decelerating',
        result: { optionIndex: 0, optionText: 'opt-0', optionColor: '#000000', finalAngle: 0 },
        chargeRatio: 0.7,
      })
      useWheelStore.getState().resetSpin()
      const s = useWheelStore.getState()
      expect(s.phase).toBe('idle')
      expect(s.result).toBeNull()
      expect(s.chargeRatio).toBe(0)
      // options 不被 resetSpin 清空
      expect(s.options).toBe(opts)
    })

    it('多次调用幂等', () => {
      useWheelStore.getState().resetSpin()
      const s1 = useWheelStore.getState()
      useWheelStore.getState().resetSpin()
      const s2 = useWheelStore.getState()
      expect(s2.phase).toBe('idle')
      expect(s2.result).toBeNull()
      expect(s2.chargeRatio).toBe(0)
      expect(s2.options).toEqual(s1.options)
    })
  })

  describe('addOption / addOptionsBulk / removeOption', () => {
    it('addOption 追加到末尾并生成 id', () => {
      useWheelStore.getState().addOption('新选项', '#abcdef')
      const opts = useWheelStore.getState().options
      expect(opts).toHaveLength(3)
      expect(opts[2]!.text).toBe('新选项')
      expect(opts[2]!.color).toBe('#abcdef')
      expect(typeof opts[2]!.id).toBe('string')
      expect(opts[2]!.id.length).toBeGreaterThan(0)
    })

    it('addOptionsBulk 批量追加', () => {
      useWheelStore.getState().addOptionsBulk([
        { text: 'a', color: '#111' },
        { text: 'b', color: '#222' },
      ])
      expect(useWheelStore.getState().options).toHaveLength(4)
    })

    it('removeOption 按 id 删除', () => {
      const id = useWheelStore.getState().options[0]!.id
      useWheelStore.getState().removeOption(id)
      const opts = useWheelStore.getState().options
      expect(opts).toHaveLength(1)
      expect(opts.find((o) => o.id === id)).toBeUndefined()
    })
  })

  describe('clearOptions', () => {
    it('清空 options 并重置 phase/result', () => {
      useWheelStore.setState({ phase: 'result', result: { optionIndex: 0, optionText: 'x', optionColor: '#000', finalAngle: 0 } })
      useWheelStore.getState().clearOptions()
      const s = useWheelStore.getState()
      expect(s.options).toEqual([])
      expect(s.phase).toBe('idle')
      expect(s.result).toBeNull()
    })
  })
})
