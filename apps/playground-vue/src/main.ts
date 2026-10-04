import { createApp, defineComponent, h } from 'vue';
import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';
import { createPromptEditor } from '@ai-composer/core';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { PromptEditor, PromptInput, PromptSuggestions, PromptToolbar, usePromptState } from '@ai-composer/vue';

const people = [
  { id: 'u1', label: 'Ada Lovelace', description: 'Engineering' },
  { id: 'u2', label: 'Grace Hopper', description: 'Engineering' },
];

const App = defineComponent({
  name: 'App',
  setup() {
    const editor = createPromptEditor({
      mode: 'chat',
      placeholder: 'Ask anything… try @mentions',
      plugins: [mentionPlugin({ items: people })],
    });

    const DraftMirror = defineComponent({
      setup() {
        const state = usePromptState(editor);
        return () =>
          h('p', { class: 'mirror' }, [
            'Markdown: ',
            h('code', String(editor.serialize('markdown'))),
            h('br'),
            `canUndo: ${state.value.canUndo} · suggestions: ${state.value.suggestions.length}`,
          ]);
      },
    });

    return () =>
      h('main', [
        h('h1', 'AI Composer · Vue'),
        h(
          PromptEditor,
          {
            editor,
            mode: 'chat',
            placeholder: 'Ask anything… try @mentions',
            onSubmit: (value: unknown) => console.log('submit', value),
          },
          {
            default: () => [
              h('div', { class: 'aic-body', 'data-aic-slot': 'body' }, [
                h(PromptInput, { suggestions: false }),
                h(PromptSuggestions, null, {
                  default: ({ item }: { item: { label: string; description?: string } }) =>
                    h('span', [item.label, item.description ? ` — ${item.description}` : '']),
                }),
              ]),
              h(PromptToolbar, null, {
                default: () =>
                  h('button', { type: 'button', onClick: () => void editor.submit() }, 'Send'),
              }),
            ],
          },
        ),
        h(DraftMirror),
      ]);
  },
});

createApp(App).mount('#app');
