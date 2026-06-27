import { describe, it, expect, vi } from 'vitest'
import type { Option } from '@/types'
import type { WheelConfig } from '@/types/engine'
import { WheelRenderer } from './renderer'
import {
  assignColor,
  getWheelColors,
  getOptionColors,
  resolveColor,
} from './colorPalette'

/**
 * 轮盘渲染器测试。
 *
 * `WheelRenderer.draw` 严重依赖 Canvas 2D API（fill/stroke/arc/measureText 等），
 * jsdom 不实现这些。因此：
 *  - 纯函数部分（静态方法 getSectorAtAngle、colorPalette 的纯函数）直接测试真实逻辑；
 *  - draw 方法的副作用通过传入 vi.fn() mock 的 CanvasRenderingContext2D 验证调用序列。
 */

/** 创建一个所有方法被 vi.fn() 替换、属性可写的 mock context。 */
function createMockContext(): CanvasRenderingContext2D & {
  [key: string]: ReturnType<typeof vi.fn> | unknown
} {
  const ctx = {
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    setLineDash: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    // 属性
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: '',
    textBaseline: '',
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D & {
    [key: string]: ReturnType<typeof vi.fn> | unknown
  }
  return ctx
}

function makeConfig(overrides: Partial<WheelConfig> = {}): WheelConfig {
  return {
    size: 300,
    textSize: 'medium',
    colors: [],
    highlightSectorIndex: null,
    // Default localized hints so assertions on fillText stay meaningful.
    emptyHint: '添加选项开始',
    singleOptionHint: '至少需要 2 个选项',
    ...overrides,
  }
}

function makeOptions(n: number): Option[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `id-${i}`,
    text: `选项${i + 1}`,
    color: `var(--color-wheel-${(i % 8) + 1})`,
  }))
}

