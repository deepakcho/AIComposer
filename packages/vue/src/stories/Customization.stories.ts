/**
 * Customization — named slots, composables, custom layout.
 */

import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { defineComponent, h, ref } from 'vue';
import {
  PromptEditor,
  PromptFooter,
  PromptHeader,
  PromptInput,
  PromptToolbar,
  usePromptState,
} from '../index';
import { createDemoEditor } from './utils';

const meta: Meta = {
  component: PromptEditor as never,
  tags: ['autodocs'],
  title: 'AI Composer/Vue/Customization',
  parameters: {
    docs: {
      description: {
        component:
          'Level 3 usage: bring your own editor instance and compose named slots. The engine supplies behavior; the app owns the DOM. `usePromptState()` exposes reactive state anywhere below the root.',
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
      components: { PromptEditor, PromptHeader, PromptInput, PromptToolbar, PromptFooter },
      setup() {
        const editor = createDemoEditor({ placeholder: 'Fully custom layout…' });
        const lastSubmit = ref('—');
        return () =>
          h(PromptEditor as never, { editor }, {
            default: () => [
              h(PromptHeader as never, null, {
                default: () => 'Ticket #42 · Support',
              }),
              h('div', { class: 'aic-body', 'data-aic-slot': 'body' }, [
                h(PromptInput as never),
              ]),
              h(PromptToolbar as never, null, {
                default: () =>
                  h('button', { type: 'button', onClick: () => void editor.submit() }, 'Send'),
              }),
              h(PromptFooter as never, null, { default: () => `Last submit: ${lastSubmit.value}` }),
            ],
          });
      },
    }) as never,
  parameters: {
    docs: {
      source: {
        code: `<PromptEditor :editor="editor">
  <PromptHeader>Ticket #42 · Support</PromptHeader>
  <div class="aic-body" data-aic-slot="body">
    <PromptInput />
  </div>
  <PromptToolbar>
    <button @click="editor.submit()">Send</button>
  </PromptToolbar>
  <PromptFooter>Last submit: {{ lastSubmit }}</PromptFooter>
</PromptEditor>`,
      },
    },
  },
};

export const Composables: Story = {
  name: 'Composables · usePromptState',
  render: () =>
    defineComponent({
      components: { PromptEditor },
      setup() {
        const editor = createDemoEditor();
        const state = usePromptState(editor);
        const rows: Array<[string, () => string]> = [
          ['state.empty', () => String(state.value.empty)],
          ['state.canUndo', () => String(state.value.canUndo)],
          ['state.suggestions.length', () => String(state.value.suggestions.length)],
          ['state.activeTrigger?.query', () => state.value.activeTrigger?.query ?? '—'],
          ['state.mode', () => state.value.mode],
        ];
        return () =>
          h('div', [
            h(PromptEditor as never, { editor, mode: 'chat' }),
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
        code: `const state = usePromptState(editor);
// state.empty · state.canUndo · state.suggestions · state.mode …`,
      },
    },
  },
};
