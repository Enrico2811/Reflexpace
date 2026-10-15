import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Caminhos relativos para funcionar no GitHub Pages (subpasta do repositório).
  base: './',
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
