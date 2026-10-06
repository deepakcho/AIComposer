/**
 * States — disabled, readonly, dark theme.
 */

import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { h } from 'vue';
import { AIComposer } from '../index';

const meta: Meta = {
  component: AIComposer as never,
  tags: ['autodocs'],
  title: 'AI Composer/Vue/States',
  parameters: {
    docs: {
      description: {
        component: 'State flags map to `data-aic-*` attributes and ARIA — usable as props or via the editor API.',
      },
    },
  },
  args: { mode: 'chat' },
  render: (args) => ({
    components: { AIComposer },
    setup: () => () => h(AIComposer as never, { ...args }),
  }),
};

export default meta;
type Story = StoryObj;

export const Disabled: Story = {
  args: { disabled: true, modelValue: 'You cannot edit me' },
  parameters: {
    docs: { source: { code: '<AIComposer mode="chat" disabled />' } },
  },
};

export const Readonly: Story = {
  args: { readonly: true, modelValue: 'Read-only but submittable via API' },
  parameters: {
    docs: { source: { code: '<AIComposer mode="chat" readonly />' } },
  },
};

export const DarkTheme: Story = {
  args: { placeholder: 'Dark tokens via data-aic-theme' },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      source: {
        code: `<div data-aic-theme="dark">
  <AIComposer mode="chat" />
</div>`,
      },
    },
  },
  render: (args) => ({
    components: { AIComposer },
    setup: () => () =>
      h('div', { 'data-aic-theme': 'dark', style: 'min-height:200px' }, [
        h(AIComposer as never, { ...args }),
      ]),
  }),
};
