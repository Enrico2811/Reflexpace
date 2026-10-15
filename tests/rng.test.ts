import { describe, expect, it } from 'vitest';
import { createRng, dailySeed, hashSeed, randomRange } from '../src/core/rng';

describe('rng', () => {
  it('gera a mesma sequência para a mesma semente', () => {
    const a = createRng('missao');
    const b = createRng('missao');
    expect(Array.from({ length: 5 }, a)).toEqual(Array.from({ length: 5 }, b));
  });

  it('gera sequências diferentes para sementes diferentes', () => {
    expect(createRng(1)()).not.toBe(createRng(2)());
  });

  it('fica sempre em [0, 1)', () => {
    const rng = createRng(42);
    for (let i = 0; i < 10_000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('randomRange respeita os limites', () => {
    const rng = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = randomRange(rng, 10, 20);
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThan(20);
    }
  });

  it('hashSeed é estável', () => {
    expect(hashSeed('abc')).toBe(hashSeed('abc'));
    expect(hashSeed('abc')).not.toBe(hashSeed('abd'));
  });

  it('dailySeed usa a data UTC', () => {
    expect(dailySeed('target-lock', new Date('2026-10-15T23:30:00Z'))).toBe(
      'target-lock:2026-10-15',
    );
  });
});
