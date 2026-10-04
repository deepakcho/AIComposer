/**
 * AI Composer · Vue 3 — full scenario matrix (composition API + v-model).
 */

import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { defineComponent, h, ref } from 'vue';
import { createMentionNode, createTextNode } from '@ai-composer/core';
import {
  PromptEditor,
  PromptHeader,
  PromptInput,
  PromptSuggestions,
  PromptToolbar,
} from '../index';
import { createDemoEditor } from './utils';

const meta: Meta<typeof PromptEditor> = {
  component: PromptEditor,
  tags: ['autodocs'],
  title: 'AI Composer/PromptEditor (Vue)',
  parameters: {
    docs: {
      description: {
        component: `
Vue 3 adapter with \`v-model\` support, named-slot customization and render-function
components. The engine is shared with every other adapter (\`@ai-composer/core\`).
`,
      },
    },
  },
  args: { mode: 'chat', placeholder: 'Ask anything… try @mentions' },
  render: (args) => ({
    components: { PromptEditor },
    setup: () => () => h(PromptEditor, { ...args }),
  }),
};

export default meta;
type Story = StoryObj<typeof PromptEditor>;

export const Compact: Story = { args: { mode: 'compact', placeholder: 'Search…' } };
export const Chat: Story = { args: { mode: 'chat' } };
export const Expanded: Story = { args: { mode: 'expanded' } };
export const Disabled: Story = { args: { mode: 'chat', disabled: true, modelValue: 'Locked' } };
export const Readonly: Story = { args: { mode: 'chat', readonly: true, modelValue: 'Read-only' } };

export const WithMentionChips: Story = {
  args: {
    mode: 'chat',
    modelValue: {
      nodes: [
        createTextNode('Review with '),
        createMentionNode({ id: 'u1', label: 'Ada Lovelace' }),
        createTextNode(' please'),
      ],
    },
  },
};

/** v-model two-way binding. */
export const VModel: Story = {
  name: 'v-model · two-way binding',
  render: () =>
    defineComponent({
      components: { PromptEditor },
      setup: () => {
        const value = ref('Bound via v-model');
        return () =>
          h('div', [
            h(PromptEditor as never, {
              mode: 'compact',
              modelValue: value.value,
              'onUpdate:modelValue': (next: unknown) => {
                value.value = next as never;
              },
            }),
            h('p', [ 'Parent value: ', h('code', JSON.stringify(value.value)) ]),
          ]);
      },
    }) as never,
};

/** Custom layout with scoped suggestion rendering. */
export const CustomSlots: Story = {
  name: 'Custom slots · full layout control',
  render: () =>
    defineComponent({
      components: { PromptEditor, PromptHeader, PromptInput, PromptSuggestions, PromptToolbar },
      setup: () => {
        const editor = createDemoEditor();
        const lastSubmit = ref('—');
        return () =>
          h(PromptEditor as never, {
            editor,
            onSubmit: (value: unknown) => {
              lastSubmit.value = JSON.stringify(value);
            },
          }, {
            default: () => [
              h(PromptHeader as never, null, { default: () => 'Ticket #42 · Support' }),
              h('div', { class: 'aic-body', 'data-aic-slot': 'body' }, [
                h(PromptInput as never, { suggestions: false }),
                h(PromptSuggestions as never, null, {
                  default: ({ item }: { item: { label: string; description?: string } }) =>
                    h('span', [h('b', item.label), item.description ? ` — ${item.description}` : '']),
                }),
              ]),
              h(PromptToolbar as never, null, {
                default: () =>
                  h('button', { type: 'button', onClick: () => void editor.submit() }, 'Send'),
              }),
              h('div', { class: 'aic-footer' }, [`Last submit: ${lastSubmit.value}`]),
            ],
          });
      },
    }) as never,
};

/** Interaction: type a mention, accept it via Enter. */
export const MentionFlow: Story = {
  name: 'Interaction · mention flow',
  render: () =>
    defineComponent({
      components: { PromptEditor },
      setup: () => {
        const editor = createDemoEditor();
        return () => h(PromptEditor as never, { editor, mode: 'chat' });
      },
    }) as never,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await userEvent.click(input);
    await userEvent.type(input, '@ad');
    const option = await canvas.findByRole('option');
    await expect(option.textContent).toContain('Ada Lovelace');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('textbox').textContent).toContain('@Ada Lovelace'));
  },
};
