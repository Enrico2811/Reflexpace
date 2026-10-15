/** Gerador pseudoaleatório: retorna um número em [0, 1). */
export type Rng = () => number;

/** mulberry32: rápido, 32 bits e determinístico para a mesma semente. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash FNV-1a de 32 bits, para transformar textos em sementes numéricas. */
export function hashSeed(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function createRng(seed: string | number): Rng {
  return mulberry32(typeof seed === 'number' ? seed : hashSeed(seed));
}

export function randomRange(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min);
}

/** Semente da Missão Diária. Usa a data UTC para ser a mesma para todos os jogadores. */
export function dailySeed(mode: string, date: Date = new Date()): string {
  return `${mode}:${date.toISOString().slice(0, 10)}`;
}
