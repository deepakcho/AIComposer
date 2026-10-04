import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ai-composer/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@ai-composer/dom': resolve(__dirname, '../../packages/dom/src/index.ts'),
      '@ai-composer/vue': resolve(__dirname, '../../packages/vue/src/index.ts'),
      '@ai-composer/plugin-mention': resolve(__dirname, '../../plugins/mention/src/index.ts'),
    },
  },
});
