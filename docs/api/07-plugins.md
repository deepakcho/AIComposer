# API · Plugins

**Concept** — plugins are the product's main extension surface: plain objects
with declarative contributions plus optional imperative wiring (ADR-0004).

```ts
import { createPromptEditor, type PromptPlugin } from '@ai-composer/core';

const shoutPlugin: PromptPlugin = {
  name: 'shout',
  version: '1.0.0',
  commands: [{ id: 'shout.upper', execute: ({ editor }) => editor.setValue('LOUD') }],
  triggers: [{ id: 'shout', character: '!', type: 'command', search: () => [] }],
  nodeTypes: [],   // NodeDefinition[]
  serializers: [], // Serializer[]
  setup(context) {
    const off = context.events.on('change', () => console.log('changed'));
    context.onCleanup(off);
  },
  destroy() { /* final cleanup */ },
};

const editor = createPromptEditor({ plugins: [shoutPlugin] });
```

## `PluginContext` (the scoped capability set)

| Capability | What it is |
| --- | --- |
| `editor` | full **public** editor API |
| `getConfig()` | live config |
| `commands` / `triggers` / `nodes` / `serializers` | registries |
| `events` | `on/once/off` only — plugins listen, never emit |
| `onCleanup(fn)` | teardown registered with the plugin |

Not exposed: history internals, trigger engine, document mutation paths,
event `emit`.

## Lifecycle guarantees

- Install-time contributions register **before** `setup`.
- A throwing `setup` fully rolls the plugin back — the editor keeps running.
- Unsubscribe (or editor `destroy`) removes every contribution + cleanup.

## Runtime install/remove

```ts
const off = editor.registerPlugin(shoutPlugin);
// ... later
off(); // contributions + onCleanup + destroy run
```

## Ready-made plugins

| Package | Plugin | Trigger |
| --- | --- | --- |
| `@ai-composer/plugin-mention` | `mentionPlugin({ items?, search?, trigger?, allowSpaces?, select?, limit? })` | `@` |
| `@ai-composer/plugin-command` | `commandPlugin({ commands: [{ id, label, description?, run?, data? }] })` | `/` |

```ts
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { commandPlugin } from '@ai-composer/plugin-command';

createPromptEditor({
  plugins: [
    mentionPlugin({ items: [{ id: 'u1', label: 'Ada Lovelace', description: 'Eng' }] }),
    commandPlugin({
      commands: [
        { id: 'summarize', label: 'Summarize' },                     // inserts a node
        { id: 'reset', label: 'Reset', run: (editor) => editor.clear() }, // runs immediately
      ],
    }),
  ],
});
```

Runnable version: [examples/core/08-custom-plugin.ts](../../examples/core/08-custom-plugin.ts)
