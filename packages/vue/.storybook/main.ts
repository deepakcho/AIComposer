import type { StorybookConfig } from '@storybook/vue3-vite';
import { resolve } from 'node:path';

const config: StorybookConfig = {
  framework: { name: '@storybook/vue3-vite', options: {} },
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  viteFinal: (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@ai-composer/core': resolve(__dirname, '../../../packages/core/src/index.ts'),
      '@ai-composer/dom': resolve(__dirname, '../../dom/src/index.ts'),
      '@ai-composer/vue': resolve(__dirname, '../src/index.ts'),
      '@ai-composer/plugin-mention': resolve(__dirname, '../../../plugins/mention/src/index.ts'),
    };
    return config;
  },
};

export default config;
