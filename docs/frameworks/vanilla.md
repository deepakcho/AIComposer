# Vanilla JS

Zero framework — the proof the engine is genuinely framework-independent.

## Mount

```ts
import { createPromptEditor } from '@ai-composer/core';
import { mountPromptEditor } from '@ai-composer/dom';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';

const editor = createPromptEditor({
  mode: 'chat',
  placeholder: 'No framework required',
  plugins: [mentionPlugin({ items })],
  submit: { clearOnSubmit: true, onSubmit: (value) => console.log(value) },
});

const mounted = mountPromptEditor(document.querySelector('#composer'), editor, {
  mode: 'chat',
  renderSuggestionItem: (item, active) => {
    const li = document.createElement('li');
    li.textContent = item.label;
    if (active) li.classList.add('aic-active');
    return li;
  },
});
```

## Drive it

```ts
editor.subscribe((state) => console.log(state.empty, state.canUndo));
editor.setValue('hello');
editor.insertNode({ type: 'mention', key: 'm1', id: 'u1', label: 'Ada' });
await editor.submit();
console.log(editor.serialize('markdown'));
mounted.destroy();
```

## Full custom DOM

Skip templates entirely — bind the surface to your own markup:

```ts
import { createEditableSurface, createSuggestionList } from '@ai-composer/dom';

const host = myRootElement; // your contentEditable target
const surface = createEditableSurface(editor, host, { multiline: true });
const list = createSuggestionList(editor, undefined, { inputHost: host });
myAnchorElement.appendChild(list.element);
```

Live demos: `pnpm dev:vanilla` · Storybook "Vanilla JS · mountPromptEditor()"
story (`pnpm storybook:wc`) · [examples/vanilla](../../examples/vanilla/)
