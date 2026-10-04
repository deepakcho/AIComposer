/**
 * States — disabled, readonly, dark theme. All driven by editor state, so
 * they can flip at runtime.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { PromptEditor } from '../index';

const meta: Meta<typeof PromptEditor> = {
  component: PromptEditor,
  tags: ['autodocs'],
  title: 'AI Composer/React/States',
  parameters: {
    docs: {
      description: {
        component:
          'State flags map to `data-aic-*` attributes and ARIA — usable from props, the editor API or reactive forms.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PromptEditor>;

export const Disabled: Story = {
  args: { mode: 'chat', value: 'You cannot edit me', disabled: true },
  parameters: {
    docs: {
      source: { code: '<PromptEditor mode="chat" value="You cannot edit me" disabled />' },
      description: { story: 'Dims and blocks input (aria-disabled + contenteditable=false).' },
    },
  },
};

export const Readonly: Story = {
  args: { mode: 'chat', value: 'Read-only but submittable via API', readonly: true },
  parameters: {
    docs: {
      source: { code: '<PromptEditor mode="chat" value="Read-only…" readonly />' },
      description: { story: 'Selection and copy work; editing does not. Submit still available programmatically.' },
    },
  },
};

export const DarkTheme: Story = {
  args: { mode: 'chat' },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      source: {
        code: `<div data-aic-theme="dark">
  <PromptEditor mode="chat" />
</div>`,
      },
      description: { story: 'Dark tokens are opt-in via `data-aic-theme="dark"` on any ancestor (or the root itself) — import `@ai-composer/themes/css/dark.css`.' },
    },
  },
  decorators: [
    (Story) => (
      <div data-aic-theme="dark" style={{ minHeight: 200 }}>
        <Story />
      </div>
    ),
  ],
};
