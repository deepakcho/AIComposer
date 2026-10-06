import { createApp, defineComponent, h } from 'vue';
import '@ai-composer/themes/css/tokens.css';
import '@ai-composer/themes/css/default.css';
import { createAIComposer } from '@ai-composer/core';
import { mentionPlugin } from '@ai-composer/plugin-mention';
import { AIComposer, AIComposerInput, AIComposerSuggestions, AIComposerToolbar, useAIComposerState } from '@ai-composer/vue';

const people = [
  { id: 'u1', label: 'Ada Lovelace', description: 'Engineering' },
  { id: 'u2', label: 'Grace Hopper', description: 'Engineering' },
];

const App = defineComponent({
  name: 'App',
  setup() {
    const editor = createAIComposer({
      mode: 'chat',
      placeholder: 'Ask anything… try @mentions',
      plugins: [mentionPlugin({ items: people })],
    });

    const DraftMirror = defineComponent({
      setup() {
        const state = useAIComposerState(editor);
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
          AIComposer,
          {
            editor,
            mode: 'chat',
            placeholder: 'Ask anything… try @mentions',
            onSubmit: (value: unknown) => console.log('submit', value),
          },
          {
            default: () => [
              h('div', { class: 'aic-body', 'data-aic-slot': 'body' }, [
                h(AIComposerInput, { suggestions: false }),
                h(AIComposerSuggestions, null, {
                  default: ({ item }: { item: { label: string; description?: string } }) =>
                    h('span', [item.label, item.description ? ` — ${item.description}` : '']),
                }),
              ]),
              h(AIComposerToolbar, null, {
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
