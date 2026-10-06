/**
 * Basic usage — zero-config editor, initial values, submit handling.
 */

import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { defineComponent, h, ref } from 'vue';
import { createMentionNode, createTextNode } from '@ai-composer/core';
import { AIComposer } from '../index';
import { createDemoEditor } from './utils';

const meta: Meta = {
  component: AIComposer as never,
  tags: ['autodocs'],
  title: 'AI Composer/Vue/Basic',
  parameters: {
    docs: {
      description: {
        component:
          'The zero-config path: `<AIComposer mode="chat" />` gives you the editable surface, caret-anchored suggestion popups, undo/redo and submit. `v-model` binds the document.',
      },
    },
  },
  args: { mode: 'chat', placeholder: 'Ask anything…' },
  render: (args) => ({
    components: { AIComposer },
    setup: () => () => h(AIComposer as never, { ...args }),
  }),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    docs: {
      source: { code: '<AIComposer mode="chat" placeholder="Ask anything…" />' },
      description: { story: 'Zero configuration. Enter submits, Shift+Enter adds a newline, the box auto-grows.' },
    },
  },
};

export const InitialValue: Story = {
  args: {
    modelValue: {
      nodes: [
        createTextNode('Ping '),
        createMentionNode({ id: 'u1', label: 'Ada Lovelace' }),
        createTextNode(' about the release'),
      ],
    },
  },
  parameters: {
    docs: {
      source: {
        code: `<AIComposer
  mode="chat"
  v-model="doc"
/>`,
      },
      description: { story: 'Seed via v-model with a document — mention chips render immediately.' },
    },
  },
};

export const SubmitFlow: Story = {
  name: 'Submit · @submit + clearing',
  render: () =>
    defineComponent({
      components: { AIComposer },
      setup() {
        const log = ref<string[]>([]);
        const editor = createDemoEditor({
          submit: {
            clearOnSubmit: true,
            onSubmit: () => {
              log.value = [editor.serialize('text'), ...log.value.slice(0, 4)];
            },
          },
        });
        return () =>
          h('div', [
            h(AIComposer as never, { editor }),
            h(
              'pre',
              { style: 'background:#f6f7f9;padding:12px;border-radius:8px;font-size:13px;margin:12px 0 0' },
              log.value.join('\n') || 'press Enter…',
            ),
          ]);
      },
    }) as never,
  parameters: {
    docs: {
      source: {
        code: `<AIComposer
  mode="chat"
  :editor="editor"
  @submit="(value) => log.unshift(editor.serialize('text'))"
/>`,
      },
    },
  },
};
