# Web Component

Works in **any** stack (or none): React, Angular, Vue, Svelte, plain HTML.

## Setup

```html
<script type="module">
  import { defineAiComposerEditor } from '@ai-composer/web-component';
  import '@ai-composer/themes/css/tokens.css';
  import '@ai-composer/themes/css/default.css';
  defineAiComposerEditor();
</script>

<ai-composer-editor mode="chat" placeholder="Ask anything…"></ai-composer-editor>
```

## Attributes

`mode` · `placeholder` · `disabled` · `readonly` (observed, live-updating).

## Properties

```ts
const element = document.querySelector('ai-composer-editor');

element.plugins = [mentionPlugin({ items })];  // BEFORE first connection
element.editor;                                // underlying PromptEditor (full core API)
element.editor.serialize('ai');
element.value = JSON.stringify({ nodes: [...] }); // or a plain string
```

## Events

Forwarded as bubbling `CustomEvent`s (`detail` = editor payload):
`aic-change`, `aic-input`, `aic-submit`, `aic-focus`, `aic-blur`,
`aic-triggeropen`, `aic-triggerclose`, `aic-commandexecute`, `aic-error`.

```ts
element.addEventListener('aic-submit', (event) => {
  console.log(event.detail.value); // PromptDocument
});
```

## Styling

CSS custom properties pierce anywhere — theme via tokens:

```css
ai-composer-editor {
  --aic-accent: #16a34a;
  --aic-radius: 8px;
}
```

Or set `data-aic-theme="dark"` on any ancestor for the dark token layer.

## In frameworks

```tsx
// React
<ai-composer-editor ref={ref} mode="chat" />;
```

```html
<!-- Angular (CUSTOM_ELEMENTS_SCHEMA) or Vue -->
<ai-composer-editor mode="chat"></ai-composer-editor>
```

Live demos: `pnpm storybook:wc` · [examples/web-component](../../examples/web-component/)
