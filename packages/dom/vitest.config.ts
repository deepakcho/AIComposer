import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
      alias: {
        '@ai-composer/core': resolve(__dirname, '../core/src/index.ts'),
      },
  },
  test: {
    name: 'dom',
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

