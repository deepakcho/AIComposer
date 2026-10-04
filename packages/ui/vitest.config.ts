import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
      alias: {
        '@ai-composer/core': resolve(__dirname, '../core/src/index.ts'),
        '@ai-composer/dom': resolve(__dirname, '../dom/src/index.ts'),
      },
  },
  test: {
    name: 'ui',
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

