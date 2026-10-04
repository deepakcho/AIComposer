# API · Commands

**Concept** — named, UI-independent operations. Toolbars and shortcuts bind to
ids, never implementations. Plugins contribute commands; adapters render them.

```ts
await editor.executeCommand('insertText', { text: 'hi' });
console.log(editor.canExecuteCommand('submit')); // false while disabled
```

## Built-in ids (`BUILTIN_COMMANDS`)

| Id | Payload | Notes |
| --- | --- | --- |
| `submit` | — | gated by disabled/readonly/submitting |
| `clear` | — | |
| `undo` / `redo` | — | gated by canUndo/canRedo |
| `insertText` | `{ text, at? }` \| string | |
| `insertNode` | `{ node, at? }` | |
| `focus` / `blur` | — | |
| `openTrigger` | `{ triggerId }` \| string | inserts the trigger char |
| `removeNode` | `{ key }` \| string | |
| `acceptSuggestion` | `{ item? }` | accepts highlighted when omitted |

## Custom commands

```ts
const off = editor.registerCommand({
  id: 'app.toggleCase',
  label: 'Toggle case',
  canExecute: ({ state }) => !state.empty,
  execute: ({ editor: target }) => {
    const text = target.serialize('text') as string;
    target.setValue(text === text.toUpperCase() ? text.toLowerCase() : text.toUpperCase());
  },
});
```

Plugin-contributed commands register via the plugin's `commands: [...]` array
(see [07-plugins.md](07-plugins.md)).

## Events

`commandExecute` fires with `{ id, payload }` for telemetry before execution.

Runnable version: [examples/core/04-commands.ts](../../examples/core/04-commands.ts)
