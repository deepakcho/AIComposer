/**
 * Basic usage — the universal custom element, plain HTML.
 */

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { defineAiComposerEditor } from '../index';

defineAiComposerEditor();

const meta: Meta = {
  title: 'AI Composer/Web Component/Basic',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`<ai-composer-editor>` is a universal custom element — works in React, Angular, Vue, Svelte or plain HTML. Attributes: `mode`, `placeholder`, `disabled`, `readonly`. Properties: `editor`, `plugins`. Events: `aic-change`, `aic-submit`.',
      },
    },
  },
  argTypes: {
    mode: { control: 'select', options: ['compact', 'chat', 'expanded'] },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
  },
  args: { mode: 'chat', placeholder: 'Ask anything…', disabled: false, readonly: false },
  render: (args) => ({
    template: `
      <ai-composer-editor
        mode="${args.mode}"
        placeholder="${args.placeholder}"
        ${args.disabled ? 'disabled' : ''}
        ${args.readonly ? 'readonly' : ''}
      ></ai-composer-editor>
    `,
  }),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `<ai-composer-editor mode="chat" placeholder="Ask anything…"></ai-composer-editor>`,
      },
      description: { story: 'Zero configuration — import the package once (`import "@ai-composer/web-component"`), then use plain HTML.' },
    },
  },
};
