import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
      alias: {
        '@ai-composer/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      },
  },
  test: {
    name: 'plugin-command',
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

