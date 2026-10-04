# API · DOM Layer (`@ai-composer/dom`)

**Concept** — all browser code lives here (ADR-0001). Core stays pure; the
DOM layer binds a contentEditable host to the engine with the model-first
pipeline:

```
input event → parse (sanitized) → editor.applyViewUpdate()
model change → render → caret restore from model selection
```

## `mountPromptEditor` — vanilla mount

```ts
import { createPromptEditor } from '@ai-composer/core';
import { mountPromptEditor } from '@ai-composer/dom';

const editor = createPromptEditor({ mode: 'chat', plugins: [...] });
const mounted = mountPromptEditor(document.querySelector('#composer'), editor, {
  mode: 'chat',                    // optional override
  template: undefined,             // optional PromptDomTemplate override
  renderSuggestionItem: (item, active) => { const li = document.createElement('li'); /* … */ return li; },
  labels: { submit: 'Send', undo: 'Undo', redo: 'Redo', removeAttachment: 'Remove' },
});

mounted.root;        // the container (promoted to .aic-root)
mounted.input;       // the contentEditable host
mounted.suggestions; // the listbox element
mounted.slots;       // { [slotName]: HTMLElement }
mounted.surface;     // the EditableSurface
mounted.destroy();
```

## `createEditableSurface` — bring your own layout

```ts
import { createEditableSurface } from '@ai-composer/dom';

const surface = createEditableSurface(editor, myHostElement, {
  multiline: true,          // aria-multiline
  submitKey: 'enter',       // defaults to editor config
  id: 'composer-input',     // aria wiring
  ariaLabel: 'Prompt',
});
surface.render();   // manual re-render (undo/redo view hook does this)
surface.focus({ at: 'end' });
surface.destroy();
```

Handles: input pipeline, Enter policy, suggestion keyboard (↑↓ Enter Tab Esc),
undo/redo shortcuts, paste/copy (internal JSON mime + plain text + sanitized
HTML), composition/IME flags, focus/blur, selectionchange.

## `createSuggestionList` — accessible menu

```ts
import { createSuggestionList } from '@ai-composer/dom';

const list = createSuggestionList(editor, optionalUlElement, {
  renderItem: (item, active) => li,
  inputHost,   // receives aria-controls/activedescendant/expanded
});
list.destroy();
```

## Parse/render utilities

- `parseEditableHost(host, nodeRegistry)` — sanitized DOM → document
- `renderDocument(host, doc, nodeRegistry)` — document → DOM (chips with
  `data-aic-*`)
- `domSelectionToModel` / `applyModelSelection` / `caretToEnd`
- `htmlToPlainText(html)` — paste path extraction

## Sanitization rules

1. Only `data-aic-node` chips survive as nodes, validated against the registry.
2. `script`/`style` subtrees are dropped entirely.
3. Unknown wrappers flatten to their **text content** — markup never passes through.
4. External documents (`setValue`, paste JSON) run through `sanitizeDocument`.
