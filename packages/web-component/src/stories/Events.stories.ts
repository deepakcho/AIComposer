/**
 * Events & API — custom events, element API, and the vanilla-JS mount story
 * (core + dom with zero adapters — the independence proof).
 */

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { createAIComposer } from '@ai-composer/core';
import { mountAIComposer } from '@ai-composer/dom';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { defineAiComposerEditor } from '../index';

defineAiComposerEditor();

const meta: Meta = {
  title: 'AI Composer/Web Component/Events & Vanilla JS',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The element emits `aic-change` / `aic-submit` custom events; the underlying editor is reachable via `element.editor`. The last story uses **no adapter at all** — `@ai-composer/core` + `@ai-composer/dom` in plain JS.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Events: Story = {
  name: 'Events · aic-change / aic-submit',
  render: () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <ai-composer-editor mode="chat" placeholder="Type and press Enter…"></ai-composer-editor>
      <pre style="background:#f6f7f9;padding:12px;border-radius:8px;font-size:13px">—</pre>
    `;
    const element = root.querySelector('ai-composer-editor')!;
    const log = root.querySelector('pre')!;
    const write = (line: string): void => {
      log.textContent = `${line}\n${log.textContent}`;
    };
    element.addEventListener('aic-change', () => {
      const editor = (element as unknown as { editor: ReturnType<typeof createAIComposer> }).editor;
      write(`change → ${editor.serialize('text')}`);
    });
    element.addEventListener('aic-submit', (event) => {
      write(`submit → ${JSON.stringify((event as CustomEvent).detail)}`);
    });
    return root;
  },
  parameters: {
    docs: {
      source: {
        code: `const el = document.querySelector('ai-composer-editor');
el.addEventListener('aic-change', () => console.log(el.editor.serialize('text')));
el.addEventListener('aic-submit', (e) => console.log(e.detail));`,
      },
    },
  },
};

export const VanillaJsMount: Story = {
  name: 'Vanilla JS · mountAIComposer()',
  render: () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div style="max-width:640px"></div>
      <pre style="background:#f6f7f9;padding:12px;border-radius:8px;font-size:13px">—</pre>
    `;
    const container = root.querySelector('div')!;
    const output = root.querySelector('pre')!;
    const editor = createAIComposer({
      mode: 'chat',
      placeholder: 'Vanilla JS — no framework at all',
      plugins: [
        mentionPlugin({ items: [{ id: 'u1', label: 'Ada Lovelace', description: 'Engineering' }] }),
      ],
    });
    mountAIComposer(container, editor, { mode: 'chat' });
    editor.subscribe((state) => {
      output.textContent = JSON.stringify(
        { text: editor.serialize('text'), canUndo: state.canUndo, mode: state.mode },
        null,
        2,
      );
    });
    return root;
  },
  parameters: {
    docs: {
      source: {
        code: `import { createAIComposer } from '@ai-composer/core';
import { mountAIComposer } from '@ai-composer/dom';
import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';

const editor = createAIComposer({
  mode: 'chat',
  plugins: [mentionPlugin({ items: people })],
});

mountAIComposer(document.querySelector('#composer'), editor, { mode: 'chat' });`,
      },
      description: { story: 'core + dom only — no adapter, no framework. Live state panel shows the model-first document.' },
    },
  },
};
