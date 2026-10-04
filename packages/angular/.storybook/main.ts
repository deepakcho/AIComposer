import type { StorybookConfig } from '@storybook/angular';

/**
 * Angular Storybook runs through the angular.json builders (webpack-based).
 * Module resolution for @ai-composer/* comes from tsconfig paths
 * (tsconfig.storybook.json → tsconfig.base.json).
 */
const config: StorybookConfig = {
  framework: { name: '@storybook/angular', options: {} },
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
};

export default config;
