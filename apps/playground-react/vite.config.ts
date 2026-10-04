import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ai-composer/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@ai-composer/dom': resolve(__dirname, '../../packages/dom/src/index.ts'),
      '@ai-composer/react': resolve(__dirname, '../../packages/react/src/index.ts'),
      '@ai-composer/plugin-mention': resolve(__dirname, '../../plugins/mention/src/index.ts'),
      '@ai-composer/plugin-command': resolve(__dirname, '../../plugins/command/src/index.ts'),
    },
  },
});
