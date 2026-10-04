import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [angular()],
  resolve: {
    alias: {
      '@ai-composer/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@ai-composer/dom': resolve(__dirname, '../../packages/dom/src/index.ts'),
      '@ai-composer/angular': resolve(__dirname, '../../packages/angular/src/index.ts'),
      '@ai-composer/plugin-mention': resolve(__dirname, '../../plugins/mention/src/index.ts'),
    },
  },
});
