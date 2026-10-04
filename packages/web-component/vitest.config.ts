import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
      alias: {
        '@ai-composer/core': resolve(__dirname, '../core/src/index.ts'),
        '@ai-composer/dom': resolve(__dirname, '../dom/src/index.ts'),
        '@ai-composer/testing': resolve(__dirname, '../testing/src/index.ts'),
        '@ai-composer/plugin-mention': resolve(__dirname, '../../plugins/mention/src/index.ts'),
      },
  },
  test: {
    name: 'web-component',
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

