import { describe, it, expect, vi, afterEach } from 'vitest'
import type { DampingState } from './dampingModel'
import {
  createSpinState,
  updatePhysics,
  isStopped,
  getSpeedRatio,
  estimateRotations,
  adjustForConstraints,
} from './dampingModel'

/**
 * 阻尼物理模型测试。
 *
 * 模型以 60fps 归一化：每帧应用摩擦系数 friction，新角速度
 *   newOmega = omega * friction^(dt / 16.67)
 * 当 omega < STOP_THRESHOLD (0.05) 时强制归零。totalAngle 累积，rotationsDone
 * = totalAngle / 2π。
 *
 * createSpinState 内部使用 randomBetween，对 Math.random 敏感，故在需要确定性
 * 数值的用例中 mock Math.random。
 */
const FRAME_TIME = 16.67
const TWO_PI = Math.PI * 2
const STOP_THRESHOLD = 0.05
const BASE_FRICTION = 0.985

describe('dampingModel', () => {
  describe('createSpinState', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('chargeRatio=0 时返回 base omega 范围 [8, 15]，且初始字段一致', () => {
      // Math.random()=0 -> randomBetween(8,15) = 8
      vi.spyOn(Math, 'random').mockReturnValue(0)
      const state = createSpinState(0)
      expect(state.omega).toBe(8)
      expect(state.initialOmega).toBe(8)
      expect(state.angle).toBe(0)
      expect(state.rotationsDone).toBe(0)
      expect(state.totalAngle).toBe(0)
    })

    it('chargeRatio=1 时 omega = baseOmega * 1.5', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0)
      const state = createSpinState(1)
      // baseOmega=8, chargeBonus=1+1*0.5=1.5, initialOmega=12
      expect(state.omega).toBe(12)
      expect(state.initialOmega).toBe(12)
    })

    it('chargeRatio=0.5 时 omega = baseOmega * 1.25', () => {
      vi.spyOn(Math, 'random').mockReturnValue(1) // randomBetween 返回上界 15
      const state = createSpinState(0.5)
      // baseOmega=15, chargeBonus=1+0.5*0.5=1.25, initialOmega=18.75
      expect(state.omega).toBeCloseTo(18.75, 5)
    })

    it('omega 恒为正数（不 mock 时验证不变量）', () => {
      const state = createSpinState(0.7)
      expect(state.omega).toBeGreaterThan(0)
      expect(state.initialOmega).toBeGreaterThan(0)
      expect(state.omega).toBeLessThanOrEqual(22.5) // 15 * 1.5 上限
    })
  })

  describe('updatePhysics - 阻尼衰减', () => {
    it('角速度随时间衰减（一帧后 omega 应减小）', () => {
      const initial: DampingState = {
        omega: 10,
        angle: 0,
        initialOmega: 10,
        rotationsDone: 0,
        totalAngle: 0,
      }
      const initialOmega = initial.omega
      const targetRotations = 5
      const next = updatePhysics(initial, FRAME_TIME, targetRotations)
      // 远未到末端（remainingRotations=5-0=5 > 2），friction=0.985
      // dtFrames = 16.67/16.67 = 1，newOmega = 10 * 0.985 = 9.85
      expect(next.omega).toBeCloseTo(9.85, 5)
      // 注：updatePhysics 现在原地修改 state（#36），所以用捕获的 initialOmega 比较
      expect(next.omega).toBeLessThan(initialOmega)
    })

    it('多帧累积后 omega 持续衰减', () => {
      let state: DampingState = {
        omega: 12,
        angle: 0,
        initialOmega: 12,
        rotationsDone: 0,
        totalAngle: 0,
      }
      const targetRotations = 5
      const omegas: number[] = []
      for (let i = 0; i < 50; i += 1) {
        state = updatePhysics(state, FRAME_TIME, targetRotations)
        omegas.push(state.omega)
      }
      // 每一步都不应大于上一步（在还未触发停止阈值前）
      for (let i = 1; i < omegas.length; i += 1) {
        expect(omegas[i]!).toBeLessThanOrEqual(omegas[i - 1]!)
      }
      expect(omegas[omegas.length - 1]!).toBeLessThan(omegas[0]!)
    })

    it('角度按 newOmega * dt/1000 递增', () => {
      const initial: DampingState = {
        omega: 10,
        angle: 1.0,
        initialOmega: 10,
        rotationsDone: 0,
        totalAngle: 0,
      }
      const next = updatePhysics(initial, FRAME_TIME, 5)
      // newOmega = 9.85, dt/1000 = 0.01667, deltaAngle ≈ 0.16417
      const expectedDelta = 9.85 * (FRAME_TIME / 1000)
      expect(next.angle).toBeCloseTo(1.0 + expectedDelta, 5)
      expect(next.totalAngle).toBeCloseTo(expectedDelta, 5)
    })

    it('totalAngle 用绝对值累积（支持反向旋转）', () => {
      const initial: DampingState = {
        omega: -10,
        angle: 0,
        initialOmega: -10,
        rotationsDone: 0,
        totalAngle: 0,
      }
      const next = updatePhysics(initial, FRAME_TIME, 5)
      // newOmega = -9.85, deltaAngle = -9.85*0.01667 ≈ -0.16417
      // totalAngle 累积 abs(deltaAngle) -> 正数
      expect(next.totalAngle).toBeGreaterThan(0)
      expect(next.totalAngle).toBeCloseTo(Math.abs(-9.85 * (FRAME_TIME / 1000)), 5)
    })
  })

  describe('updatePhysics - 边界值', () => {
    it('零角速度输入应保持零（且被停止阈值归零）', () => {
      const initial: DampingState = {
        omega: 0,
        angle: 0,
        initialOmega: 0,
        rotationsDone: 0,
        totalAngle: 0,
      }
      const next = updatePhysics(initial, FRAME_TIME, 5)
      expect(next.omega).toBe(0)
      expect(next.angle).toBe(0)
      expect(next.totalAngle).toBe(0)
    })

    it('极大角速度输入应正常衰减（不抛错）', () => {
      const initial: DampingState = {
        omega: 1e6,
        angle: 0,
        initialOmega: 1e6,
        rotationsDone: 0,
        totalAngle: 0,
      }
      const next = updatePhysics(initial, FRAME_TIME, 5)
      expect(next.omega).toBeLessThan(1e6)
      expect(next.omega).toBeGreaterThan(0)
      expect(isFinite(next.omega)).toBe(true)
    })
  })

  describe('updatePhysics - 停止阈值', () => {
    it('omega 低于 STOP_THRESHOLD (0.05) 时应被归零', () => {
      // 构造一个 omega 经摩擦后仍低于阈值的输入
      // friction=0.985, 1 帧 -> newOmega = omega * 0.985
      // 让 newOmega < 0.05 -> omega < 0.05076
      const initial: DampingState = {
        omega: 0.04,
        angle: 0,
        initialOmega: 10,
        rotationsDone: 0,
        totalAngle: 0,
      }
      const next = updatePhysics(initial, FRAME_TIME, 5)
      // newOmega = 0.04 * 0.985 = 0.0394 < 0.05 -> finalOmega = 0
      expect(next.omega).toBe(0)
    })

    it('omega 恰好等于阈值时被归零（<= 判定）', () => {
      // newOmega = 0.05 * 0.985 = 0.04925 < 0.05 -> 归零
      const initial: DampingState = {
        omega: STOP_THRESHOLD,
        angle: 0,
        initialOmega: 10,
        rotationsDone: 0,
        totalAngle: 0,
      }
      const next = updatePhysics(initial, FRAME_TIME, 5)
      expect(next.omega).toBe(0)
    })

    it('omega 高于阈值时保留衰减后的值', () => {
      // omega=1 -> newOmega = 0.985 > 0.05，保留
      const initial: DampingState = {
        omega: 1,
        angle: 0,
        initialOmega: 10,
        rotationsDone: 0,
        totalAngle: 0,
      }
      const next = updatePhysics(initial, FRAME_TIME, 5)
      expect(next.omega).toBeCloseTo(0.985, 5)
      expect(next.omega).toBeGreaterThan(0)
    })
  })

  describe('updatePhysics - 时间步进', () => {
    it('较大的 dt 应用更多次摩擦（omega 衰减更快）', () => {
      // 注：updatePhysics 原地修改 state（#36），每次需独立构造
      const small = updatePhysics(
        { omega: 10, angle: 0, initialOmega: 10, rotationsDone: 0, totalAngle: 0 },
        FRAME_TIME,
        5,
      ) // 1 帧
      const large = updatePhysics(
        { omega: 10, angle: 0, initialOmega: 10, rotationsDone: 0, totalAngle: 0 },
        FRAME_TIME * 3,
        5,
      ) // 3 帧
      // 1 帧：10 * 0.985^1 = 9.85
      // 3 帧：10 * 0.985^3 ≈ 9.5567
      expect(large.omega).toBeLessThan(small.omega)
      expect(small.omega).toBeCloseTo(10 * Math.pow(BASE_FRICTION, 1), 5)
      expect(large.omega).toBeCloseTo(10 * Math.pow(BASE_FRICTION, 3), 4)
    })

    it('角度增量正比于 dt', () => {
      // 注：updatePhysics 原地修改 state（#36），每次需独立构造
      const t1 = updatePhysics(
        { omega: 10, angle: 0, initialOmega: 10, rotationsDone: 0, totalAngle: 0 },
        FRAME_TIME,
        5,
      )
      const t2 = updatePhysics(
        { omega: 10, angle: 0, initialOmega: 10, rotationsDone: 0, totalAngle: 0 },
        FRAME_TIME * 2,
        5,
      )
      // t2 走了 2 倍时间，虽然 omega 不同（摩擦更多），但角度增量应明显更大
      expect(t2.totalAngle).toBeGreaterThan(t1.totalAngle)
    })

    it('摩擦保持恒定（不再使用末端摩擦），保证 3-8 秒转动时长', () => {
      const state: DampingState = {
        omega: 10,
        angle: 0,
        initialOmega: 10,
        rotationsDone: 4,
        totalAngle: 0,
      }
      const next = updatePhysics(state, FRAME_TIME, 5)
      expect(next.omega).toBeCloseTo(9.85, 5)
    })

    it('完整转动模拟时长落在 3-8 秒之间', () => {
      // 遍历无蓄力与满蓄力边界，验证每次模拟都在 3-8 秒内停止
      for (const chargeRatio of [0, 0.5, 1]) {
        let state = createSpinState(chargeRatio)
        let elapsedMs = 0
        while (!isStopped(state) && elapsedMs < 20000) {
          state = updatePhysics(state, FRAME_TIME, 5)
          elapsedMs += FRAME_TIME
        }
        expect(isStopped(state)).toBe(true)
        const elapsedSeconds = elapsedMs / 1000
        expect(elapsedSeconds).toBeGreaterThanOrEqual(3)
        expect(elapsedSeconds).toBeLessThanOrEqual(8)
      }
    })
  })

  describe('isStopped', () => {
    it('omega=0 -> true', () => {
      expect(isStopped({ omega: 0, angle: 0, initialOmega: 10, rotationsDone: 0, totalAngle: 0 })).toBe(true)
    })

    it('omega=0.04 -> true（<= 阈值）', () => {
      expect(isStopped({ omega: 0.04, angle: 0, initialOmega: 10, rotationsDone: 0, totalAngle: 0 })).toBe(true)
    })

    it('omega=0.05 -> true（恰好等于阈值，<=）', () => {
      expect(isStopped({ omega: 0.05, angle: 0, initialOmega: 10, rotationsDone: 0, totalAngle: 0 })).toBe(true)
    })

    it('omega=0.06 -> false', () => {
      expect(isStopped({ omega: 0.06, angle: 0, initialOmega: 10, rotationsDone: 0, totalAngle: 0 })).toBe(false)
    })

    it('omega=10 -> false', () => {
      expect(isStopped({ omega: 10, angle: 0, initialOmega: 10, rotationsDone: 0, totalAngle: 0 })).toBe(false)
    })

    it('负 omega 也判为停止（<= 阈值）', () => {
      expect(isStopped({ omega: -1, angle: 0, initialOmega: 10, rotationsDone: 0, totalAngle: 0 })).toBe(true)
    })
  })

  describe('getSpeedRatio', () => {
    it('initialOmega=0 -> 0', () => {
      const state: DampingState = { omega: 0, angle: 0, initialOmega: 0, rotationsDone: 0, totalAngle: 0 }
      expect(getSpeedRatio(state)).toBe(0)
    })

    it('omega=initialOmega -> 1', () => {
      const state: DampingState = { omega: 10, angle: 0, initialOmega: 10, rotationsDone: 0, totalAngle: 0 }
      expect(getSpeedRatio(state)).toBe(1)
    })

    it('omega=initialOmega/2 -> 0.5', () => {
      const state: DampingState = { omega: 5, angle: 0, initialOmega: 10, rotationsDone: 0, totalAngle: 0 }
      expect(getSpeedRatio(state)).toBeCloseTo(0.5, 5)
    })

    it('omega>initialOmega 被钳制为 1', () => {
      const state: DampingState = { omega: 100, angle: 0, initialOmega: 10, rotationsDone: 0, totalAngle: 0 }
      expect(getSpeedRatio(state)).toBe(1)
    })

    it('omega=0 但 initialOmega>0 -> 0', () => {
      const state: DampingState = { omega: 0, angle: 0, initialOmega: 10, rotationsDone: 0, totalAngle: 0 }
      expect(getSpeedRatio(state)).toBe(0)
    })
  })

  describe('estimateRotations', () => {
    it('返回正值且正比于 initialOmega', () => {
      const r1 = estimateRotations(10)
      const r2 = estimateRotations(20)
      expect(r1).toBeGreaterThan(0)
      expect(r2).toBeGreaterThan(0)
      expect(r2).toBeCloseTo(r1 * 2, 4)
    })

    it('initialOmega=0 -> 0', () => {
      expect(estimateRotations(0)).toBe(0)
    })

    it('与公式一致：initialOmega / (1 - BASE_FRICTION) * FRAME_TIME / 1000 / TWO_PI', () => {
      const omega = 12
      const expected = (omega / (1 - BASE_FRICTION) * FRAME_TIME / 1000) / TWO_PI
      expect(estimateRotations(omega)).toBeCloseTo(expected, 5)
    })
  })

  describe('adjustForConstraints', () => {
    it('低于下限（3）的输入被提升到 3，且 needsBoost=true', () => {
      const r = adjustForConstraints(1)
      expect(r.targetRotations).toBe(3)
      expect(r.needsBoost).toBe(true)
    })

    it('负数输入被提升到 3，且 needsBoost=true', () => {
      const r = adjustForConstraints(-5)
      expect(r.targetRotations).toBe(3)
      expect(r.needsBoost).toBe(true)
    })

    it('下限恰好 3 -> 不调整，needsBoost=false', () => {
      const r = adjustForConstraints(3)
      expect(r.targetRotations).toBe(3)
      expect(r.needsBoost).toBe(false)
    })

    it('中间值 5 -> 不调整，needsBoost=false', () => {
      const r = adjustForConstraints(5)
      expect(r.targetRotations).toBe(5)
      expect(r.needsBoost).toBe(false)
    })

    it('上限恰好 8 -> 不调整，needsBoost=false', () => {
      const r = adjustForConstraints(8)
      expect(r.targetRotations).toBe(8)
      expect(r.needsBoost).toBe(false)
    })

    it('超过上限（8）的输入被钳制到 8，且 needsBoost=true', () => {
      const r = adjustForConstraints(10)
      expect(r.targetRotations).toBe(8)
      expect(r.needsBoost).toBe(true)
    })

    it('极大输入被钳制到 8', () => {
      const r = adjustForConstraints(1000)
      expect(r.targetRotations).toBe(8)
      expect(r.needsBoost).toBe(true)
    })
  })
})
