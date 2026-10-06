/**
 * Customization — named slots, composables, custom layout.
 */

import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { defineComponent, h, ref } from 'vue';
import {
  AIComposer,
  AIComposerFooter,
  AIComposerHeader,
  AIComposerInput,
  AIComposerToolbar,
  useAIComposerState,
} from '../index';
import { createDemoEditor } from './utils';

const meta: Meta = {
  component: AIComposer as never,
  tags: ['autodocs'],
  title: 'AI Composer/Vue/Customization',
  parameters: {
    docs: {
      description: {
        component:
          'Level 3 usage: bring your own editor instance and compose named slots. The engine supplies behavior; the app owns the DOM. `useAIComposerState()` exposes reactive state anywhere below the root.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const CustomLayout: Story = {
  name: 'Custom layout · slots',
  render: () =>
    defineComponent({
      components: { AIComposer, AIComposerHeader, AIComposerInput, AIComposerToolbar, AIComposerFooter },
      setup() {
        const editor = createDemoEditor({ placeholder: 'Fully custom layout…' });
        const lastSubmit = ref('—');
        return () =>
          h(AIComposer as never, { editor }, {
            default: () => [
              h(AIComposerHeader as never, null, {
                default: () => 'Ticket #42 · Support',
              }),
              h('div', { class: 'aic-body', 'data-aic-slot': 'body' }, [
                h(AIComposerInput as never),
              ]),
              h(AIComposerToolbar as never, null, {
                default: () =>
                  h('button', { type: 'button', onClick: () => void editor.submit() }, 'Send'),
              }),
              h(AIComposerFooter as never, null, { default: () => `Last submit: ${lastSubmit.value}` }),
            ],
          });
      },
    }) as never,
  parameters: {
    docs: {
      source: {
        code: `<AIComposer :editor="editor">
  <AIComposerHeader>Ticket #42 · Support</AIComposerHeader>
  <div class="aic-body" data-aic-slot="body">
    <AIComposerInput />
  </div>
  <AIComposerToolbar>
    <button @click="editor.submit()">Send</button>
  </AIComposerToolbar>
  <AIComposerFooter>Last submit: {{ lastSubmit }}</AIComposerFooter>
</AIComposer>`,
      },
    },
  },
};

export const Composables: Story = {
  name: 'Composables · useAIComposerState',
  render: () =>
    defineComponent({
      components: { AIComposer },
      setup() {
        const editor = createDemoEditor();
        const state = useAIComposerState(editor);
        const rows: Array<[string, () => string]> = [
          ['state.empty', () => String(state.value.empty)],
          ['state.canUndo', () => String(state.value.canUndo)],
          ['state.suggestions.length', () => String(state.value.suggestions.length)],
          ['state.activeTrigger?.query', () => state.value.activeTrigger?.query ?? '—'],
          ['state.mode', () => state.value.mode],
        ];
        return () =>
          h('div', [
            h(AIComposer as never, { editor, mode: 'chat' }),
            h(
              'table',
              { class: 'aic-api-table' },
              h('tbody', rows.map(([key, value]) => h('tr', [h('td', h('code', key)), h('td', value())]))),
            ),
          ]);
      },
    }) as never,
  parameters: {
    docs: {
      source: {
        code: `const state = useAIComposerState(editor);
// state.empty · state.canUndo · state.suggestions · state.mode …`,
      },
    },
  },
};
