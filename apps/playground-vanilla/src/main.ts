import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';
import '@ai-composer/themes/css/dark.css';
import './style.css';
import { createPromptEditor } from '@ai-composer/core';
import { mountPromptEditor } from '@ai-composer/dom';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { commandPlugin } from '@ai-composer/plugin-command';

const people = [
  { id: 'u1', label: 'Ada Lovelace', description: 'Engineering' },
  { id: 'u2', label: 'Grace Hopper', description: 'Engineering' },
  { id: 'u3', label: 'Alan Turing', description: 'Research' },
];

const editor = createPromptEditor({
  mode: 'chat',
  placeholder: 'Ask anything… try @mentions and /commands',
  submit: {
    clearOnSubmit: true,
    onSubmit: () => {
      // eslint-disable-next-line no-console
      console.log('submit', editor.serialize('ai'));
    },
  },
  plugins: [
    mentionPlugin({ items: people }),
    commandPlugin({
      commands: [
        { id: 'summarize', label: 'Summarize', description: 'Summarize the conversation' },
        { id: 'translate', label: 'Translate', description: 'Translate the prompt' },
        { id: 'reset', label: 'Reset draft', run: (e) => e.clear() },
      ],
    }),
  ],
});

const container = document.querySelector<HTMLElement>('#composer')!;
mountPromptEditor(container, editor, {
  mode: 'chat',
  renderSuggestionItem: (item, active) => {
    const li = document.createElement('li');
    li.className = 'aic-suggestion' + (active ? ' aic-active' : '');
    li.setAttribute('role', 'option');
    const label = document.createElement('span');
    label.className = 'aic-suggestion-label';
    label.textContent = item.label;
    li.append(label);
    if (item.description) {
      const description = document.createElement('span');
      description.className = 'aic-suggestion-description';
      description.textContent = item.description;
      li.append(description);
    }
    return li;
  },
});

// Live serialization panel — demonstrates the model-first value.
const output = document.querySelector('#output')!;
const render = (): void => {
  output.textContent = JSON.stringify(
    {
      text: editor.serialize('text'),
      markdown: editor.serialize('markdown'),
      nodes: editor.getValue().nodes.map((n) => n.type),
      canUndo: editor.getState().canUndo,
    },
    null,
    2,
  );
};
editor.subscribe(render);
render();

// Mode switching is live: same editor instance, draft/focus/undo preserved.
document.querySelector('#mode')!.addEventListener('change', (event) => {
  editor.setMode((event.target as HTMLSelectElement).value);
});

document.querySelector('#theme')!.addEventListener('change', (event) => {
  const theme = (event.target as HTMLSelectElement).value;
  if (theme) document.documentElement.setAttribute('data-aic-theme', theme);
  else document.documentElement.removeAttribute('data-aic-theme');
});
