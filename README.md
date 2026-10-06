# AI Composer

A **framework-agnostic, pluggable AI composer** — one engine, rendered by
React, Angular, Vue, Web Components or plain JavaScript.

> Build the engine once, let frameworks render it many ways, and let
> applications own the final HTML experience.

## Packages

| Package | Purpose |
| --- | --- |
| `@ai-composer/core` | Framework-independent model, state, commands, events, plugins, history, serialization |
| `@ai-composer/dom` | contentEditable surface, selection mapping, clipboard, templates, suggestion list |
| `@ai-composer/react` | React components + hooks |
| `@ai-composer/angular` | Standalone components, signals, ControlValueAccessor |
| `@ai-composer/vue` | Composition-API components, `v-model` |
| `@ai-composer/web-component` | Universal `<ai-composer-editor>` custom element |
| `@ai-composer/themes` | Design tokens + default/dark/compact themes |
| `@ai-composer/plugin-mention` | `@mention` trigger plugin |
| `@ai-composer/plugin-command` | `/slash` command plugin |
| `@ai-composer/testing` | Shared contract test suite for all adapters |

## Quick start

```ts
import { createAIComposer } from '@ai-composer/core';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { commandPlugin } from '@ai-composer/plugin-command';

const editor = createAIComposer({
  plugins: [
    mentionPlugin({ trigger: '@', items: [{ id: '1', label: 'Ada Lovelace' }] }),
    commandPlugin({ trigger: '/' }),
  ],
});
```

```tsx
// React
import { AIComposer } from '@ai-composer/react';

<AIComposer editor={editor} mode="chat" placeholder="Ask anything..." />;
```

```html
<!-- Web Component -->
<ai-composer-editor mode="chat" placeholder="Ask anything..."></ai-composer-editor>
```

## Repo layout

```
ai-composer/
├── apps/
│   ├── docs/              documentation site: API reference + live demos on one page
│   └── playground-*/      dev playgrounds (vanilla, react, vue, angular)
├── packages/              core, dom, adapters (react/vue/angular/web-component), themes, testing
├── plugins/               mention, command
└── docs/adr/              architecture decision records
```

## Commands

Nx manages everything:

```bash
pnpm build                # build all packages + apps
pnpm test                 # unit + contract tests (all packages)
pnpm lint                 # eslint incl. module boundaries
pnpm typecheck
pnpm affected:test        # run only what a PR touches

pnpm dev:docs             # documentation site (localhost:4300)
pnpm dev:react            # playgrounds: dev:vanilla | dev:vue | dev:angular

pnpm storybook:react      # Storybook per adapter: 6006
pnpm storybook:vue        # 6007
pnpm storybook:angular    # 6008
pnpm storybook:wc         # 6009 (web components + vanilla JS stories)
pnpm storybook:build      # static bundles for all four → dist/storybook/*
pnpm docs:build           # static docs bundle → apps/docs/dist (host anywhere)
```

## Documentation

**Live demo and docs:** [deepakcho.github.io/AIComposer](https://deepakcho.github.io/AIComposer/)

Run the docs site — API reference, live demos and template showcases on a
single page:

```bash
pnpm dev:docs
```

The `main` branch deploys the docs and embedded Storybooks to GitHub Pages.

Architecture decisions live in [docs/adr](docs/adr).
