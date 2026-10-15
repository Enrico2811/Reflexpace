import type { Difficulty } from '../../core/types';

export interface TargetLockConfig {
  radius: number;
  lifetimeMs: number;
  maxTargets: number;
  decoyRate: number;
  /** Intervalo aleatório entre um alvo sumir e o próximo surgir. */
  spawnGapMs: [number, number];
}

export const SESSION_DURATION_MS = 60_000;

export const TARGET_LOCK_CONFIGS: Record<Difficulty, TargetLockConfig> = {
  cadet: { radius: 34, lifetimeMs: 1600, maxTargets: 2, decoyRate: 0.1, spawnGapMs: [150, 450] },
  guardian: { radius: 26, lifetimeMs: 1200, maxTargets: 3, decoyRate: 0.2, spawnGapMs: [120, 380] },
  master: { radius: 18, lifetimeMs: 900, maxTargets: 4, decoyRate: 0.3, spawnGapMs: [100, 300] },
};
