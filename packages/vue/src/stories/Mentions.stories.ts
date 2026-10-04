/**
 * Mentions & commands — caret-anchored popup triggers.
 */

import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { defineComponent, h } from 'vue';
import { createMentionNode, createTextNode } from '@ai-composer/core';
import { PromptEditor, PromptInput, PromptSuggestions } from '../index';
import { createDemoEditor } from './utils';

const meta: Meta = {
  component: PromptEditor as never,
  tags: ['autodocs'],
  title: 'AI Composer/Vue/Mentions & Commands',
  parameters: {
    docs: {
      description: {
        component:
          'Type `@` for people, `/` for commands. The popup opens at the caret, clamps into the viewport, flips when there is no room above; Arrow keys navigate, Enter/Tab accept, Escape dismisses.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const editorStory = () =>
  defineComponent({
    components: { PromptEditor },
    setup() {
      const editor = createDemoEditor();
      return () => h(PromptEditor as never, { editor, mode: 'chat' });
    },
  }) as never;

export const MentionChips: Story = {
  name: 'Mention chips · initial value',
  args: {
    mode: 'chat',
    modelValue: {
      nodes: [
        createTextNode('Review with '),
        createMentionNode({ id: 'u1', label: 'Ada Lovelace' }),
        createTextNode(' and '),
        createMentionNode({ id: 'u2', label: 'Grace Hopper' }),
        createTextNode(' please'),
      ],
    },
  },
  parameters: {
    docs: {
      source: {
        code: `<PromptEditor
  mode="chat"
  v-model="doc"
/>`,
      },
    },
  },
};

export const MentionFlow: Story = {
  name: 'Interaction · type @, pick from popup',
  render: editorStory,
  parameters: {
    docs: {
      source: { code: "<PromptEditor :editor=\"editor\" mode=\"chat\" />" },
      description: { story: 'Play function: types "@ad", asserts the popup lists Ada Lovelace, accepts with Enter.' },
    },
  },
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

export const CommandMenu: Story = {
  name: 'Interaction · slash commands',
  render: editorStory,
  parameters: {
    docs: {
      source: { code: "<PromptEditor :editor=\"editor\" mode=\"chat\" /> <!-- type / -->" },
      description: { story: 'Play function: types "/", picks the second command with ArrowDown + Enter.' },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await userEvent.click(input);
    await userEvent.type(input, '/');
    const option = await canvas.findByRole('option');
    await expect(option.textContent).toContain('Summarize');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('textbox').textContent).toContain('/Translate'));
  },
};

export const CustomItemRenderer: Story = {
  name: 'Custom suggestion items',
  render: () =>
    defineComponent({
      components: { PromptEditor, PromptInput, PromptSuggestions },
      setup() {
        const editor = createDemoEditor();
        return () =>
          h(PromptEditor as never, { editor }, {
            default: () => [
              h('div', { class: 'aic-body', 'data-aic-slot': 'body' }, [
                h(PromptInput as never, { suggestions: false }),
                h(PromptSuggestions as never, null, {
                  default: ({ item, active }: { item: { label: string; description?: string }; active: boolean }) =>
                    h('span', [
                      h('b', item.label),
                      item.description ? ` — ${item.description}` : '',
                      active ? ' ◀' : '',
                    ]),
                }),
              ]),
            ],
          });
      },
    }) as never,
  parameters: {
    docs: {
      source: {
        code: `<PromptEditor :editor="editor">
  <div class="aic-body" data-aic-slot="body">
    <PromptInput :suggestions="false" />
    <PromptSuggestions v-slot="{ item, active }">
      <b>{{ item.label }}</b> — {{ item.description }} <span v-if="active">◀</span>
    </PromptSuggestions>
  </div>
</PromptEditor>`,
      },
    },
  },
};
