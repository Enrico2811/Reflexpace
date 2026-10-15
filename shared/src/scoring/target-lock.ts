// Fórmulas da seção 5.1 do GAME_DESIGN. Ponto de partida, serão calibradas com testes reais.

export const BASE_HIT_POINTS = 100;
export const MAX_SPEED_BONUS = 100;
export const MAX_COMBO_FOR_MULTIPLIER = 20;
export const COMBO_STEP = 0.05;

export const PENALTY_MISS = -25;
export const PENALTY_DECOY = -100;
export const PENALTY_EXPIRED = -15;

export function speedBonus(lifetimeMs: number, reactionMs: number): number {
  return Math.max(0, (lifetimeMs - reactionMs) / lifetimeMs) * MAX_SPEED_BONUS;
}

/** `combo` é a sequência ANTES deste acerto. */
export function comboMultiplier(combo: number): number {
  return 1 + Math.min(combo, MAX_COMBO_FOR_MULTIPLIER) * COMBO_STEP;
}

export function hitPoints(lifetimeMs: number, reactionMs: number, combo: number): number {
  return Math.round(
    (BASE_HIT_POINTS + speedBonus(lifetimeMs, reactionMs)) * comboMultiplier(combo),
  );
}

export type TargetLockEvent =
  | { type: 'hit'; t: number; reactionMs: number; points: number }
  | { type: 'miss'; t: number }
  | { type: 'decoy'; t: number }
  | { type: 'expired'; t: number };

export type TargetLockMetrics = {
  reaction_median: number;
  accuracy: number;
  hits: number;
  misses: number;
  expired: number;
  decoys_hit: number;
  best_combo: number;
};

export function median(values: readonly number[]): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function computeTargetLockMetrics(
  events: readonly TargetLockEvent[],
  bestCombo: number,
): TargetLockMetrics {
  const reactions: number[] = [];
  let misses = 0;
  let expired = 0;
  let decoys = 0;
  for (const e of events) {
    if (e.type === 'hit') reactions.push(e.reactionMs);
    else if (e.type === 'miss') misses++;
    else if (e.type === 'expired') expired++;
    else decoys++;
  }
  const hits = reactions.length;
  const attempts = hits + misses + expired;
  return {
    reaction_median: median(reactions),
    accuracy: attempts ? hits / attempts : NaN,
    hits,
    misses,
    expired,
    decoys_hit: decoys,
    best_combo: bestCombo,
  };
}
