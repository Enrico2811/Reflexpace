import { describe, expect, it } from 'vitest';
import {
  comboMultiplier,
  computeTargetLockMetrics,
  hitPoints,
  median,
  speedBonus,
} from '../src/scoring/target-lock';

describe('pontuação do Alvo Certo', () => {
  it('bônus de velocidade vai de 100 (instantâneo) a 0 (no fim da vida)', () => {
    expect(speedBonus(1600, 0)).toBe(100);
    expect(speedBonus(1600, 800)).toBe(50);
    expect(speedBonus(1600, 1600)).toBe(0);
    expect(speedBonus(1600, 2000)).toBe(0);
  });

  it('multiplicador de combo cresce 5% por acerto até 20', () => {
    expect(comboMultiplier(0)).toBe(1);
    expect(comboMultiplier(10)).toBeCloseTo(1.5);
    expect(comboMultiplier(20)).toBeCloseTo(2);
    expect(comboMultiplier(50)).toBeCloseTo(2);
  });

  it('pontos do acerto combinam base, velocidade e combo', () => {
    expect(hitPoints(1600, 800, 0)).toBe(150);
    expect(hitPoints(1600, 800, 10)).toBe(225);
  });

  it('mediana', () => {
    expect(median([])).toBeNaN();
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it('métricas: precisão ignora iscas, conforme o design', () => {
    const m = computeTargetLockMetrics(
      [
        { type: 'hit', t: 0, reactionMs: 300, points: 0 },
        { type: 'hit', t: 0, reactionMs: 500, points: 0 },
        { type: 'miss', t: 0 },
        { type: 'expired', t: 0 },
        { type: 'decoy', t: 0 },
      ],
      2,
    );
    expect(m.reaction_median).toBe(400);
    expect(m.accuracy).toBe(0.5);
    expect(m.decoys_hit).toBe(1);
    expect(m.best_combo).toBe(2);
  });
});
