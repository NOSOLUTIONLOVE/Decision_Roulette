import type { Particle } from '@/types/engine';
import { randomBetween } from '@/lib/utils';

const GRAVITY = 0.15;
const PARTICLE_COUNT = 60;

/** Create a burst of particles from center */
export function createBurst(
  centerX: number,
  centerY: number,
  colors: string[],
  count: number = PARTICLE_COUNT,
): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = randomBetween(0, Math.PI * 2);
    const speed = randomBetween(3, 8);
    const color = colors[Math.floor(Math.random() * colors.length)] ?? '#c96442';

    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - randomBetween(2, 5), // bias upward
      life: randomBetween(1200, 1800),
      maxLife: 1800,
      color,
      size: randomBetween(4, 10),
    });
  }

  return particles;
}

/**
 * Update particles by one frame.
 *
 * 原地更新 + 原地压缩：避免每帧 .map 创建新对象、.filter 创建新数组造成的 GC 压力。
 * 返回值与入参 particles 同引用，长度可能因死亡粒子被移除而缩短。
 */
export function updateParticles(particles: Particle[], dt: number): Particle[] {
  const dtScale = dt / 16.67; // normalize to 60fps
  const drag = Math.pow(0.99, dtScale); // frame-rate independent air resistance

  // 原地压缩：把存活粒子前移，末尾截断
  let writeIdx = 0;
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (!p) continue;
    // 更新物理量（原地）
    p.x = p.x + p.vx * dtScale;
    p.y = p.y + p.vy * dtScale;
    p.vy = p.vy * drag + GRAVITY * dtScale;
    p.vx = p.vx * drag;
    p.life = p.life - dt;

    if (p.life > 0) {
      if (writeIdx !== i) {
        particles[writeIdx] = p;
        particles[i] = undefined as unknown as Particle;
      }
      writeIdx++;
    } else {
      particles[i] = undefined as unknown as Particle;
    }
  }
  // 截断末尾
  particles.length = writeIdx;
  return particles;
}

/** Render particles to a canvas context */
export function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
): void {
  particles.forEach((p) => {
    const t = p.life / p.maxLife;
    // Ease-out alpha so particles remain clearly visible for most of their life
    const alpha = Math.max(0.25, t * (2 - t));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = p.size * 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}
