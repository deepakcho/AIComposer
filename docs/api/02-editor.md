# API · The Editor

**Concept** — `createPromptEditor()` builds the framework-independent engine.
Everything an adapter does is mount this object.

```ts
import { createPromptEditor } from '@ai-composer/core';

const editor = createPromptEditor({
  mode: 'chat',
  placeholder: 'Ask anything…',
  plugins: [],                       // see 07-plugins.md
  submit: { clearOnSubmit: true, onSubmit: async (value) => send(value) },
});

editor.insertText('hello');
await editor.submit();
```

## Options (`PromptEditorOptions`)

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `PromptDocument \| PromptNode[] \| string` | empty | initial value |
| `plugins` | `PromptPlugin[]` | `[]` | installed at creation |
| `nodeTypes` / `serializers` | arrays | built-ins | extra/override contributions |
| `mode` | `string` | `'default'` | preset name |
| `placeholder` | `string` | `''` | |
| `disabled` / `readonly` | `boolean` | `false` | |
| `submitKey` | `'enter' \| 'shift-enter' \| 'none'` | `'enter'` | DOM Enter policy |
| `history` | `{ limit?, mergeWindowMs? }` | `{200, 500}` | |
| `submit` | `SubmitConfig` | — | `onSubmit(value, editor)`, `clearOnSubmit`, `allowEmpty` |

## Value API

```ts
editor.getValue(): PromptDocument
editor.setValue(value, { source?, history?, label? }): void
editor.insertText(text, at?): void                  // replaces selection
editor.insertNode(node, { at?, trailingSpace? }): void  // chip + trailing space
editor.removeNode(key): void
editor.clear(): void
editor.replaceRange(range, nodes, { trailingSpace? }): void  // single history step
editor.applyViewUpdate(doc, selection?): void       // view-layer reconciliation (user input)
```

## Selection / focus / lifecycle

```ts
editor.getSelection(): SelectionState
editor.setSelection(selection): void        // clamped + emits selectionChange
editor.focus() / editor.blur()              // delegates to the attached view
editor.setFocused(bool)                     // view reports native focus
editor.attachView(view): Unsubscribe        // DOM layer registers itself
editor.isDestroyed(): boolean
editor.destroy()                            // emits 'destroy', cleans everything
```

## Commands / triggers / registries

```ts
await editor.executeCommand(id, payload?): Promise<void>
editor.canExecuteCommand(id, payload?): boolean
editor.registerPlugin(plugin): Unsubscribe
editor.registerTrigger(t) / registerCommand(c) / registerNodeType(d) / registerSerializer(s)
editor.getActiveTrigger(): TriggerState | null
await editor.acceptSuggestion(item?): Promise<void>
editor.moveSuggestionSelection(delta): void
editor.closeTrigger(reason?): void
editor.openTrigger(triggerId): void         // inserts the trigger char at the caret
```

## Config / state / serialization

```ts
editor.getState(): PromptEditorState        // snapshot (stable ref until next change)
editor.subscribe(listener): Unsubscribe     // state changes (adapters' re-render source)
editor.getConfig() / editor.configure(patch)
editor.setMode(m) / setDisabled(b) / setReadonly(b)
editor.serialize(format): unknown           // see 09-serialization.md
editor.transaction(fn, { label?, history? }): void
editor.undo() / editor.redo()
```

## Advanced

- `submit()` pipeline: guard (disabled/readonly/empty) → `beforeSubmit`
  (cancellable) → `submitting=true` → `submit.onSubmit` (errors captured as
  `error` events, never thrown) → `submit` event → optional clear.
- Mutations after `destroy()` throw `PromptEditorError('[EDITOR_DESTROYED]…')`.
- Reads (`getValue`, `getState`, `serialize`) stay safe after destroy for
  teardown code.

Runnable version: [examples/core/02-create-editor.ts](../../examples/core/02-create-editor.ts)
