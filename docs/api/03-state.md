# API · Editor State

**Concept** — one observable, framework-neutral snapshot. Adapters expose it
as React state, Angular signals, Vue refs, Svelte stores; core never knows.

```ts
const state = editor.getState();
editor.subscribe((state) => console.log(state.text ?? state.empty));
```

## `PromptEditorState`

| Field | Type | Notes |
| --- | --- | --- |
| `value` | `PromptDocument` | live document reference |
| `focused` | `boolean` | |
| `disabled` / `readonly` | `boolean` | from config |
| `submitting` | `boolean` | true while `submit.onSubmit` runs |
| `selection` | `SelectionState` | |
| `activeTrigger` | `TriggerState \| null` | live `@query` session |
| `suggestions` | `SuggestionItem[]` | current menu items |
| `activeSuggestionIndex` | `number` | highlighted row (-1 none) |
| `attachments` | `AttachmentNode[]` | chips currently in the document |
| `canUndo` / `canRedo` | `boolean` | |
| `mode` | `string` | active preset |
| `placeholder` | `string` | |
| `empty` | `boolean` | document length 0 |

`TriggerState = { triggerId, query, nodeIndex, triggerOffset, endOffset }`.

## `SuggestionItem`

```ts
interface SuggestionItem {
  id: string;          // entity id (flows into the node)
  label: string;       // menu + chip label
  description?: string;
  group?: string;
  icon?: string;       // name/URL — rendering is UI-side
  data?: Record<string, unknown>;  // plugin payload → node metadata/data
}
```

## Snapshot semantics

- `getState()` returns the **same object reference** until the next change —
  safe for `useSyncExternalStore`/equality checks.
- `subscribe` fires synchronously after each change with a fresh snapshot.

## Framework examples

```tsx
// React
const state = usePromptState(editor);
return <Footer>{state.canUndo ? 'Undo available' : '—'}</Footer>;
```

```ts
// Angular (inside <aic-prompt-editor>)
const state = injectPromptState(); // Signal<PromptEditorState | null>
```

```ts
// Vue
const state = usePromptState(editor); // Readonly<Ref<PromptEditorState>>
```
