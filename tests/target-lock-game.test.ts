import { describe, expect, it } from 'vitest';
import { createRng } from '../src/core/rng';
import type { TargetLockConfig } from '../src/modes/target-lock/config';
import { TargetLockGame } from '../src/modes/target-lock/game';

const ARENA = { width: 800, height: 600 };

function makeGame(overrides: Partial<TargetLockConfig> = {}): TargetLockGame {
  const config: TargetLockConfig = {
    radius: 30,
    lifetimeMs: 1600,
    maxTargets: 1,
    decoyRate: 0,
    spawnGapMs: [200, 200],
    ...overrides,
  };
  return new TargetLockGame(config, createRng('teste'), ARENA, 0, 60_000);
}

describe('TargetLockGame', () => {
  it('cria um alvo no primeiro update, dentro da arena', () => {
    const game = makeGame();
    game.update(0);
    expect(game.targets).toHaveLength(1);
    const [t] = game.targets;
    expect(t.x).toBeGreaterThanOrEqual(t.radius);
    expect(t.x).toBeLessThanOrEqual(ARENA.width - t.radius);
    expect(t.y).toBeLessThanOrEqual(ARENA.height - t.radius);
  });

  it('acerto mede a reação pelo timestamp do clique', () => {
    const game = makeGame();
    game.update(0);
    const [t] = game.targets;
    const result = game.click(t.x, t.y, 300);
    expect(result?.event).toMatchObject({ type: 'hit', reactionMs: 300, points: 181 });
    expect(game.score).toBe(181);
    expect(game.combo).toBe(1);
    expect(game.targets).toHaveLength(0);
  });

  it('clique no vazio é erro e zera o combo', () => {
    const game = makeGame();
    game.update(0);
    const [t] = game.targets;
    game.click(t.x, t.y, 100);
    game.click(-50, -50, 200);
    expect(game.events.at(-1)?.type).toBe('miss');
    expect(game.combo).toBe(0);
    expect(game.bestCombo).toBe(1);
  });

  it('alvo válido expirado gera penalidade; score nunca fica negativo', () => {
    const game = makeGame();
    game.update(0);
    game.update(1600);
    expect(game.events).toEqual([{ type: 'expired', t: 1600 }]);
    expect(game.score).toBe(0);
  });

  it('isca clicada é penalizada; isca expirada não', () => {
    const game = makeGame({ decoyRate: 1, maxTargets: 2, spawnGapMs: [0, 0] });
    game.update(0);
    game.update(1);
    const [first, second] = game.targets;
    expect(first.decoy && second.decoy).toBe(true);

    game.click(first.x, first.y, 100);
    expect(game.events).toEqual([{ type: 'decoy', t: 100 }]);

    game.update(5000);
    expect(game.events.filter((e) => e.type !== 'decoy')).toHaveLength(0);
  });

  it('ignora cliques fora da sessão e termina no tempo certo', () => {
    const game = makeGame();
    expect(game.click(0, 0, -1)).toBeNull();
    expect(game.isOver(59_999)).toBe(false);
    expect(game.isOver(60_000)).toBe(true);
    expect(game.click(0, 0, 60_000)).toBeNull();
  });

  it('é determinístico para a mesma semente', () => {
    const a = makeGame();
    const b = makeGame();
    a.update(0);
    b.update(0);
    expect(a.targets).toEqual(b.targets);
  });
});
