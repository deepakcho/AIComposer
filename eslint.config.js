// @ts-check
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({ baseDirectory: __dirname });

/**
 * AI Composer ESLint config.
 *
 * Layer boundaries (see docs/action-plan/design-principles.md):
 *   core  -> nothing
 *   dom   -> core
 *   plugin -> core
 *   adapter (react/angular/vue/web-component/ui) -> core + dom (+ plugins)
 *   app   -> anything
 */
module.exports = tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/tmp/**', '**/.nx/**', '**/.storybook/**'] },
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}'], extends: [js.configs.recommended] },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    extends: [...tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Examples, playground apps and stories are demos — console.log is the point.
    files: [
      'examples/**/*.ts',
      'examples/**/*.tsx',
      'apps/**/*.ts',
      'apps/**/*.tsx',
      'packages/*/src/stories/**/*.ts',
      'packages/*/src/stories/**/*.tsx',
    ],
    rules: { 'no-console': 'off' },
  },
  compat.config({
    plugins: ['@nx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allow: [],
          depConstraints: [
            { sourceTag: 'scope:core', onlyDependOnLibsWithTags: ['scope:core'] },
            { sourceTag: 'scope:dom', onlyDependOnLibsWithTags: ['scope:core', 'scope:dom'] },
            {
              sourceTag: 'scope:plugin',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:plugin'],
            },
            {
              sourceTag: 'scope:adapter',
              onlyDependOnLibsWithTags: [
                'scope:core',
                'scope:dom',
                'scope:adapter',
                'scope:plugin',
                'scope:testing',
              ],
            },
            {
              sourceTag: 'scope:testing',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:dom', 'scope:adapter'],
            },
            {
              sourceTag: 'scope:app',
              onlyDependOnLibsWithTags: [
                'scope:core',
                'scope:dom',
                'scope:adapter',
                'scope:plugin',
                'scope:app',
              ],
            },
          ],
        },
      ],
    },
  })
);