describe('WheelRenderer.getSectorAtAngle（纯静态方法）', () => {
  // angle 参数 = 轮盘顺时针旋转弧度（CSS rotateZ 累加值）。
  // 指针固定在 12 点（-PI/2）。扇区 i 原本从 -PI/2 + i*sa 开始顺时针扫 sa。
  // 轮盘旋转 angle 后，指针命中的扇区 = floor(-angle / sa) mod n。
  it('optionCount=0 -> 始终返回 0', () => {
    expect(WheelRenderer.getSectorAtAngle(0, 0)).toBe(0)
    expect(WheelRenderer.getSectorAtAngle(Math.PI, 0)).toBe(0)
  })

  it('optionCount=2：未旋转 -> 0；转半圈 -> 1；转一圈 -> 0', () => {
    // sa = PI。angle=0 -> 0；angle=PI -> 1；angle=2PI -> 0
    expect(WheelRenderer.getSectorAtAngle(0, 2)).toBe(0)
    expect(WheelRenderer.getSectorAtAngle(Math.PI, 2)).toBe(1)
    expect(WheelRenderer.getSectorAtAngle(Math.PI * 2, 2)).toBe(0)
    // 转四分之一圈（sa/2）：指针落在扇区 1 的起始边界，归扇区 1
    expect(WheelRenderer.getSectorAtAngle(Math.PI / 2, 2)).toBe(1)
  })

  it('optionCount=4：转 0/90/180/270 度分别命中 0/3/2/1', () => {
    // sa = PI/2。轮盘顺时针转 angle 后，指针命中的是"逆时针方向"的扇区。
    expect(WheelRenderer.getSectorAtAngle(0, 4)).toBe(0)
    expect(WheelRenderer.getSectorAtAngle(Math.PI / 2, 4)).toBe(3)
    expect(WheelRenderer.getSectorAtAngle(Math.PI, 4)).toBe(2)
    expect(WheelRenderer.getSectorAtAngle((3 * Math.PI) / 2, 4)).toBe(1)
    expect(WheelRenderer.getSectorAtAngle(Math.PI * 2, 4)).toBe(0)
  })

  it('optionCount=6：扇区角 60 度，转 i*sa 命中 (n-i) mod n', () => {
    const sectorAngle = (Math.PI * 2) / 6
    for (let i = 0; i < 6; i += 1) {
      const angle = i * sectorAngle // 转到扇区边界
      const expected = (6 - i) % 6
      expect(WheelRenderer.getSectorAtAngle(angle, 6)).toBe(expected)
    }
  })

  it('optionCount=12：扇区角 30 度', () => {
    const sectorAngle = (Math.PI * 2) / 12
    for (let i = 0; i < 12; i += 1) {
      const angle = i * sectorAngle
      const expected = (12 - i) % 12
      expect(WheelRenderer.getSectorAtAngle(angle, 12)).toBe(expected)
    }
  })

  it('optionCount=50：扇区角 7.2 度，返回值落在 [0,49]', () => {
    const sectorAngle = (Math.PI * 2) / 50
    for (let i = 0; i < 50; i += 1) {
      const angle = i * sectorAngle
      const idx = WheelRenderer.getSectorAtAngle(angle, 50)
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(50)
      expect(idx).toBe((50 - i) % 50)
    }
  })

  it('负角度（逆时针旋转）被正确归一化', () => {
    // 逆时针转 PI/2 = 顺时针转 3PI/2，应命中同一扇区
    expect(WheelRenderer.getSectorAtAngle(-Math.PI / 2, 4)).toBe(
      WheelRenderer.getSectorAtAngle((3 * Math.PI) / 2, 4),
    )
  })

  it('超过 2π 的角度被归一化', () => {
    expect(WheelRenderer.getSectorAtAngle(Math.PI * 2 + 0, 4)).toBe(
      WheelRenderer.getSectorAtAngle(0, 4),
    )
    expect(WheelRenderer.getSectorAtAngle(Math.PI * 4 - Math.PI / 2, 4)).toBe(
      WheelRenderer.getSectorAtAngle(-Math.PI / 2, 4),
    )
  })

  it('返回值始终在 [0, optionCount-1]', () => {
    for (let n = 1; n <= 12; n += 1) {
      for (let a = -Math.PI * 4; a < Math.PI * 4; a += 0.1) {
        const idx = WheelRenderer.getSectorAtAngle(a, n)
        expect(idx).toBeGreaterThanOrEqual(0)
        expect(idx).toBeLessThan(n)
      }
    }
  })

  it('指针在扇区边界顺时针方向 0.5° 内时取顺时针下一扇区', () => {
    const n = 4
    const sectorAngle = (Math.PI * 2) / n
    // 扇区 2 的起始边界位于 angle = 2 * sectorAngle = PI
    // 指针在边界前 0.3°（顺时针方向尚未越过边界）应命中扇区 2
    const boundaryAngle = 2 * sectorAngle
    const beforeBoundary = boundaryAngle + (0.3 * Math.PI) / 180
    expect(WheelRenderer.getSectorAtAngle(beforeBoundary, n)).toBe(2)

    // 超过 0.5° 则不应触发边界处理，仍命中扇区 1
    const farBeforeBoundary = boundaryAngle + (0.6 * Math.PI) / 180
    expect(WheelRenderer.getSectorAtAngle(farBeforeBoundary, n)).toBe(1)
  })

  it('自定义边界容差可覆盖更大范围', () => {
    const n = 4
    const sectorAngle = (Math.PI * 2) / n
    const boundaryAngle = 2 * sectorAngle
    const beforeBoundary = boundaryAngle + (0.6 * Math.PI) / 180
    // 默认 0.5° 不触发
    expect(WheelRenderer.getSectorAtAngle(beforeBoundary, n)).toBe(1)
    // 容差扩大到 1° 时触发，取顺时针下一扇区
    expect(WheelRenderer.getSectorAtAngle(beforeBoundary, n, 1.0)).toBe(2)
  })
})

describe('colorPalette 纯函数', () => {
  it('getWheelColors 返回 8 个 CSS 变量色', () => {
    const colors = getWheelColors()
    expect(colors).toHaveLength(8)
    colors.forEach((c, i) => {
      expect(c).toBe(`var(--color-wheel-${i + 1})`)
    })
  })

  it('getWheelColors 返回副本（修改不影响内部）', () => {
    const a = getWheelColors()
    a.push('mutated')
    const b = getWheelColors()
    expect(b).toHaveLength(8)
    expect(b).not.toContain('mutated')
  })

  it('assignColor 按 index 循环分配 8 色', () => {
    expect(assignColor(0)).toBe('var(--color-wheel-1)')
    expect(assignColor(7)).toBe('var(--color-wheel-8)')
    expect(assignColor(8)).toBe('var(--color-wheel-1)') // 循环
    expect(assignColor(9)).toBe('var(--color-wheel-2)')
    expect(assignColor(16)).toBe('var(--color-wheel-1)')
  })

  it('getOptionColors 为每个 option 分配颜色', () => {
    const options = makeOptions(10)
    const colors = getOptionColors(options)
    expect(colors).toHaveLength(10)
    expect(colors[0]).toBe('var(--color-wheel-1)')
    expect(colors[7]).toBe('var(--color-wheel-8)')
    expect(colors[8]).toBe('var(--color-wheel-1)') // 循环
    expect(colors[9]).toBe('var(--color-wheel-2)')
  })

  it('resolveColor 非 var() 颜色原样返回', () => {
    expect(resolveColor('#c96442')).toBe('#c96442')
    expect(resolveColor('red')).toBe('red')
    expect(resolveColor('rgb(1,2,3)')).toBe('rgb(1,2,3)')
  })

  it('resolveColor 对 var() 在 jsdom 中回退为原值（getComputedStyle 返回空）', () => {
    // jsdom 未注入 CSS 变量值 -> getPropertyValue 返回 '' -> 回退到原 color
    const result = resolveColor('var(--color-wheel-1)')
    expect(result).toBe('var(--color-wheel-1)')
  })
})

