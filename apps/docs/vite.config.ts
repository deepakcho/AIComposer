import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Copies the built adapter Storybooks (dist/storybook/*) into the docs'
 * public dir so the embeds are served by the docs site itself — in dev and
 * in the static build. Relative iframe paths keep it GitHub Pages-safe.
 * Run `pnpm storybook:build` first; absent bundles are skipped.
 */
function copyStorybookBundles(): Plugin {
  const source = resolve(__dirname, '../../dist/storybook');
  const target = resolve(__dirname, 'public/storybook');
  return {
    name: 'copy-storybook-bundles',
    buildStart() {
      if (!existsSync(source)) return;
      rmSync(target, { recursive: true, force: true });
      cpSync(source, target, { recursive: true });
    },
  };
}

export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? '/AIComposer/' : '/',
  plugins: [react(), copyStorybookBundles()],
  resolve: {
    alias: {
      '@ai-composer/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@ai-composer/dom': resolve(__dirname, '../../packages/dom/src/index.ts'),
      '@ai-composer/react': resolve(__dirname, '../../packages/react/src/index.ts'),
      '@ai-composer/plugin-mention': resolve(__dirname, '../../plugins/mention/src/index.ts'),
      '@ai-composer/plugin-command': resolve(__dirname, '../../plugins/command/src/index.ts'),
    },
  },
  build: {
    // Docs is a single page; keep chunking simple.
    chunkSizeWarningLimit: 1600,
  },
});
