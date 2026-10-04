/**
 * States — disabled, readonly, dark theme.
 */

import type { Meta, StoryObj } from '@storybook/angular';
import { demoEditor } from './utils';

const meta: Meta = {
  tags: ['autodocs'],
  title: 'AI Composer/Angular/States',
  parameters: {
    docs: {
      description: {
        component: 'State flags map to `data-aic-*` attributes and ARIA — via inputs, the editor API or reactive forms.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Disabled: Story = {
  render: () => ({
    props: { editor: demoEditor({ mode: 'chat', value: 'You cannot edit me', disabled: true }) },
    template: `<aic-prompt-editor [editor]="editor" mode="chat" disabled></aic-prompt-editor>`,
  }),
  parameters: {
    docs: {
      source: { code: `<aic-prompt-editor mode="chat" disabled></aic-prompt-editor>` },
    },
  },
};

export const Readonly: Story = {
  render: () => ({
    props: { editor: demoEditor({ mode: 'chat', value: 'Read-only but submittable via API', readonly: true }) },
    template: `<aic-prompt-editor [editor]="editor" mode="chat" readonly></aic-prompt-editor>`,
  }),
  parameters: {
    docs: {
      source: { code: `<aic-prompt-editor mode="chat" readonly></aic-prompt-editor>` },
    },
  },
};

export const DarkTheme: Story = {
  render: () => ({
    props: { editor: demoEditor({ mode: 'chat', placeholder: 'Dark tokens via data-aic-theme' }) },
    template: `
      <div data-aic-theme="dark" style="background:#0d0e12;padding:24px;border-radius:12px">
        <aic-prompt-editor [editor]="editor" mode="chat"></aic-prompt-editor>
      </div>
    `,
  }),
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      source: {
        code: `<div data-aic-theme="dark">
  <aic-prompt-editor mode="chat"></aic-prompt-editor>
</div>`,
      },
    },
  },
};
