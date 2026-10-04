# API · Templates & Modes

**Concept** — modes are **presets, not implementations** (ADR-0005). A
template is data describing which slots exist and surface defaults; adapters
may use it or ignore it completely.

## Built-in modes

| Mode | Slots | Multiline | Enter | Toolbar |
| --- | --- | --- | --- | --- |
| `compact` | body · input · suggestions | no | submit | — |
| `default` | body · attachments · input · suggestions | yes | submit | — |
| `chat` | header · body · attachments · input · suggestions · toolbar · actions | yes | submit (Shift+Enter newline) | send |
| `expanded` | header · body · attachments · input · suggestions · toolbar · footer | yes | newline (Shift+Enter submits) | undo · redo · submit |

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
