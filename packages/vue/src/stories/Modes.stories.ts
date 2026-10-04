/**
 * Modes — compact pill, chat box, expanded canvas; switchable live.
 */

import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { defineComponent, h, ref } from 'vue';
import { PromptEditor } from '../index';
import { createDemoEditor } from './utils';

const meta: Meta = {
  component: PromptEditor as never,
  tags: ['autodocs'],
  title: 'AI Composer/Vue/Modes',
  parameters: {
    docs: {
      description: {
        component:
          '`mode` is a structural preset: **compact** = single-line pill, **chat** = auto-growing Copilot box, **expanded** = tall canvas with full toolbar. Switching keeps the draft and undo history.',
      },
    },
  },
  args: { placeholder: 'Ask anything…' },
  render: (args) => ({
    components: { PromptEditor },
    setup: () => () => h(PromptEditor as never, { ...args }),
  }),
};

export default meta;
type Story = StoryObj;

export const Compact: Story = {
  args: { mode: 'compact', placeholder: 'Search or ask…' },
  parameters: {
    docs: {
      source: { code: '<PromptEditor mode="compact" placeholder="Search or ask…" />' },
      description: { story: 'Inline pill while single-line; wrapped/multiline content morphs it into a rounded auto-growing box (never clips). Attachments stay projectable.' },
    },
  },
};

export const MaxHeight: Story = {
  name: 'Max height · custom cap',
  args: { mode: 'chat', maxHeight: 96, placeholder: 'Type several lines — the box stops at 96px and scrolls…' },
  parameters: {
    docs: {
      source: {
        code: `<!-- prop (px or any CSS length) -->
<PromptEditor mode="chat" :max-height="96" />

<!-- or the underlying token -->
<div style="--aic-input-max-height: 40vh">
  <PromptEditor mode="chat" />
</div>`,
      },
    },
  },
};

export const Chat: Story = {
  args: { mode: 'chat' },
  parameters: {
    docs: { source: { code: '<PromptEditor mode="chat" />' } },
  },
};

export const Expanded: Story = {
  args: { mode: 'expanded', placeholder: 'Write a long, detailed prompt…' },
  parameters: {
    docs: { source: { code: '<PromptEditor mode="expanded" />' } },
  },
};

export const LiveSwitch: Story = {
  name: 'Live mode switching',
  render: () =>
    defineComponent({
      components: { PromptEditor },
      setup() {
        const editor = createDemoEditor({ placeholder: 'Draft survives switching…' });
        const mode = ref<'compact' | 'chat' | 'expanded'>('chat');
        const buttons: Array<{ value: 'compact' | 'chat' | 'expanded'; label: string }> = [
          { value: 'compact', label: 'compact' },
          { value: 'chat', label: 'chat' },
          { value: 'expanded', label: 'expanded' },
        ];
        return () =>
          h('div', [
            h(
              'div',
              { style: 'display:flex;gap:8px;margin-bottom:12px' },
              buttons.map((button) =>
                h('button', {
                  key: button.value,
                  type: 'button',
                  style:
                    'padding:4px 12px;border-radius:999px;cursor:pointer;border:1px solid ' +
                    (mode.value === button.value ? '#6366f1' : '#d1d5db') +
                    ';background:' + (mode.value === button.value ? '#eef2ff' : 'transparent'),
                  onClick: () => {
                    mode.value = button.value;
                  },
                }, button.label),
              ),
            ),
            h(PromptEditor as never, { editor, mode: mode.value }),
          ]);
      },
    }) as never,
  parameters: {
    docs: {
      source: {
        code: `const mode = ref<'compact' | 'chat' | 'expanded'>('chat');

<PromptEditor :editor="editor" :mode="mode" />
<button @click="mode = 'expanded'">expand</button>`,
      },
    },
  },
};
