# API · Events

**Concept** — one typed contract for every adapter. `on()` returns an
unsubscribe; core has zero framework emitters.

```ts
const off = editor.on('change', (event) => {
  console.log(event.source, event.value); // 'user' | 'api' | 'plugin' | 'undo' | 'redo'
});
off();
editor.once('submit', (event) => console.log(event.value));
```

## Event map

| Event | Payload | Fires when |
| --- | --- | --- |
| `change` | `{ value, source }` | any value change |
| `input` | `{ value, source:'user' }` | user edits only (typing/paste) |
| `focus` / `blur` | `{ focused }` | native focus changes |
| `selectionChange` | `{ selection }` | caret/selection moved |
| `beforeSubmit` | `{ value, preventDefault() }` | cancellable pre-submit |
| `submit` | `{ value }` | submit finished (success or handled error) |
| `triggerOpen` | `{ triggerId, query }` | trigger session opens |
| `triggerClose` | `{ triggerId, reason }` | select/escape/blur/input/manual |
| `suggestionsChange` | `{ triggerId, suggestions, activeIndex }` | menu updated |
| `nodeInsert` / `nodeRemove` | `{ node, index }` | chip lifecycle |
| `attachmentAdd` / `attachmentRemove` | `{ attachment }` | attachment chips |
| `commandExecute` | `{ id, payload? }` | command dispatched |
| `modeChange` | `{ mode }` | preset switched |
| `error` | `{ error, phase? }` | handler failures (`submit`, `trigger:*:search`) |
| `destroy` | `{ target:'editor' }` | teardown |

## Semantics

- A throwing listener is caught and logged — it can never break the editor loop.
- `beforeSubmit.preventDefault()` cancels the submission entirely.
- Error handlers run for `submit.onSubmit` failures and trigger `search`/`select`
  failures, with `phase` identifying the source.

## Advanced — adapters bridge to framework events

```ts
// Web component: every event re-dispatched as bubbling CustomEvent
element.addEventListener('aic-submit', (e) => console.log(e.detail));

// Angular: outputs
<aic-prompt-editor (submitted)="onSubmit($event)" />

// React: props
<PromptEditor onSubmit={(value) => …} />
```

Runnable version: [examples/core/03-events.ts](../../examples/core/03-events.ts)
