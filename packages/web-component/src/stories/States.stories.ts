/**
 * States — disabled, readonly, dark theme.
 */

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { createAIComposer } from '@ai-composer/core';
import { defineAiComposerEditor } from '../index';

defineAiComposerEditor();

const meta: Meta = {
  title: 'AI Composer/Web Component/States',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Boolean attributes for state; dark tokens via `data-aic-theme="dark"` on any ancestor.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Disabled: Story = {
  render: () => {
    const element = document.createElement('ai-composer-editor') as HTMLElement & {
      editor: ReturnType<typeof createAIComposer>;
    };
    element.setAttribute('mode', 'chat');
    element.setAttribute('placeholder', 'Disabled');
    element.setAttribute('disabled', '');
    element.editor = createAIComposer({ value: 'You cannot edit me', disabled: true });
    return element;
  },
  parameters: {
    docs: {
      source: { code: `<ai-composer-editor mode="chat" disabled></ai-composer-editor>` },
    },
  },
};

export const Readonly: Story = {
  render: () => {
    const element = document.createElement('ai-composer-editor');
    element.setAttribute('mode', 'chat');
    element.setAttribute('placeholder', 'Readonly');
    element.setAttribute('readonly', '');
    return element;
  },
  parameters: {
    docs: {
      source: { code: `<ai-composer-editor mode="chat" readonly></ai-composer-editor>` },
    },
  },
};

export const DarkTheme: Story = {
  render: () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div data-aic-theme="dark" style="background:#0d0e12;padding:24px;border-radius:12px">
        <ai-composer-editor mode="chat" placeholder="Dark tokens via data-aic-theme"></ai-composer-editor>
      </div>
    `;
    return root;
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      source: {
        code: `<div data-aic-theme="dark">
  <ai-composer-editor mode="chat"></ai-composer-editor>
</div>`,
      },
    },
  },
};
