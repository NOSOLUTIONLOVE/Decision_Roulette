/** Wheel spin phases */
export type SpinPhase =
  | 'idle'
  | 'charging'
  | 'accelerating'
  | 'decelerating'
  | 'stopped'
  | 'result';

/** Wheel render configuration */
export interface WheelConfig {
  size: number;
  textSize: 'small' | 'medium' | 'large';
  colors: string[];
  highlightSectorIndex: number | null;
  /** 是否绘制扇区文字；默认 true。DOM 覆盖场景可设为 false 避免重复渲染。 */
  drawLabels?: boolean;
  /** 本地化提示文字：空选项时绘制在轮盘中央。未提供则跳过。 */
  emptyHint?: string;
  /** 本地化提示文字：仅有 1 个选项时绘制在轮盘中央。未提供则跳过。 */
  singleOptionHint?: string;
}

/** Spin result */
export interface SpinResult {
  optionIndex: number;
  optionText: string;
  optionColor: string;
  finalAngle: number;
}

/** Particle for celebration effect */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}
