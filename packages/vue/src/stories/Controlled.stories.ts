/**
 * v-model & events — Vue state as the source of truth.
 */

import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { defineComponent, h, ref } from 'vue';
import { AIComposer } from '../index';

const meta: Meta = {
  component: AIComposer as never,
  tags: ['autodocs'],
  title: 'AI Composer/Vue/v-model & Events',
  parameters: {
    docs: {
      description: {
        component:
          '`v-model` binds the document two-way; `@change` / `@submit` mirror the editor events. The internal document stays authoritative while editing.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const VModel: Story = {
  name: 'v-model · two-way binding',
  render: () =>
    defineComponent({
      components: { AIComposer },
      setup() {
        const value = ref('Bound via v-model');
        return () =>
          h('div', [
            h(AIComposer as never, {
              mode: 'compact',
              modelValue: value.value,
              'onUpdate:modelValue': (next: unknown) => {
                value.value = next as never;
              },
            }),
            h('p', ['Parent value: ', h('code', JSON.stringify(value.value))]),
          ]);
      },
    }) as never,
  parameters: {
    docs: {
      source: {
        code: `const value = ref('Bound via v-model');

<AIComposer v-model="value" mode="compact" />
<p>Parent value: {{ value }}</p>`,
      },
    },
  },
};

export const EventLog: Story = {
  name: 'Events · change / submit',
  render: () =>
    defineComponent({
      components: { AIComposer },
      setup() {
        const log = ref<string[]>([]);
        const doc = (value: unknown): string =>
          JSON.stringify(value);
        return () =>
          h('div', [
            h(AIComposer as never, {
              mode: 'chat',
              onChange: (value: unknown) => {
                log.value = [`change → ${doc(value)}`, ...log.value.slice(0, 4)];
              },
              onSubmit: (value: unknown) => {
                log.value = [`submit → ${doc(value)}`, ...log.value.slice(0, 4)];
              },
            }),
            h(
              'ul',
              { style: 'font-size:13px;color:#555' },
              log.value.map((line, index) => h('li', { key: index }, [h('code', line)])),
            ),
          ]);
      },
    }) as never,
  parameters: {
    docs: {
      source: {
        code: `<AIComposer
  mode="chat"
  @change="(value) => log('change', value)"
  @submit="(value) => log('submit', value)"
/>`,
      },
    },
  },
};
