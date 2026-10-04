# API · Templates & Modes

**Concept** — modes are **presets, not implementations** (ADR-0005). A
template is data describing which slots exist and surface defaults; adapters
may use it or ignore it completely.

## Built-in modes

| Mode | Shape | Enter | Toolbar | Default max height |
| --- | --- | --- | --- | --- |
| `compact` | single-line pill → rounded box on multiline | submit | — | `120px` |
| `default` | auto-growing box | submit | — | `200px` |
| `chat` | auto-growing box + circular send | submit (Shift+Enter newline) | send | `min(200px, 55dvh)` |
| `expanded` | tall canvas | newline (Shift+Enter submits) | undo · redo · submit | `60dvh` |

Modes are **live-switchable**: `editor.setMode('expanded')` morphs the mounted
DOM in place — draft, selection and undo history survive (no remount).

### Auto-height & max height

Every mode auto-grows with content (`height: auto`) up to a ceiling, then
scrolls inside. The ceiling is the `--aic-input-max-height` token — set it
from anywhere:

```tsx
<PromptEditor mode="chat" maxHeight={96} />            // adapter prop (px or CSS length)
```

```html
<ai-composer-editor mode="chat" max-height="40vh"></ai-composer-editor>
```

```css
.my-composer { --aic-input-max-height: 160px; }        /* token override */
```

### Multiline detection (compact)

The surface flags wrapped or newline content with
`data-aic-multiline` on the input host. Compact uses it to morph the pill
(radius `999px`) into a rounded box — text always wraps, never clips.

### Slot projection

Presets shape defaults; they never forbid content. Attachments render in
every mode whenever they exist, and header/footer/toolbar can be forced on
via `showSlots` (vanilla mount) or by composing slot components (adapters).

## Custom mode

```ts
import { registerTemplate, templateForMode } from '@ai-composer/dom';

registerTemplate({
  name: 'enterprise',
  slots: ['header', 'body', 'attachments', 'input', 'suggestions', 'toolbar', 'status', 'footer'],
  multiline: true,
  submitKey: 'enter',
  toolbarButtons: ['undo', 'redo', 'submit'],
});
```

## Slots

Every rendered region carries `data-aic-slot="<name>"` and stable classes
(`aic-root`, `aic-body`, `aic-input-host`, `aic-suggestions`, `aic-toolbar`,
`aic-header`, `aic-footer`, `aic-attachments`). Applications can:

- restyle via `@ai-composer/themes` tokens or their own CSS,
- replace entire regions via adapter slots (React children / Angular
  projection / Vue slots / Web Component light DOM),
- or bypass templates completely with `createEditableSurface()`.

## Framework examples

```tsx
// React — replace any region
<PromptEditor editor={editor}>
  <PromptHeader>My header</PromptHeader>
  <PromptBody><PromptInput /></PromptBody>
  <PromptToolbar><MyToolbar /></PromptToolbar>
</PromptEditor>
```

```html
<!-- Angular — content projection -->
<aic-prompt-editor [editor]="editor">
  <div aic-header>My header</div>
  <div aic-toolbar><aic-submit-button /></div>
</aic-prompt-editor>
```
