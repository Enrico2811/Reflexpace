import type { Target, TargetLockGame } from '@reflexpace/shared';

const COLORS = {
  space: '#070B1A',
  grid: 'rgba(39, 225, 255, 0.05)',
  target: '#27E1FF',
  targetFill: 'rgba(39, 225, 255, 0.18)',
  decoy: '#FF3B4E',
  decoyFill: 'rgba(255, 59, 78, 0.18)',
  miss: 'rgba(232, 241, 255, 0.45)',
};

const PULSE_MS = 260;

export type PulseKind = 'hit' | 'decoy' | 'miss';

interface Pulse {
  x: number;
  y: number;
  radius: number;
  color: string;
  start: number;
}

export class TargetLockRenderer {
  private pulses: Pulse[] = [];

  addPulse(kind: PulseKind, x: number, y: number, radius: number, now: number): void {
    const color = kind === 'hit' ? COLORS.target : kind === 'decoy' ? COLORS.decoy : COLORS.miss;
    this.pulses.push({ x, y, radius, color, start: now });
  }

  clear(): void {
    this.pulses = [];
  }

  draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    game: TargetLockGame | null,
    now: number,
  ): void {
    drawArena(ctx, width, height);
    if (game) {
      for (const target of game.targets) drawTarget(ctx, target, now);
    }
    this.drawPulses(ctx, now);
  }

  private drawPulses(ctx: CanvasRenderingContext2D, now: number): void {
    this.pulses = this.pulses.filter((p) => now - p.start < PULSE_MS);
    for (const p of this.pulses) {
      const k = (now - p.start) / PULSE_MS;
      ctx.globalAlpha = 1 - k;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * (1 + k * 0.8), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

function drawArena(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = COLORS.space;
  ctx.fillRect(0, 0, width, height);

  const step = 48;
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = step; x < width; x += step) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
  }
  for (let y = step; y < height; y += step) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
  }
  ctx.stroke();
}

// O alvo aparece já no tamanho final (sem animação de entrada) para não distorcer o tempo de reação.
function drawTarget(ctx: CanvasRenderingContext2D, target: Target, now: number): void {
  const { x, y, radius, decoy } = target;
  const color = decoy ? COLORS.decoy : COLORS.target;
  const total = target.expiresAt - target.spawnedAt;
  const life = Math.min(1, Math.max(0, (target.expiresAt - now) / total));

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = decoy ? COLORS.decoyFill : COLORS.targetFill;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Anel de vida restante.
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, radius + 6, -Math.PI / 2, -Math.PI / 2 + life * Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  if (decoy) {
    const s = radius * 0.4;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - s, y - s);
    ctx.lineTo(x + s, y + s);
    ctx.moveTo(x + s, y - s);
    ctx.lineTo(x - s, y + s);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(2, radius * 0.12), 0, Math.PI * 2);
    ctx.fill();
  }
}
