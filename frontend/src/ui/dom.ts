export function $<T extends HTMLElement = HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Elemento não encontrado: ${selector}`);
  return el;
}

export function formatMs(ms: number): string {
  return Number.isFinite(ms) ? `${Math.round(ms)} ms` : '—';
}

export function formatPercent(ratio: number): string {
  return Number.isFinite(ratio) ? `${Math.round(ratio * 100)}%` : '—';
}

export function formatScore(score: number): string {
  return Math.round(score).toLocaleString('pt-BR');
}