describe('WheelRenderer.draw（mock canvas）', () => {
  it('空 options：调用 clearRect，绘制虚线圆与提示文字', () => {
    const ctx = createMockContext()
    const renderer = new WheelRenderer(ctx, 300)
    renderer.draw([], makeConfig())

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 300, 300)
    expect(ctx.arc).toHaveBeenCalled()
    expect(ctx.setLineDash).toHaveBeenCalledWith([6, 6])
    expect(ctx.fillText).toHaveBeenCalledWith('添加选项开始', 150, 150)
  })

  it('单个 option：绘制完整圆 + 提示 "至少需要 2 个选项"', () => {
    const ctx = createMockContext()
    const renderer = new WheelRenderer(ctx, 300)
    renderer.draw(makeOptions(1), makeConfig())

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 300, 300)
    expect(ctx.fillText).toHaveBeenCalledWith('至少需要 2 个选项', 150, 150)
    expect(ctx.arc).toHaveBeenCalled()
  })

  it('多扇区：每个 option 对应一次 arc 调用，扇区角 = 2π/n', () => {
    const ctx = createMockContext()
    const renderer = new WheelRenderer(ctx, 300)
    const n = 6
    const angle = 0
    renderer.draw(makeOptions(n), makeConfig(), angle)

    const arcCalls = (ctx.arc as ReturnType<typeof vi.fn>).mock.calls
    // 前 n 次 arc 是扇区，之后还有 2 次（内圈虚线 + 外圈描边）
    expect(arcCalls.length).toBeGreaterThanOrEqual(n)
    const sectorAngle = (Math.PI * 2) / n
    for (let i = 0; i < n; i += 1) {
      const call = arcCalls[i]!
      // arc(cx, cy, radius, startAngle, endAngle)
      expect(call[0]).toBe(150) // cx
      expect(call[1]).toBe(150) // cy
      expect(call[2]).toBe(148) // radius = size/2 - 2
      const startAngle = call[3] as number
      const endAngle = call[4] as number
      const expectedStart = i * sectorAngle - Math.PI / 2 + angle
      expect(startAngle).toBeCloseTo(expectedStart, 5)
      expect(endAngle - startAngle).toBeCloseTo(sectorAngle, 5)
    }
  })

  it('扇区数 2：扇区角 = π', () => {
    const ctx = createMockContext()
    const renderer = new WheelRenderer(ctx, 300)
    renderer.draw(makeOptions(2), makeConfig())

    const arcCalls = (ctx.arc as ReturnType<typeof vi.fn>).mock.calls
    const sectorAngle = Math.PI
    for (let i = 0; i < 2; i += 1) {
      const call = arcCalls[i]!
      const startAngle = call[3] as number
      const endAngle = call[4] as number
      expect(endAngle - startAngle).toBeCloseTo(sectorAngle, 5)
    }
  })

  it('扇区数 12：扇区角 = π/6', () => {
    const ctx = createMockContext()
    const renderer = new WheelRenderer(ctx, 300)
    renderer.draw(makeOptions(12), makeConfig())

    const arcCalls = (ctx.arc as ReturnType<typeof vi.fn>).mock.calls
    const sectorAngle = (Math.PI * 2) / 12
    for (let i = 0; i < 12; i += 1) {
      const call = arcCalls[i]!
      const startAngle = call[3] as number
      const endAngle = call[4] as number
      expect(endAngle - startAngle).toBeCloseTo(sectorAngle, 5)
    }
  })

  it('扇区数 50：仍正常绘制（扇区角 = 2π/50，恰好等于文本裁剪阈值）', () => {
    const ctx = createMockContext()
    const renderer = new WheelRenderer(ctx, 300)
    renderer.draw(makeOptions(50), makeConfig())

    const arcCalls = (ctx.arc as ReturnType<typeof vi.fn>).mock.calls
    expect(arcCalls.length).toBeGreaterThanOrEqual(50)
    const sectorAngle = (Math.PI * 2) / 50
    for (let i = 0; i < 50; i += 1) {
      const call = arcCalls[i]!
      const startAngle = call[3] as number
      const endAngle = call[4] as number
      expect(endAngle - startAngle).toBeCloseTo(sectorAngle, 5)
    }
  })

  it('标签布局：n<=6 时调用 rotate（切向 T 形排列）', () => {
    const ctx = createMockContext()
    const renderer = new WheelRenderer(ctx, 300)
    renderer.draw(makeOptions(6), makeConfig())

    // 切向 T 形布局：每个扇区文本绘制都调用一次 rotate
    expect(ctx.rotate).toHaveBeenCalled()
    const rotateCalls = (ctx.rotate as ReturnType<typeof vi.fn>).mock.calls
    expect(rotateCalls.length).toBe(6)
  })

  it('标签布局：n>6 时调用 rotate（切向 T 形排列）', () => {
    const ctx = createMockContext()
    const renderer = new WheelRenderer(ctx, 300)
    renderer.draw(makeOptions(8), makeConfig())

    // 切向 T 形布局：每个扇区文本绘制都调用一次 rotate
    expect(ctx.rotate).toHaveBeenCalled()
    const rotateCalls = (ctx.rotate as ReturnType<typeof vi.fn>).mock.calls
    expect(rotateCalls.length).toBe(8)
  })

  it('highlightSectorIndex 命中时多一次 fill 调用（高亮覆盖）', () => {
    // 无高亮：4 扇区 = 4 次 fill（每个扇区 fill 一次）
    const ctxNoHighlight = createMockContext()
    const r1 = new WheelRenderer(ctxNoHighlight, 300)
    r1.draw(makeOptions(4), makeConfig({ highlightSectorIndex: null }))
    const fillsWithout = (ctxNoHighlight.fill as ReturnType<typeof vi.fn>).mock.calls.length

    // 有高亮：命中的扇区额外 fill 一次 -> 5 次
    const ctxWithHighlight = createMockContext()
    const r2 = new WheelRenderer(ctxWithHighlight, 300)
    r2.draw(makeOptions(4), makeConfig({ highlightSectorIndex: 2 }))
    const fillsWith = (ctxWithHighlight.fill as ReturnType<typeof vi.fn>).mock.calls.length

    // 高亮分支会额外调用一次 fill（在命中扇区上叠加半透明白色）
    expect(fillsWith - fillsWithout).toBe(1)
  })

  it('highlightSectorIndex 命中最后一个扇区时 fillStyle 最终为高亮白（n>50 跳过文本）', () => {
    // 当扇区数 > 50 时文本被跳过（sectorAngle < 2π/50），高亮为最后一次 fillStyle 赋值。
    // 使用 51 个扇区，高亮最后一个，使 fillStyle 保留为高亮白。
    const ctx = createMockContext()
    const renderer = new WheelRenderer(ctx, 300)
    renderer.draw(makeOptions(51), makeConfig({ highlightSectorIndex: 50 }))
    expect(ctx.fillStyle).toBe('rgba(255, 255, 255, 0.25)')
  })

  it('angle 参数偏移整个轮盘的起始角', () => {
    const ctx = createMockContext()
    const renderer = new WheelRenderer(ctx, 300)
    const n = 4
    const angle = 1.234
    renderer.draw(makeOptions(n), makeConfig(), angle)

    const arcCalls = (ctx.arc as ReturnType<typeof vi.fn>).mock.calls
    const sectorAngle = (Math.PI * 2) / n
    for (let i = 0; i < n; i += 1) {
      const call = arcCalls[i]!
      const startAngle = call[3] as number
      const expectedStart = i * sectorAngle - Math.PI / 2 + angle
      expect(startAngle).toBeCloseTo(expectedStart, 5)
    }
  })

  it('textSize 映射到不同字号（按 canvas 尺寸缩放）', () => {
    // 300px canvas：small=12*(300/280)≈13, large=20*(300/280)≈21
    const ctxSmall = createMockContext()
    const r1 = new WheelRenderer(ctxSmall, 300)
    r1.draw(makeOptions(4), makeConfig({ textSize: 'small' }))
    // 字号基数 small=12，按 300/280 缩放后约 13px
    expect(ctxSmall.font).toContain('13px')

    const ctxLarge = createMockContext()
    const r2 = new WheelRenderer(ctxLarge, 300)
    r2.draw(makeOptions(4), makeConfig({ textSize: 'large' }))
    // 字号基数 large=20，按 300/280 缩放后约 21px
    expect(ctxLarge.font).toContain('21px')
  })
})
