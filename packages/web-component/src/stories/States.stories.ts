/**
 * States — disabled, readonly, dark theme.
 */

import type { Meta, StoryObj } from '@storybook/web-components-vite';
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
  render: () => ({
    template: `<ai-composer-editor id="disabled-demo" mode="chat" placeholder="Disabled" disabled></ai-composer-editor>`,
    effects: [
      {
        selector: '#disabled-demo',
        setup: (element: HTMLElement & { value: string }) => {
          element.value = 'You cannot edit me';
        },
      },
    ],
  }),
  parameters: {
    docs: {
      source: { code: `<ai-composer-editor mode="chat" disabled></ai-composer-editor>` },
    },
  },
};

export const Readonly: Story = {
  render: () => ({
    template: `<ai-composer-editor mode="chat" placeholder="Readonly" readonly></ai-composer-editor>`,
  }),
  parameters: {
    docs: {
      source: { code: `<ai-composer-editor mode="chat" readonly></ai-composer-editor>` },
    },
  },
};

export const DarkTheme: Story = {
  render: () => ({
    template: `
      <div data-aic-theme="dark" style="background:#0d0e12;padding:24px;border-radius:12px">
        <ai-composer-editor mode="chat" placeholder="Dark tokens via data-aic-theme"></ai-composer-editor>
      </div>
    `,
  }),
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
