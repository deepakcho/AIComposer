import { defineConfig } from 'vitest/config';
export default defineConfig({
  resolve: {
  },
  test: {
    name: 'themes',
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

