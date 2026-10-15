import { randomRange, type Rng } from '../../rng';
import type { Size } from '../../types';
import {
  PENALTY_DECOY,
  PENALTY_EXPIRED,
  PENALTY_MISS,
  hitPoints,
  type TargetLockEvent,
} from '../../scoring/target-lock';
import { SESSION_DURATION_MS, type TargetLockConfig } from './config';

export interface Target {
  id: number;
  x: number;
  y: number;
  radius: number;
  decoy: boolean;
  spawnedAt: number;
  expiresAt: number;
}

export interface ClickResult {
  event: TargetLockEvent;
  target?: Target;
}

/** Margem superior para os alvos não nascerem embaixo do HUD. */
const HUD_MARGIN = 64;

/** Simulação do Alvo Certo, sem DOM: tudo é dirigido por timestamps, o que facilita testes. */
export class TargetLockGame {
  readonly targets: Target[] = [];
  readonly events: TargetLockEvent[] = [];
  score = 0;
  combo = 0;
  bestCombo = 0;

  readonly endsAt: number;
  private nextSpawnAt: number;
  private nextId = 1;

  constructor(
    private readonly config: TargetLockConfig,
    private readonly rng: Rng,
    private arena: Size,
    readonly startedAt: number,
    readonly durationMs: number = SESSION_DURATION_MS,
  ) {
    this.endsAt = startedAt + durationMs;
    this.nextSpawnAt = startedAt;
  }

  setArena(size: Size): void {
    this.arena = size;
  }

  timeLeft(now: number): number {
    return Math.max(0, this.endsAt - now);
  }

  isOver(now: number): boolean {
    return now >= this.endsAt;
  }

  update(now: number): void {
    const t = Math.min(now, this.endsAt);

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];
      if (t < target.expiresAt) continue;
      this.removeAt(i, target.expiresAt);
      // Deixar a isca expirar é a resposta certa: sem penalidade.
      if (!target.decoy) this.penalize({ type: 'expired', t: target.expiresAt }, PENALTY_EXPIRED);
    }

    if (
      now < this.endsAt &&
      this.targets.length < this.config.maxTargets &&
      now >= this.nextSpawnAt
    ) {
      this.spawn(now);
      this.nextSpawnAt = now + this.spawnGap();
    }
  }

  click(x: number, y: number, t: number): ClickResult | null {
    if (t < this.startedAt || t >= this.endsAt) return null;

    // De trás para frente: o alvo desenhado por último fica por cima.
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];
      if (t < target.spawnedAt || t >= target.expiresAt) continue;
      if (Math.hypot(x - target.x, y - target.y) > target.radius) continue;

      this.removeAt(i, t);
      if (target.decoy) {
        const event: TargetLockEvent = { type: 'decoy', t };
        this.penalize(event, PENALTY_DECOY);
        return { event, target };
      }
      const reactionMs = t - target.spawnedAt;
      const points = hitPoints(this.config.lifetimeMs, reactionMs, this.combo);
      const event: TargetLockEvent = { type: 'hit', t, reactionMs, points };
      this.events.push(event);
      this.score += points;
      this.combo++;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      return { event, target };
    }

    const event: TargetLockEvent = { type: 'miss', t };
    this.penalize(event, PENALTY_MISS);
    return { event };
  }

  private penalize(event: TargetLockEvent, penalty: number): void {
    this.events.push(event);
    this.score = Math.max(0, this.score + penalty);
    this.combo = 0;
  }

  private removeAt(index: number, t: number): void {
    this.targets.splice(index, 1);
    this.nextSpawnAt = Math.max(this.nextSpawnAt, t + this.spawnGap());
  }

  private spawnGap(): number {
    const [min, max] = this.config.spawnGapMs;
    return randomRange(this.rng, min, max);
  }

  private spawn(now: number): void {
    const { radius, lifetimeMs, decoyRate } = this.config;
    const margin = radius + 8;
    const minX = margin;
    const maxX = Math.max(minX, this.arena.width - margin);
    const minY = Math.min(HUD_MARGIN + radius, this.arena.height / 2);
    const maxY = Math.max(minY, this.arena.height - margin);

    // Tenta algumas posições que não encostem nos alvos atuais.
    let x = 0;
    let y = 0;
    for (let attempt = 0; attempt < 20; attempt++) {
      x = randomRange(this.rng, minX, maxX);
      y = randomRange(this.rng, minY, maxY);
      const clear = this.targets.every(
        (o) => Math.hypot(o.x - x, o.y - y) > (o.radius + radius) * 1.5,
      );
      if (clear) break;
    }

    this.targets.push({
      id: this.nextId++,
      x,
      y,
      radius,
      decoy: this.rng() < decoyRate,
      spawnedAt: now,
      expiresAt: now + lifetimeMs,
    });
  }
}
