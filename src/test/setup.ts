import '@testing-library/jest-dom/vitest'

/**
 * 全局测试环境补丁。
 *
 * jsdom 缺失以下 Web API，但被组件 / hooks 广泛使用：
 *  - ResizeObserver（useResponsiveSize / WheelCanvas / ShareResultPage）
 *  - matchMedia（媒体查询相关逻辑）
 *  - AudioContext（audioEngine；此处提供空壳避免 init 抛错，
 *    audioEngine 专测在测试文件内注入更细粒度的 mock）
 *
 * 此处仅做最小可用的 stub，不模拟真实行为——需要真实行为的测试
 * 在文件内自行 vi.stubGlobal 覆盖。
 */

/* ---- ResizeObserver ---- */
if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}

/* ---- matchMedia ---- */
if (typeof globalThis.matchMedia === 'undefined') {
  globalThis.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

/* ---- AudioContext / webkitAudioContext ---- */
if (typeof globalThis.AudioContext === 'undefined') {
  class AudioContextStub {
    currentTime = 0
    state: AudioContextState = 'running'
    destination: AudioDestinationNode = {} as AudioDestinationNode
    createGain(): GainNode {
      return {
        gain: {
          value: 0,
          setValueAtTime: () => {},
          linearRampToValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {},
          cancelScheduledValues: () => {},
        },
        connect: () => ({}) as unknown as AudioNode,
        disconnect: () => {},
      } as unknown as GainNode
    }
    createOscillator(): OscillatorNode {
      return {
        type: 'sine',
        frequency: {
          setValueAtTime: () => {},
          linearRampToValueAtTime: () => {},
        },
        connect: () => ({}) as unknown as AudioNode,
        disconnect: () => {},
        start: () => {},
        stop: () => {},
        onended: null,
      } as unknown as OscillatorNode
    }
    resume(): Promise<void> {
      return Promise.resolve()
    }
  }
  globalThis.AudioContext = AudioContextStub as unknown as typeof AudioContext
  ;(globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext =
    AudioContextStub as unknown as typeof AudioContext
}
