#!/usr/bin/env node
/**
 * One-off scaffolder for the AI Composer Nx workspace.
 * Generates per-package config files (package.json / project.json / tsconfigs / vitest config).
 * Run from repo root: node tools/scaffold.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, relative, posix } from 'node:path';

const root = process.cwd();

const LIBS = [
  {
    dir: 'packages/core', project: 'core', pkg: '@ai-composer/core',
    tags: ['scope:core', 'type:lib'], env: 'node', peers: {}, deps: { vitest: '^2.1.8' },
    build: 'tsc', description: 'Framework-independent prompt editor engine: model, state, events, commands, triggers, plugins, history, serialization.',
  },
  {
    dir: 'packages/dom', project: 'dom', pkg: '@ai-composer/dom',
    tags: ['scope:dom', 'type:lib'], env: 'jsdom',
    peers: { '@ai-composer/core': '^0.1.0' },
    deps: { '@ai-composer/core': 'workspace:*', vitest: '^2.1.8', jsdom: '^25.0.1' },
    build: 'tsc', description: 'Browser layer: contentEditable surface, selection mapping, clipboard, templates and suggestion list.',
  },
  {
    dir: 'packages/react', project: 'react', pkg: '@ai-composer/react',
    tags: ['scope:adapter', 'type:lib', 'framework:react'], env: 'jsdom',
    peers: { '@ai-composer/core': '^0.1.0', '@ai-composer/dom': '^0.1.0', react: '^18.0.0 || ^19.0.0' },
    deps: {
      '@ai-composer/core': 'workspace:*', '@ai-composer/dom': 'workspace:*',
      react: '^18.3.1', 'react-dom': '^18.3.1', '@types/react': '^18.3.12', vitest: '^2.1.8', jsdom: '^25.0.1',
    },
    build: 'tsc', description: 'React adapter: <PromptEditor> component family and hooks.',
  },
  {
    dir: 'packages/angular', project: 'angular', pkg: '@ai-composer/angular',
    tags: ['scope:adapter', 'type:lib', 'framework:angular'], env: 'jsdom',
    peers: { '@ai-composer/core': '^0.1.0', '@ai-composer/dom': '^0.1.0', '@angular/core': '>=16.0.0' },
    deps: {
      '@ai-composer/core': 'workspace:*', '@ai-composer/dom': 'workspace:*',
      '@angular/core': '^19.0.0', rxjs: '^7.8.1', vitest: '^2.1.8', jsdom: '^25.0.1',
    },
    build: 'typecheck', description: 'Angular adapter: standalone components, signals, content projection, ControlValueAccessor.',
  },
  {
    dir: 'packages/vue', project: 'vue', pkg: '@ai-composer/vue',
    tags: ['scope:adapter', 'type:lib', 'framework:vue'], env: 'jsdom',
    peers: { '@ai-composer/core': '^0.1.0', '@ai-composer/dom': '^0.1.0', vue: '^3.4.0' },
    deps: { '@ai-composer/core': 'workspace:*', '@ai-composer/dom': 'workspace:*', vue: '^3.5.13', vitest: '^2.1.8', jsdom: '^25.0.1' },
    build: 'tsc', description: 'Vue adapter: composition-API components, v-model, slots.',
  },
  {
    dir: 'packages/web-component', project: 'web-component', pkg: '@ai-composer/web-component',
    tags: ['scope:adapter', 'type:lib'], env: 'jsdom',
    peers: { '@ai-composer/core': '^0.1.0', '@ai-composer/dom': '^0.1.0' },
    deps: { '@ai-composer/core': 'workspace:*', '@ai-composer/dom': 'workspace:*', vitest: '^2.1.8', jsdom: '^25.0.1' },
    build: 'tsc', description: 'Universal <ai-composer-editor> custom element.',
  },
  {
    dir: 'packages/ui', project: 'ui', pkg: '@ai-composer/ui',
    tags: ['scope:adapter', 'type:lib'], env: 'jsdom',
    peers: { '@ai-composer/core': '^0.1.0', '@ai-composer/dom': '^0.1.0' },
    deps: { '@ai-composer/core': 'workspace:*', '@ai-composer/dom': 'workspace:*', vitest: '^2.1.8' },
    build: 'tsc', description: 'Optional ready-made UI on top of core + dom.',
  },
  {
    dir: 'packages/themes', project: 'themes', pkg: '@ai-composer/themes',
    tags: ['scope:adapter', 'type:lib'], env: 'node',
    peers: {}, deps: { vitest: '^2.1.8' },
    build: 'tsc', css: true, description: 'Design tokens and default/dark/compact themes (CSS custom properties).',
  },
  {
    dir: 'packages/testing', project: 'testing', pkg: '@ai-composer/testing',
    tags: ['scope:testing', 'type:lib'], env: 'jsdom',
    peers: { '@ai-composer/core': '^0.1.0', '@ai-composer/dom': '^0.1.0' },
    deps: { '@ai-composer/core': 'workspace:*', '@ai-composer/dom': 'workspace:*', vitest: '^2.1.8', jsdom: '^25.0.1' },
    build: 'tsc', description: 'Shared contract test suite every adapter must pass.',
  },
  {
    dir: 'plugins/mention', project: 'plugin-mention', pkg: '@ai-composer/plugin-mention',
    tags: ['scope:plugin', 'type:lib'], env: 'node',
    peers: { '@ai-composer/core': '^0.1.0' },
    deps: { '@ai-composer/core': 'workspace:*', vitest: '^2.1.8' },
    build: 'tsc', description: '@mention trigger plugin.',
  },
  {
    dir: 'plugins/command', project: 'plugin-command', pkg: '@ai-composer/plugin-command',
    tags: ['scope:plugin', 'type:lib'], env: 'node',
    peers: { '@ai-composer/core': '^0.1.0' },
    deps: { '@ai-composer/core': 'workspace:*', vitest: '^2.1.8' },
    build: 'tsc', description: '/slash command trigger plugin.',
  },
];

// pkg name -> src dir, used to build vitest aliases to package sources
const PKG_DIR = Object.fromEntries(LIBS.map((l) => [l.pkg, l.dir]));

const write = (path, content) => {
  mkdirSync(join(root, path, '..'), { recursive: true });
  writeFileSync(join(root, path), content.trimStart() + '\n');
};

const relImport = (fromDir, toDir) => {
  const r = posix.normalize(relative(fromDir, toDir));
  return r.startsWith('.') ? r : `./${r}`;
};

for (const lib of LIBS) {
  const { dir, project, pkg, tags, env, peers, deps, build, css } = lib;

  const exports = css
    ? {
        '.': { types: './dist/index.d.ts', default: './dist/index.js' },
        './css/*': './css/*',
        './package.json': './package.json',
      }
    : {
        '.': { types: './dist/index.d.ts', default: './dist/index.js' },
        './package.json': './package.json',
      };
  write(
    `${dir}/package.json`,
    JSON.stringify(
      {
        name: pkg,
        version: '0.1.0',
        type: 'module',
        license: 'MIT',
        sideEffects: css ? ['*.css'] : false,
        main: './dist/index.js',
        types: './dist/index.d.ts',
        exports,
        ...(css ? { style: './css/default.css' } : {}),
        peerDependencies: peers,
        devDependencies: deps,
      },
      null,
      2
    )
  );

  const targets = {};
  if (build === 'tsc') {
    targets.build = {
      executor: '@nx/js:tsc',
      outputs: ['{options.outputPath}'],
      options: {
        outputPath: `${dir}/dist`,
        main: `${dir}/src/index.ts`,
        tsConfig: `${dir}/tsconfig.lib.json`,
        rootDir: `${dir}/src`,
        assets: [
          { input: `../${dir}`, glob: '*.md', output: '.' },
          ...(css ? [{ input: `${dir}/css`, glob: '**/*', output: './css' }] : []),
        ],
        generateExportsIfAbsent: false,
      },
    };
  } else if (build === 'typecheck') {
    targets.build = {
      executor: 'nx:run-commands',
      options: { command: `tsc -p ${dir}/tsconfig.lib.json --noEmit` },
    };
  }
  targets.test = {
    executor: 'nx:run-commands',
    options: { command: `vitest run --project ${project} --passWithNoTests` },
  };
  targets.lint = {
    executor: '@nx/eslint:lint',
    outputs: ['{options.outputFile}'],
    options: { lintFilePatterns: [`${dir}/**/*.ts`, `${dir}/**/*.tsx`] },
  };
  targets.typecheck = {
    executor: 'nx:run-commands',
    options: { command: `tsc -p ${dir}/tsconfig.spec.json --noEmit` },
  };

  write(
    `${dir}/project.json`,
    JSON.stringify(
      {
        name: project,
        $schema: '../node_modules/nx/schemas/project-schema.json',
        sourceRoot: `${dir}/src`,
        projectType: 'library',
        tags,
        targets,
      },
      null,
      2
    )
  );

  write(
    `${dir}/tsconfig.json`,
    JSON.stringify(
      {
        extends: '../../tsconfig.base.json',
        compilerOptions: { types: [] },
        include: ['src/**/*.ts', 'src/**/*.tsx', 'vitest.config.ts'],
        exclude: ['node_modules', 'dist'],
      },
      null,
      2
    )
  );

  write(
    `${dir}/tsconfig.lib.json`,
    JSON.stringify(
      {
        extends: './tsconfig.json',
        compilerOptions: {
          declaration: true,
          declarationMap: true,
          stripInternal: true,
          outDir: `../../dist/${dir}`,
        },
        exclude: ['**/*.test.ts', '**/*.test.tsx', 'vitest.config.ts', 'src/test-setup.ts'],
      },
      null,
      2
    )
  );

  write(
    `${dir}/tsconfig.spec.json`,
    JSON.stringify(
      {
        extends: './tsconfig.json',
        compilerOptions: { noEmit: true, types: ['vitest'] },
        include: ['src/**/*.ts', 'src/**/*.tsx', 'vitest.config.ts'],
      },
      null,
      2
    )
  );

  const aliases = Object.keys(deps).filter((d) => d.startsWith('@ai-composer/'));
  const aliasLines = aliases
    .map((dep) => `        '${dep}': resolve(__dirname, '${relImport(dir, PKG_DIR[dep])}/src/index.ts'),`)
    .join('\n');
  write(
    `${dir}/vitest.config.ts`,
    `import { defineConfig } from 'vitest/config';\n` +
      `import { resolve } from 'node:path';\n\n` +
      `export default defineConfig({\n` +
      `  resolve: {\n` +
      (aliasLines ? `      alias: {\n${aliasLines}\n      },\n` : '') +
      `  },\n` +
      `  test: {\n` +
      `    name: '${project}',\n` +
      `    environment: '${env}',\n` +
      `    include: ['src/**/*.test.{ts,tsx}'],\n` +
      `  },\n` +
      `});\n`
  );

  write(`${dir}/README.md`, `# ${pkg}\n\n${lib.description}\n\nSee [\`docs/\`](../../docs/README.md) for guides and API reference.\n`);
}

console.log(`Scaffolded ${LIBS.length} libraries.`);
