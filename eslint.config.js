import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['**/dist', '**/node_modules'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  prettier,
  { files: ['frontend/**'], languageOptions: { globals: globals.browser } },
  {
    files: ['backend/**', '*.config.{js,ts}', '*/*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
);
