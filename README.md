# AI Composer

A **framework-agnostic, pluggable AI prompt composer** — one engine, rendered by
React, Angular, Vue, Svelte, Web Components or plain JavaScript.

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
| `@ai-composer/ui` | Optional ready-made UI |
| `@ai-composer/themes` | Design tokens + default/dark/compact themes |
| `@ai-composer/plugin-mention` | `@mention` trigger plugin |
| `@ai-composer/plugin-command` | `/slash` command plugin |
| `@ai-composer/testing` | Shared contract test suite for all adapters |

## Quick start

```ts
import { createPromptEditor } from '@ai-composer/core';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { commandPlugin } from '@ai-composer/plugin-command';

const editor = createPromptEditor({
  plugins: [
    mentionPlugin({ trigger: '@', items: [{ id: '1', label: 'Ada Lovelace' }] }),
    commandPlugin({ trigger: '/' }),
  ],
});
```

```tsx
// React
import { PromptEditor } from '@ai-composer/react';

<PromptEditor editor={editor} mode="chat" placeholder="Ask anything..." />;
```

```html
<!-- Web Component -->
<ai-composer-editor mode="chat" placeholder="Ask anything..."></ai-composer-editor>
```

## Repo layout

```
ai-composer/
├── apps/          playgrounds (vanilla, react, vue, angular) + docs
├── packages/      core, dom, adapters, ui, themes, testing
├── plugins/       mention, command, …
├── examples/      runnable per-API and per-framework examples
├── docs/          action plans, ADRs, API reference, framework guides
└── tools/         (reserved) generators & scripts
```

## Commands

Nx manages everything:

```bash
pnpm build                # build all packages + playgrounds
pnpm test                 # unit + contract tests (all packages)
pnpm lint                 # eslint incl. module boundaries
pnpm typecheck
pnpm affected:test        # run only what a PR touches

pnpm dev:react            # playgrounds: dev:vanilla | dev:vue | dev:angular

pnpm storybook:react      # Storybook per adapter: 6006
pnpm storybook:vue        # 6007
pnpm storybook:angular    # 6008
pnpm storybook:wc         # 6009 (web components + vanilla JS stories)
pnpm storybook:build      # static bundles for all four → dist/storybook/*
```

## Documentation

- [Action plan](docs/action-plan/00-master-plan.md) — phases, tasks, definition of done
- [Design principles](docs/action-plan/design-principles.md)
- [API reference](docs/api/) — every subsystem with examples
- [Framework guides](docs/frameworks/) — React, Angular, Vue, Web Component, Vanilla
- [ADRs](docs/adr/) — architecture decision records

## Status

Phase 1–2 complete (foundation + core engine), Phase 3+ in progress — see the
[status board](docs/action-plan/00-master-plan.md#status-board).
