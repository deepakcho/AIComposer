import { defineConfig } from 'vitest/config';
export default defineConfig({
  resolve: {
  },
  test: {
    name: 'core',
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

